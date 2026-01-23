import { Elysia } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';
import { SecurityConfig } from '../../../../config/security.config';
import { createResponse, createErrorResponse } from '../../../../utils/response.helper';

const elysiaApp = new Elysia()
  
  .post('/sessionexpand', async ({ cookie }) => {
    const token = cookie.token.value;
    if (!token) {
        return createErrorResponse('no_user', 'no_cookie');
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .innerJoin("passwords", "passwords.passwordId", "users.password")
        .select([
            'users.userId',
            'users.username',
            'users.2fa',
            'users.2fa_secret',
            'passwords.password'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst()

    if (!user) {
        return createErrorResponse('no_user', 'no_db');
    }

    try {
      const expires = moment().add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES, 'minutes');

      await db.updateTable('tokens')
      .set({
        expires: expires.toDate()
      })
      .where('tokens.token', '=', token)
      .execute();

      return createResponse({ success: true, expires: expires.toDate() }, cookie);
    } catch (e) {
      return createErrorResponse('session_expand_failed', String(e), 500);
    }
  });

export default elysiaApp;
