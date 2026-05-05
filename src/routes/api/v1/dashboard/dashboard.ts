import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/dashboard', async ({ user }: any) => {
    // Auth Check
    if (!user) return { error: 'no_user', details: 'unauthorized' };

    // Parallel execution for performance
    const [unreadMessages, newNotifications, isCookie, modulePositions] = await Promise.all([
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
            .then(r => r?.cookies),

        // Fetch dashboard module positions
        db.selectFrom('user_dashboard_modules')
            .select(['module_id', 'position'])
            .where('user_id', '=', user.user_id)
            .orderBy('position', 'asc')
            .execute()
    ]);
    
    return { unreadMessages, newNotifications, cookies: isCookie, modulePositions };
  })
  .post('/dashboard/positions', async ({ user, body }: any) => {
    // Auth Check
    if (!user) return { error: 'no_user', details: 'unauthorized' };

    const { positions } = body;
    if (!Array.isArray(positions)) return { error: 'invalid_body' };

    await db.transaction().execute(async (trx) => {
        // Delete old positions
        await trx.deleteFrom('user_dashboard_modules')
            .where('user_id', '=', user.user_id)
            .execute();

        // Insert new positions
        if (positions.length > 0) {
            await trx.insertInto('user_dashboard_modules')
                .values(positions.map((p: any) => ({
                    user_id: user.user_id,
                    module_id: p.module_id,
                    position: p.position
                })))
                .execute();
        }
    });

    return { success: true };
  }, {
    body: t.Object({
        positions: t.Array(t.Object({
            module_id: t.String(),
            position: t.Number()
        }))
    })
  });

export default app;
