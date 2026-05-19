import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/messages/update', async ({ cookie, body }) => {
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

    const { message_id, read, confirm, suppress } = body;
    if (message_id == undefined) return { error: 'invalid_body' };

    try {
      const msg_received = await db.selectFrom('messages_receivers')
        .select([
          'messages_receivers.read_at',
          'messages_receivers.confirmed_at',
          'messages_receivers.suppress_at'
        ])
        .where('message_id', '=', message_id)
        .where('messages_receivers.receiver_id', '=', auth.person_id)
        .limit(1)
        .executeTakeFirst();

      let updateMessage: any = {};
      if (read == true && msg_received?.read_at == null) {
        updateMessage.read_at = new Date();
      }
      if (confirm == true && msg_received?.confirmed_at == null) {
        updateMessage.confirmed_at = new Date();
      }
      
      if (suppress != null) {
        updateMessage.suppress_at = suppress ? new Date() : null;
      }

      const message_receiver = await db.updateTable('messages_receivers')
        .set(updateMessage)
        .where('message_id', '=', message_id)
        .where('messages_receivers.receiver_id', '=', auth.person_id)
        .limit(1)
        .executeTakeFirst();

      return { success: true, message_id, read_at: updateMessage.read_at, confirmed_at: updateMessage.confirm };
    } catch(e) {
      return { success: false };
    }
  }, {
    body: t.Object({
      message_id: t.Optional(t.Number()),
      read: t.Optional(t.Boolean()),
      confirm: t.Optional(t.Boolean()),
      suppress: t.Optional(t.Nullable(t.Boolean())),
    }),
  });

export default app;
