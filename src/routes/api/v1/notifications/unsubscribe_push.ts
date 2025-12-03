import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { verifyToken } from '../../../../middleware/auth';

const app = new Elysia()
  .post('/notifications/push/unsubscribe', async ({ cookie, body }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await verifyToken(token);
    if (!user) {
      return Response.json({ error: 'invalid_token' });
    }

    const { endpoint } = body as { endpoint: string };

    await db
      .deleteFrom('push_subscriptions')
      .where('user_id', '=', user.userId)
      .where('endpoint', '=', endpoint)
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
      endpoint: t.String()
    })
  });

export default app;
