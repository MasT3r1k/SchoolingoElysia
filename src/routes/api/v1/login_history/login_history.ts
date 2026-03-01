import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .get('/login_history', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .innerJoin("passwords", 'passwords.password_id', 'users.password_id')
        .select([
            'users.user_id',
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
        let countQuery = db.selectFrom("login_history")
          .select([
              sql`COUNT(*)`.as('count')
          ])
          .where('login_history.user_id', '=', user.user_id);

        let statsQuery = db.selectFrom("login_history")
            .select([
                // MariaDB verze: sečteme 1 tam, kde je success true
                sql<number>`SUM(IF(success = true, 1, 0))`.as('successCount'),
                // Sečteme 1 tam, kde je success false
                sql<number>`SUM(IF(success = false, 1, 0))`.as('failureCount')
            ])
            .where('user_id', '=', user.user_id);

        let listQuery = db.selectFrom("login_history")
            .select([
              'login_history.login_id',
              'login_history.type',
              'login_history.success',
              'login_history.ip',
              'login_history.user_agent',
              'login_history.error',
              'login_history.created',
              'login_history.city',
              'login_history.zip_code',
              'login_history.region_name',
              'login_history.country',
              'login_history.continent',
              'login_history.token_id'
            ])
            .where('login_history.user_id', '=', user.user_id);

        if (query.dateFrom) {
            const dateFrom = moment(query.dateFrom).startOf('day').toDate();
            countQuery = countQuery.where('created', '>=', dateFrom);
            statsQuery = statsQuery.where('created', '>=', dateFrom);
            listQuery = listQuery.where('created', '>=', dateFrom);
        } else {
            // Default stats for last 30 days if no date range is provided
            statsQuery = statsQuery.where('created', '>', sql`NOW() - INTERVAL 30 DAY` as any);
        }

        if (query.dateTo) {
            const dateTo = moment(query.dateTo).endOf('day').toDate();
            countQuery = countQuery.where('created', '<=', dateTo);
            statsQuery = statsQuery.where('created', '<=', dateTo);
            listQuery = listQuery.where('created', '<=', dateTo);
        }

        const count = await countQuery.executeTakeFirst().then(r => Number(r?.count ?? 0));
        const loginStats = await statsQuery.executeTakeFirst();
        const login_history = await listQuery
            .limit(query.limit)
            .offset(query.offset)
            .orderBy('login_history.created', 'desc')
            .execute();

        const validLogins = Number(loginStats?.successCount ?? 0);
        const failedLogins = Number(loginStats?.failureCount ?? 0);

        return Response.json({ count, data: login_history, validLogins, failedLogins });
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
        offset: t.Number({ default: 0, minimum: 0 }),
        dateFrom: t.Optional(t.String()),
        dateTo: t.Optional(t.String())
    })
  });

export default elysiaApp;
