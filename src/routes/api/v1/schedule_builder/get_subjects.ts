import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .get('/schedule/subjects', async ({ cookie, query }: any) => {
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

    const { classId } = query;

    if (classId === undefined) return { error: 'invalid_class_id' };

    const classData = await db.selectFrom("classes")
    .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
    .select([
        'classes.scope_id',
        sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE())`.as('class_index')

    ])
    .where('classes.class_id', '=', classId)
    .executeTakeFirst();
    if (!classData) return { error: 'invalid_class' }

    const time = moment();

    const groups = await db.selectFrom("groups")
    .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')
    .select([
        'groups.group_id',
        'groups.name',
        'groups.num',
        'groups.year_id',
    ])
    .where('school_years.start', '<=', time.format("YYYY-MM-DD") as any)
    .where('school_years.end', '>=', time.format("YYYY-MM-DD") as any)
    .where('groups.class_id', '=', classId)
    .execute()

    const subjects = await db.selectFrom("scopes_subjects")
    .leftJoin('subjects', 'subjects.subject_id', 'scopes_subjects.subject_id')
    .select([
      'subjects.subject_id',
      'subjects.label as subject_name',
      'subjects.shortcut as subject_short',
      'scopes_subjects.hours_per_week',
      'scopes_subjects.is_mandatory',
      'scopes_subjects.color'
    ])
    .where('scopes_subjects.scope_id', '=', classData.scope_id)
    .where('scopes_subjects.year', '=', classData.class_index as number)
    .where('scopes_subjects.hours_per_week', '>=', 1)
    .orderBy('subject_name', 'asc')
    .execute();

    return { classData, groups, subjects };


  }, {
    query: t.Object({
        classId: t.Optional(t.Number())
    })
  });

export default elysiaApp;
