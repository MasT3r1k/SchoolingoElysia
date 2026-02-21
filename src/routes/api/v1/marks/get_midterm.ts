import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/marks/midterm', async ({ cookie, query }: any) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    let student_id = auth.person_id;
    if (query.student_id !== undefined) {
      student_id = query.student_id;
    }

    const student = await db
      .selectFrom('students')
      .leftJoin('classes', 'classes.class_id', 'students.class_id')
      .select([
        'students.person_id',
        'classes.scope_id'
      ])
      .where('students.person_id', '=', student_id)
      .executeTakeFirst();

    if (!student) return { error: 'no_permission' };

    const scopes_subjects = await db.selectFrom('scopes_subjects')
      .leftJoin('subjects', 'subjects.subject_id', 'scopes_subjects.subject_id')
      .select([
        'scopes_subjects.subject_id',
        'subjects.label as subject_name',
        'subjects.shortcut as subject_short',
        'scopes_subjects.is_mandatory'
      ])
      .where('scopes_subjects.hours_per_week', '>', 0)
      .where('scopes_subjects.scope_id', '=', student.scope_id)
      .groupBy('scopes_subjects.subject_id')
      .orderBy('subjects.label', 'asc')
      .execute();

    const semester_grades = await db.selectFrom('semester_grades')
      .select([
        'semester_grades.semester',
        'semester_grades.grade',
        'semester_grades.verbal_assessment',
        'semester_grades.year'
      ])
      .where('semester_grades.student_id', '=', student_id)
      .execute();

    return { subjects: scopes_subjects, marks: semester_grades }

  }, {
    query: t.Object({
      student_id: t.Optional(t.Number())
    })
  });

export default app;
