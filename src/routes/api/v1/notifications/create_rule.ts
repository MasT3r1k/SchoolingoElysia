import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { verifyToken } from '../../../../middleware/auth';

const app = new Elysia()
  .post('/notifications/rules', async ({ cookie, body }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await verifyToken(token);
    if (!user) {
      return Response.json({ error: 'invalid_token' });
    }

    const { type, conditions, enabled } = body as {
      type: string;
      conditions: object;
      enabled: boolean;
    };

    const result = await db
      .insertInto('notification_rules')
      .values({
        user_id: user.userId,
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
