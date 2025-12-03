import { Elysia } from 'elysia';
import { db } from '../../../../../database';
import { verifyToken } from '../../../../middleware/auth';

const app = new Elysia()
  .delete('/notifications/rules/:id', async ({ cookie, params }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await verifyToken(token);
    if (!user) {
      return Response.json({ error: 'invalid_token' });
    }

    const { id } = params;

    await db
      .deleteFrom('notification_rules')
      .where('rule_id', '=', Number(id))
      .where('user_id', '=', user.userId)
      .execute();

    return Response.json({ success: true });
  });

export default app;
