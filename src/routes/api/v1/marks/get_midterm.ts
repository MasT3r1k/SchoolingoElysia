import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/marks/midterm', async ({ cookie, query }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    let student_id = auth.person;
    if (query.student_id != undefined) {
      student_id = query.student_id;
    }

    const student = await db
      .selectFrom('students')
      .leftJoin('classes', 'classes.classId', 'students.class')
      .select([
        'students.personId',
        'classes.scopeId'
      ])
      .where('students.personId', '=', student_id)
      .executeTakeFirst();

    if (!student) return { error: 'no_permission' };

    const scopesSubjects = await db.selectFrom('scopes_subjects')
      .leftJoin('subjects', 'subjects.subjectId', 'scopes_subjects.subject_id')
      .select([
        'scopes_subjects.subject_id',
        'subjects.label as subjectName',
        'subjects.shortcut as subjectShort',
        'scopes_subjects.is_mandatory'
      ])
      .where('scopes_subjects.hours_per_week', '>', 0)
      .where('scopes_subjects.scope_id', '=', student.scopeId)
      .groupBy('scopes_subjects.subject_id')
      .orderBy('subjects.label', 'asc')
      .execute();

    const semesterGrades = await db.selectFrom('semester_grades')
      .select([
        'semester_grades.semester',
        'semester_grades.grade',
        'semester_grades.verbal_assessment',
        'semester_grades.year'
      ])
      .where('semester_grades.student_id', '=', student_id)
      .execute();

    return { subjects: scopesSubjects, marks: semesterGrades }

  }, {
    query: t.Object({
      student_id: t.Optional(t.Number())
    })
  });

export default app;
