import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/devices/list', async ({ cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.tokenId', 'tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    const devices = await db.selectFrom('tokens')
    .leftJoin('login_history', 'login_history.token_id', 'tokens.tokenId')
    .select([
        'tokens.tokenId as device_id',
        'tokens.userAgent',
        'tokens.expires',
        'login_history.ip',
        'login_history.city',
        'login_history.country',
        'login_history.country_code',
    ])
    .where('tokens.userId', '=', auth.userId)
    .where('tokens.expires', '>=', new Date())
    .orderBy('tokens.expires', 'desc')
    .execute();

    return devices.map((device) => ({
        ...device,
        current: device.device_id == auth.tokenId
    }));
  });

export default app;
