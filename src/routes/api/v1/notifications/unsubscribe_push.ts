import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/notifications/push/unsubscribe', async ({ cookie, body }) => {
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

    const { endpoint } = body as { endpoint: string };

    await db
      .deleteFrom('push_subscriptions')
      .where('user_id', '=', user.user_id)
      .where('endpoint', '=', endpoint)
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
      endpoint: t.String()
    })
  });

export default app;
