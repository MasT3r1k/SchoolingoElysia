import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/marks/midterm/student', async ({ cookie, query }: any) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .leftJoin('teachers', 'teachers.person_id', 'users.person_id')
      .select(['tokens.user_id', 'users.person_id', 'teachers.person_id as teacher_person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    // Teacher check
    if (!auth.teacher_person_id) {
      return { error: 'no_permission', details: 'not_teacher' };
    }

    const { student_id, subject_id } = query;

    if (student_id === undefined || subject_id === undefined) {
      return { error: 'missing_params' };
    }

    // Find student
    const student = await db
      .selectFrom('students')
      .select([
        'students.person_id',
        'students.status'
      ])
      .where('students.person_id', '=', student_id)
      .executeTakeFirst();

    if (!student) {
      return { error: 'student_not_found' };
    }

    if (student.status === 'former') {
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
      .where('semester_grades.student_id', '=', student.person_id)
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
