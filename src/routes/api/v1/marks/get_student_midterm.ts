import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/marks/midterm/student', async ({ cookie, query }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .leftJoin('teachers', 'teachers.personId', 'users.person')
      .select(['tokens.userId', 'users.person', 'teachers.personId'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    // Teacher check
    if (!auth.personId) {
      return { error: 'no_permission', details: 'not_teacher' };
    }

    const { student_id, subject_id } = query;

    if (student_id == undefined || subject_id == undefined) {
      return { error: 'missing_params' };
    }

    // Find student by name
    const student = await db
      .selectFrom('students')
      .select([
        'students.personId',
        'students.status'
      ])
      .where('students.personId', '=', student_id)
      .executeTakeFirst();

    if (!student) {
      return { error: 'student_not_found' };
    }

    if (student.status == 'archive') {
      return { error: 'student_is_not_on_school' }
    }

    // Get all semester grades for this student and subject
    const grades = await db
      .selectFrom('semester_grades')
      .select([
        'semester_grades.semester as quarter',
        'semester_grades.grade',
        'semester_grades.verbal_assessment',
        'semester_grades.year'
      ])
      .where('semester_grades.student_id', '=', student.personId)
      .where('semester_grades.subject_id', '=', subject_id)
      .execute();

    return { 
      success: true, 
      grades: grades.map(g => ({
        quarter: g.quarter,
        grade: g.grade
      }))
    };

  }, {
    query: t.Object({
      student_id: t.Optional(t.Number()),
      subject_id: t.Optional(t.Number()),
    })
  });

export default app;
