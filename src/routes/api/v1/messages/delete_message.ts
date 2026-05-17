import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { permissions } from '../../../../middleware/permission.middleware';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

const app = new Elysia()
  .delete('/messages/delete', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager', 'users.principal'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };
    const message_id = query.message_id;
    if (message_id == undefined) return { error: 'no_message_id' }

    let baseQuery = await db
      .selectFrom('messages')
      .select([
        'messages.message_id',
        'messages.author_id'
      ])
      .where('messages.message_id', '=', message_id)
      .where('messages.type', 'not in', [1])
      .limit(1)
      .execute();

    if (!baseQuery.length) {
        return { error: 'message_not_found' }
    }

    const msg = baseQuery[0];
    const isAuthor = msg.author_id === auth.user_id;
    const hasAdminAccess = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.MESSAGES_DELETE);

    if (!isAuthor && !hasAdminAccess) {
        return { error: 'no_permission' };
    }

    const receivers = await db.selectFrom('messages_receivers')
    .select(
        db.fn.count("messages_receivers.message_id").as("count")
    )
    .where('messages_receivers.read_at', 'is not', null)
    .where('messages_receivers.message_id', '=', message_id)
    .executeTakeFirst();

    const receiverCount = Number(receivers?.count ?? 0);

    if (receiverCount && !hasAdminAccess) {
        return { error: 'cannot_delete_message' }
    }

    try {
        await db.transaction().execute(async (trx) => {
            await trx
            .deleteFrom('messages_receivers')
            .where('message_id', '=', message_id)
            .execute();

            await trx
            .deleteFrom('messages')
            .where('message_id', '=', message_id)
            .execute();
        });

        return {
            success: true,
        };
    } catch (error) {
        console.error("Chyba při mazání zprávy:", error);
        return { error: 'database_error', details: 'failed_to_delete' };
    }
  }, {
    query: t.Object({
      message_id: t.Optional(t.Number())
    })
  });

export default app;
