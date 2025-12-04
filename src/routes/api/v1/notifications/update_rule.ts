import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .put('/notifications/rules/:id', async ({ cookie, params, body }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        'tokens.userId',
        'users.person',
    ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!user?.person) return { error: 'no_user', details: 'no_db' };

    const { id } = params;
    const { type, conditions, enabled } = body as {
      type?: string;
      conditions?: object;
      enabled?: boolean;
    };

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (conditions !== undefined) updateData.conditions = JSON.stringify(conditions);
    if (enabled !== undefined) updateData.enabled = enabled;

    await db
      .updateTable('notification_rules')
      .set(updateData)
      .where('rule_id', '=', Number(id))
      .where('user_id', '=', user.userId)
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
      type: t.Optional(t.String()),
      conditions: t.Optional(t.Any()),
      enabled: t.Optional(t.Boolean())
    })
  });

export default app;
