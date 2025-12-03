import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { verifyToken } from '../../../../middleware/auth';

const app = new Elysia()
  .post('/notifications/push/subscribe', async ({ cookie, body }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await verifyToken(token);
    if (!user) {
      return Response.json({ error: 'invalid_token' });
    }

    const { endpoint, p256dh, auth } = body as {
      endpoint: string;
      p256dh: string;
      auth: string;
    };

    // Check if subscription already exists
    const existing = await db
      .selectFrom('push_subscriptions')
      .selectAll()
      .where('user_id', '=', user.userId)
      .where('endpoint', '=', endpoint)
      .executeTakeFirst();

    if (existing) {
      return Response.json({ success: true, subscription_id: existing.subscription_id });
    }

    const result = await db
      .insertInto('push_subscriptions')
      .values({
        user_id: user.userId,
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
