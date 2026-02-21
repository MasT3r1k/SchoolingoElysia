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
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select([
        'tokens.user_id',
        'users.person_id',
    ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const { id } = params;

    await db
      .deleteFrom('notification_rules')
      .where('rule_id', '=', Number(id))
      .where('user_id', '=', auth.user_id)
      .execute();

    return Response.json({ success: true });
  });

export default app;
