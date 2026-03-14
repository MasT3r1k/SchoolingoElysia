import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .get('/messages/received', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const totalRows = await db.selectFrom('messages_receivers')
    .leftJoin('messages', 'messages.message_id', 'messages_receivers.message_id')
    .select(sql`COUNT(*)`.as('count'))
    .where('messages_receivers.receiver_id', '=', auth.person_id)
    .where('messages.type', 'in', [0, 1, 2, 3])
    .executeTakeFirst()
    .then(r => Number(r?.count ?? 0));

    const messagesDB = await db.selectFrom('messages_receivers')
    .leftJoin('messages', 'messages.message_id', 'messages_receivers.message_id')
    .leftJoin('persons', 'messages.author_id', 'persons.person_id')
    .select([
        'messages.message_id',
        'messages.topic',
        'messages.message',
        'messages.author_id',
        'persons.first_name',
        'persons.last_name',
        'messages.sent_at',
        'messages.deleted',
        'messages.require_confirm',
        'messages_receivers.read_at',
        'messages_receivers.confirmed_at'
    ])
    .where('messages.type', 'in', [0, 1, 2, 3])
    .where('messages_receivers.receiver_id', '=', auth.person_id)
    .offset(query.offset || 0)
    .limit(query.limit || 20)
    .execute()

    if (!messagesDB.length) return;

    const people_ids = Array.from( new Set(messagesDB.map((m) => m.author_id!)) );
    const people = await format_person_map_by_ids(people_ids);

    const messages = messagesDB.map((message, index) => ({
        ...message,
        author: {
            first_name: message.first_name,
            last_name: message.last_name,
            full_name: people.get(message.author_id as number)
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
