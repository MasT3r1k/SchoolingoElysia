import { Elysia } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/notifications/rules', async ({ cookie }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }
    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        'tokens.userId',
        'users.person',
    ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    const rules = await db
      .selectFrom('notification_rules')
      .selectAll()
      .where('user_id', '=', auth.userId)
      .execute();

    return Response.json({ rules });
  });

export default app;
