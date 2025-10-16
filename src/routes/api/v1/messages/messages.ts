import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/messages/send', async ({ cookie, body }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .select(['tokens.userId'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    const { content, receivers } = body as { content: string; receivers: number[] };
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return Response.json({ error: 'invalid_content' });
    }
    if (!Array.isArray(receivers) || receivers.length === 0) {
      return Response.json({ error: 'invalid_receivers' });
    }

    // Insert message
    const inserted = await db
      .insertInto('messages')
      .values({ senderId: auth.userId, content })
      .executeTakeFirstOrThrow();

    // MySQL with Kysely: get inserted id via lastInsertId
    const messageId = (inserted as any).insertId as number | undefined;

    if (!messageId) {
      return Response.json({ error: 'insert_failed' });
    }

    // Insert receivers
    const receiverRows = receivers.map((receiverId) => ({ messageId, receiverId, status: 'sent' as const }));
    await db.insertInto('messages_receivers').values(receiverRows).execute();

    return Response.json({ status: true, messageId });
  }, {
    body: t.Object({
      content: t.String(),
      receivers: t.Array(t.Number())
    })
  });

export default app;


