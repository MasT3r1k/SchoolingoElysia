import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { PermissionService } from '../../../../functions/permission.service';

const app = new Elysia()
  .get('/marks/teacher/list', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select([
        'tokens.user_id',
        'users.person_id',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    const hasPerm = await PermissionService.hasPermission(auth.user_id, 'teacher');

    if (!hasPerm) {
      return Response.json({ error: 'no_permission' });
    }

    const groups = await db
      .selectFrom('timetable')
      .innerJoin('student_groups', 'student_groups.group_id', 'timetable.group_id')
      .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
      .innerJoin('classes', 'classes.class_id', 'groups.class_id')
      .innerJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .innerJoin('subjects', 'subjects.subject_id', 'timetable.subject_id')
      .select([
        'timetable.group_id',
        'subjects.subject_id',
        'subjects.label as subject',
        'subjects.shortcut as shortSubject',
        db.fn.count('student_groups.student_id').as('studentCount'),
        sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
      ])
      .where('timetable.teacher_id', '=', auth.person_id)
      .groupBy(['timetable.group_id', 'timetable.subject_id', 'classes.prefix', 'classes.suffix', 'school_years.start'])
      .execute();

    return Response.json({ status: true, groups });
  }, {
    query: t.Optional(t.Object({
      limit: t.Number({ default: 0 }),
      offset: t.Number({ default: 0 }),
    })),
  });

export default app;
