import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/dashboard', async ({ user }: any) => {
    // Auth Check
    if (!user) return { error: 'no_user', details: 'unauthorized' };

    // Parallel execution for performance
    const [unreadMessages, newNotifications, isCookie] = await Promise.all([
        // Count of unread received messages
        db.selectFrom('messages_receivers')
            .leftJoin('messages', 'messages.message_id', 'messages_receivers.message_id')
            .select([sql`COUNT(*)`.as('count')])
            .where('messages.type', '=', 0)
            .where('messages_receivers.read_at', 'is', null)
            .where('messages_receivers.receiver_id', '=', user.person_id)
            .executeTakeFirst()
            .then(r => Number(r?.count ?? 0)),

        // Count of unread notifications
        db.selectFrom('notifications')
            .select([sql`COUNT(*)`.as('count')])
            .where('notifications.read_at', 'is', null)
            .where('notifications.user_id', '=', user.user_id)
            .executeTakeFirst()
            .then(r => Number(r?.count ?? 0)),

        // Check if cookies is accepted
        db.selectFrom('users')
            .select(['users.cookies'])
            .where('users.user_id', '=', user.user_id)
            .executeTakeFirst()
            .then(r => r?.cookies)
    ]);
    
    return { unreadMessages, newNotifications, cookies: isCookie };
  });

export default app;
