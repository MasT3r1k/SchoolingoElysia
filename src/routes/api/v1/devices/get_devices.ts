import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/devices/list', async ({ cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.token_id', 'tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const devices = await db.selectFrom('tokens')
    .leftJoin('login_history', 'login_history.token_id', 'tokens.token_id')
    .select([
        'tokens.token_id as device_id',
        'tokens.user_agent',
        'tokens.expires',
        'login_history.ip',
        'login_history.city',
        'login_history.country',
        'login_history.country_code',
    ])
    .where('tokens.user_id', '=', auth.user_id)
    .where('tokens.expires', '>=', new Date())
    .orderBy('tokens.expires', 'desc')
    .execute();

    return devices.map((device) => ({
        ...device,
        current: device.device_id == auth.token_id
    }));
  });

export default app;
