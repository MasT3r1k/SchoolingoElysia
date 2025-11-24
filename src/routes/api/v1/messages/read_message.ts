import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .post('/messages/update', async ({ cookie, body }) => {
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

    const { message_id, read, confirm } = body;
    if (message_id == undefined) return { error: 'invalid_body' };

    try {
      let updateMessage: any = {};
      if (read == true) {
        updateMessage.read_at = new Date();
      }
      if (confirm == true) {
        updateMessage.confirm = new Date();
      }

      const messageRead = await db.updateTable('messages_receivers')
      .set(updateMessage)
      .where('message_id', '=', message_id)
      .where('messages_receivers.receiver_id', '=', auth.person)
      .limit(1)
      .execute();

      return { success: true };
    } catch(e) {
      return { success: false };
    }
  }, {
    body: t.Object({
      message_id: t.Optional(t.Number()),
      read: t.Optional(t.Boolean()),
      confirm: t.Optional(t.Boolean())
    }),
  });

export default app;
