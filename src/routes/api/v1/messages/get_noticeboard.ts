import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { OrWrapper, sql } from 'kysely';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .get('/messages/noticeboard', async ({ cookie, query }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return { error: 'no_user', details: 'no_db' };

    const totalRows = await db.selectFrom('messages')
    .select(sql`COUNT(*)`.as('count'))
    .where('messages.type', '=', 1)
    .executeTakeFirst()
    .then(r => Number(r?.count ?? 0));

    const messagesDB = await db.selectFrom('messages')
    .leftJoin('persons', 'messages.author_id', 'persons.personId')
    .leftJoin('messages_receivers', (join) =>
        join
        .onRef('messages.message_id', '=', 'messages_receivers.message_id')
        .on('messages_receivers.receiver_id', '=', auth.person)
  )
    .select([
        'messages.message_id',
        'messages.topic',
        'messages.message',
        'messages.author_id',
        'persons.firstName',
        'persons.lastName',
        'messages.sent_at',
        'messages.deleted',
        'messages.require_confirm',
        'messages_receivers.read_at',
        'messages_receivers.confirmed_at',
    ])
    .where('messages.type', '=', 1)
    .offset(query.offset || 0)
    .limit(query.limit || 20)
    .execute()

    if (!messagesDB) return { error: 'failed_load_messages' };

    const people_ids = Array.from( new Set(messagesDB.map((m) => m.author_id!)) );
    const people = await format_people_by_ids(people_ids);

    const messages = messagesDB.map((message, index) => ({
        ...message,
        firstName: undefined,
        lastName: undefined,
        author: {
            first_name: message.firstName,
            last_name: message.lastName,
            full_name: people[people_ids.findIndex((person) => person == message.author_id)]
        }
    }))

    return { total: totalRows, messages };
  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ default: 20, minimum: 0, maximum: 100 })),
      offset: t.Optional(t.Number({ default: 0, minimum: 0 })),
    }),
  });

export default app;