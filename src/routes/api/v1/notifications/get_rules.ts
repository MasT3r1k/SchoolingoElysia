import { Elysia } from 'elysia';
import { db } from '../../../../../database';
import { verifyToken } from '../../../../middleware/auth';

const app = new Elysia()
  .get('/notifications/rules', async ({ cookie }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await verifyToken(token);
    if (!user) {
      return Response.json({ error: 'invalid_token' });
    }

    const rules = await db
      .selectFrom('notification_rules')
      .selectAll()
      .where('user_id', '=', user.userId)
      .execute();

    return Response.json({ rules });
  });

export default app;
