import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/messages/new_noticeboard', async ({ cookie, body }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    const { topic, message } = body;
    if (topic == undefined || message == undefined) return { error: 'invalid_body' };

    try {
      const messageDB = await db.insertInto('messages')
      .values({
            type: 1,
            topic,
            message,
            author_id: auth.person,
        })
      .executeTakeFirst();

      return { success: true, message_id: Number(messageDB.insertId) };
    } catch(e) {
      return { success: false };
    }
  }, {
    body: t.Object({
      topic: t.Optional(t.String()),
      message: t.Optional(t.String())
    }),
  });

export default app;
