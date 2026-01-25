import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/marks/midterm/students', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
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

    const { students_id, subject_id, year } = query;

    if (students_id == undefined || subject_id == undefined || year == undefined) {
      return { error: 'missing_params' };
    }

    // Find student by name
    const students = await db
      .selectFrom('students')
      .select([
        'students.personId',
        'students.status'
      ])
      .where('students.personId', 'in', students_id)
      .execute();

    if (!students.length) {
      return { error: 'student_not_found' };
    }

    const studentList = students.filter((student) => student.status !== 'former');

    // Get all semester grades for this student and subject
    const grades = await db
      .selectFrom('semester_grades')
      .select([
        'semester_grades.student_id',
        'semester_grades.semester as quarter',
        'semester_grades.grade',
        'semester_grades.verbal_assessment',
        'semester_grades.year'
      ])
      .where('semester_grades.student_id', 'in', studentList.map((student) => student.personId))
      .where('semester_grades.subject_id', '=', subject_id)
      .where('semester_grades.year', '=', year)
      .execute();

    return {
      success: true,
      grades: grades.map(g => ({
        student_id: g.student_id,
        quarter: g.quarter,
        grade: g.grade
      }))
    };

  }, {
    query: t.Object({
      students_id: t.Optional(t.Array(t.Number())),
      subject_id: t.Optional(t.Number()),
      year: t.Optional(t.Number())
    })
  });

export default app;
