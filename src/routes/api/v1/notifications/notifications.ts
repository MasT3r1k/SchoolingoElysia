import Elysia, { t } from "elysia";
import { db } from "../../../../../database";

const app = new Elysia()
  .get('/notifications', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    const notifications = await db.selectFrom('notifications')
    .select([
        'notification_id',
        'notifications.type',
        'notifications.data',
        'notifications.url',
        'notifications.read_at',
        'notifications.created_at'
    ])
    .where('notifications.user_id', '=', auth.userId)
    .execute();
   
    return notifications;

  });

export default app;
