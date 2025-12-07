import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/dashboard', async ({ cookie }) => {
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

    // === Count of unread received messages ===
    const unreadMessages = await db.selectFrom('messages_receivers')
    .leftJoin('messages', 'messages.message_id', 'messages_receivers.message_id')
    .select([
        sql`COUNT(*)`.as('count')
    ])
    .where('messages.type', '=', 0)
    .where('messages_receivers.read_at', 'is', null)
    .where('messages_receivers.receiver_id', '=', auth.person)
    .executeTakeFirst()
    .then(r => Number(r?.count ?? 0));

    // === Count of unread notifications ===
    const newNotifications = await db.selectFrom('notifications')
    .select([
        sql`COUNT(*)`.as('count')
    ])
    .where('notifications.read_at', 'is', null)
    .where('notifications.user_id', '=', auth.userId)
    .executeTakeFirst()
    .then(r => Number(r?.count ?? 0));

    // === Check if cookies is accepted ===
    const isCookie = await db.selectFrom('users')
    .select([
        'users.cookies'
    ])
    .where('users.userId', '=', auth.userId)
    .executeTakeFirst()
    .then(r => r?.cookies)
    
    return { unreadMessages, newNotifications, cookies: isCookie };
  });

export default app;
