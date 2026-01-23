import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .get('/schedule/classes', async ({ cookie, query }) => {
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

    const classes = await db.selectFrom("classes")
    .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
    .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
    .select([
        'classes.classId',
        sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
    ])
    .where(sql`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE())`, '<', sql`scopes.years`)
    .execute()

    return { classes }

  });

export default elysiaApp;
