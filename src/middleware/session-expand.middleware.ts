import { Elysia } from 'elysia';
import { db } from '../../database';
import { SecurityConfig } from '../config/security.config';
import moment from 'moment';

export const sessionMiddleware = new Elysia()
  .onBeforeHandle(async ({ cookie }) => {
    const token = cookie?.token?.value;
    if (!token) return;

    // 1) Najdi session
    const session = await db
      .selectFrom('tokens')
      .select(['tokens.expires'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!session) return;

    const now = Date.now();
    const exp = new Date(session.expires).getTime();
    const remaining = exp - now;

    // 2) Expired session
    if (remaining <= 0) {
      cookie.token.set({
        httpOnly: true,
        secure: false,
        value: '',
        path: '/',
        maxAge: 0
      });
      return;
    }

    // 3) Sliding session — vždy prodluž
    const newExpires = moment().add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES, 'minutes');

    await db
      .updateTable('tokens')
      .set({ expires: newExpires.toDate() })
      .where('tokens.token', '=', token)
      .executeTakeFirst();

    cookie.token.set({
      httpOnly: true,
      secure: false,
      value: token,
      path: '/',
      maxAge: 2592000000, // 30 dní v cookie
      expires: newExpires.toDate()
    });
  });
