import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/marks/teacher/list', async ({ cookie, query }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    const teacher = await db.selectFrom('teachers')
      .select(['teachers.personId'])
      .where('teachers.personId', '=', auth.person)
      .limit(1)
      .execute();

    if (!teacher.length) {
      return Response.json({ error: 'no_permission' });
    }

    const groups = await db
      .selectFrom('timetable')
      .innerJoin('student_groups', 'student_groups.groupId', 'timetable.groupId')
      .innerJoin('groups', 'groups.groupId', 'timetable.groupId')
      .innerJoin('classes', 'classes.classId', 'groups.class')
      .innerJoin('school_years', 'school_years.syId', 'classes.yearId')
      .innerJoin('subjects', 'subjects.subjectId', 'timetable.subject')
      .select([
        'timetable.groupId',
        'subjects.subjectId',
        'subjects.label as subject',
        'subjects.shortcut as shortSubject',
        db.fn.count('student_groups.student').as('studentCount'),
        sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
      ])
      .where('timetable.teacher', '=', auth.person)
      .groupBy(['timetable.groupId', 'timetable.subject', 'classes.prefix', 'classes.suffix', 'school_years.start'])
      .execute();

    return Response.json({ status: true, groups });
  }, {
    query: t.Optional(t.Object({
      limit: t.Number({ default: 0 }),
      offset: t.Number({ default: 0 }),
    })),
  });

export default app;
