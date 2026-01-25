import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/notifications/rules', async ({ cookie, body }) => {
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

    const { type, conditions, enabled } = body as {
      type: string;
      conditions: object;
      enabled: boolean;
    };

    const result = await db
      .insertInto('notification_rules')
      .values({
        user_id: auth.userId,
        type,
        conditions: JSON.stringify(conditions),
        enabled: enabled ?? true,
      })
      .executeTakeFirst();

    return Response.json({ 
      success: true, 
      rule_id: Number(result.insertId) 
    });
  }, {
    body: t.Object({
      type: t.String(),
      conditions: t.Any(),
      enabled: t.Optional(t.Boolean())
    })
  });

export default app;
