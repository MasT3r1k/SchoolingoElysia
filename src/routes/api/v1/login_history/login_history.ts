import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .get('/login_history', async ({ cookie, query }) => {
    const token = cookie.token.value;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
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
        return Response.json({ error: 'no_user', details: 'no_db' });
    }

    try {
        const count = await db.selectFrom("login_history")
            .select([
                sql`COUNT(*)`.as('count')
            ])
            .where('login_history.userId', '=', user.userId)
            .executeTakeFirst()
            .then(r => Number(r?.count ?? 0));

        const login_history = await db.selectFrom("login_history")
            .select([
              'login_history.loginId',
              'login_history.type',
              'login_history.success',
              'login_history.ip',
              'login_history.userAgent',
              'login_history.error',
              'login_history.created'
            ])
            .limit(query.limit)
            .offset(query.offset)
            .orderBy('login_history.created', 'desc')
            .where('login_history.userId', '=', user.userId)
            .execute();

        return Response.json({ count, data: login_history });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Failed load data", e }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }, {
    query: t.Object({
        limit: t.Number({ default: 10, maximum: 100, minimum: 1 }),
        offset: t.Number({ default: 0, minimum: 0 })
    })
  });

export default elysiaApp;
