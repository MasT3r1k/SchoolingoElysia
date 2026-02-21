import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .get('/messages/list', async ({ cookie, query }) => {
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

    let baseQuery = db
      .selectFrom('messages_receivers')
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
      .groupBy('messages.message_id')
      .where('messages.type', '=', 0)

    if (query.receiver_id) {
      baseQuery = baseQuery.where('messages_receivers.receiver_id', '=', query.receiver_id);
    }

    /* 🔹 cursor pagination */
    if (query.from_id) {
      baseQuery = baseQuery.where('messages.message_id', '<', query.from_id);
    }

    /* 🔹 odesílatelé */
    if (query.author_ids?.length) {
        baseQuery = baseQuery.where(
            'messages.author_id', 'in', query.author_ids
        );
    }

    /* 🔹 text zprávy */
    if (query.q) {
      baseQuery = baseQuery.where(
        sql`LOWER(messages.message) LIKE ${'%' + query.q.toLowerCase() + '%'}`
      );
    }

    /* 🔹 přílohy */
    if (query.has_attachments !== undefined) {
      baseQuery = baseQuery.where(
        sql`
          ${
            query.has_attachments
              ? sql`EXISTS (
                    SELECT 1 FROM messages_files ma
                    WHERE ma.message_id = messages.message_id
                  )`
              : sql`NOT EXISTS (
                    SELECT 1 FROM messages_files ma
                    WHERE ma.message_id = messages.message_id
                  )`
          }
        `
      );
    }

    /* 🔹 datum */
    if (query.sent_after) {
      baseQuery = baseQuery.where(
        'messages.sent_at',
        '>=',
        new Date(query.sent_after)
      );
    }

    if (query.sent_before) {
      baseQuery = baseQuery.where(
        'messages.sent_at',
        '<=',
        new Date(query.sent_before)
      );
    }

    console.log(baseQuery)

    const messagesDB = await baseQuery
      .orderBy('messages.message_id', 'desc')
      .limit(query.limit ?? 20)
      .execute();

    console.log(messagesDB);

    if (!messagesDB.length) {
      return { messages: [], next_from_id: null };
    }

    /* 🔹 autoři */
    const people_ids = [...new Set(messagesDB.map(m => m.author_id!))];
    const people = await format_people_by_ids(people_ids);

    const messages = messagesDB.map(m => ({
      ...m,
      firstName: undefined,
      lastName: undefined,
      author: {
        first_name: m.first_name,
        last_name: m.lastName,
        full_name: people[people_ids.indexOf(m.author_id!)]
      }
    }));

    return {
      messages,
      next_from_id: messages[messages.length - 1].message_id
    };
  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 15 })),
      from_id: t.Optional(t.Number()),
      receiver_id: t.Optional(t.Number()),
      author_ids: t.Optional(t.Array(t.Number())),
      q: t.Optional(t.String()),
      has_attachments: t.Optional(t.Boolean()),
      sent_after: t.Optional(t.String()),
      sent_before: t.Optional(t.String())
    })
  });

export default app;
