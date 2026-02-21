import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/notifications/push/subscribe', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select([
        'tokens.user_id',
        'users.person_id',
    ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!user?.person) return { error: 'no_user', details: 'no_db' };

    const { endpoint, p256dh, auth } = body as {
      endpoint: string;
      p256dh: string;
      auth: string;
    };

    // Check if subscription already exists
    const existing = await db
      .selectFrom('push_subscriptions')
      .selectAll()
      .where('user_id', '=', user.user_id)
      .where('endpoint', '=', endpoint)
      .executeTakeFirst();

    if (existing) {
      return Response.json({ success: true, subscription_id: existing.subscription_id });
    }

    const result = await db
      .insertInto('push_subscriptions')
      .values({
        user_id: user.user_id,
        endpoint,
        p256dh,
        auth,
      })
      .executeTakeFirst();

    return Response.json({ 
      success: true, 
      subscription_id: Number(result.insertId) 
    });
  }, {
    body: t.Object({
      endpoint: t.String(),
      p256dh: t.String(),
      auth: t.String()
    })
  });

export default app;
