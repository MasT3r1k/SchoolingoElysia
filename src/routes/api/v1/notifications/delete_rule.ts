import { Elysia } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .delete('/notifications/rules/:id', async ({ cookie, params }) => {
    const token = cookie.token?.value as string;
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

    const { id } = params;

    await db
      .deleteFrom('notification_rules')
      .where('rule_id', '=', Number(id))
      .where('user_id', '=', auth.userId)
      .execute();

    return Response.json({ success: true });
  });

export default app;
