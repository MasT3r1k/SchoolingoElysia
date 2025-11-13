import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  .use(rateLimit({
    scoping: "scoped",
    max: 10,
    duration: 1000,
    injectServer: () => app.server
  }))
  .get('/schedule/subjects', async ({ cookie, query }) => {
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

    const { classId } = query;

    if (classId == undefined) return { error: 'invalid_class_id' };

    const classData = await db.selectFrom("classes")
    .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
    .select([
        'classes.scopeId',
        sql`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('classIndex')

    ])
    .where('classes.classId', '=', classId)
    .executeTakeFirst();
    if (!classData) return { error: 'invalid_class' }

    const time = moment();

    const groups = await db.selectFrom("groups")
    .leftJoin('school_years', 'school_years.syId', 'groups.year')
    .select([
        'groups.groupId',
        'groups.name',
        'groups.num',
        'groups.year',
    ])
    .where('school_years.start', '<=', time.format("YYYY-MM-DD"))
    .where('school_years.end', '>=', time.format("YYYY-MM-DD"))
    .where('groups.class', '=', classId)
    .execute()

    const subjects = await db.selectFrom("scopes_subjects")
    .leftJoin('subjects', 'subjects.subjectId', 'scopes_subjects.subject_id')
    .select([
      'subjects.subjectId',
      'subjects.label as subjectName',
      'subjects.shortcut as subjectShort',
      'scopes_subjects.hours_per_week',
      'scopes_subjects.is_mandatory',
      'scopes_subjects.color'
    ])
    .where('scopes_subjects.scope_id', '=', classData.scopeId)
    .where('scopes_subjects.year', '=', classData.classIndex as number)
    .execute();

    return { classData, groups, subjects };


  }, {
    query: t.Object({
        classId: t.Optional(t.Number())
    })
  });

export default elysiaApp;
