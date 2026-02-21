import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .get('/schedule/classes', async ({ cookie, query, school }: any) => {
    const token = cookie.token?.value as string;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .innerJoin("passwords", "passwords.password_id", 'users.password_id')
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

    const classes = await db.selectFrom("classes")
    .innerJoin('users', 'users.person_id', 'classes.teacher_id')
    .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
    .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
    .select([
        'classes.class_id',
        sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
    ])
    .where('users.school_id', '=', (school as any).school_id)
    .where(sql`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE())`, '<', sql`scopes.years`)
    .execute()

    return { classes }

  });

export default elysiaApp;
