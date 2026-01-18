import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { format_person_by_id } from '../../../../functions/format_person_by_id';
import { MainConfig } from '../../../../config/main.config';
import moment from 'moment';

const app = new Elysia()
  .post('/marks/teacher/group', async ({ cookie, body, query }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    if (!body?.group_id) return { error: 'invalid_group_id' };
    if (!body?.subject_id) return { error: 'invalid_subject_id' };

    // Get current school year
    const now = moment();
    const currentYear = now.month() >= MainConfig.SEMESTER_START_MONTH ? now.year() : now.year() - 1;

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        'tokens.userId',
        'users.person',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .limit(1)
      .executeTakeFirst();

    if (!auth) return { error: 'no_user', details: 'no_db' };
    if (auth.role != "teacher") return { error: 'no_permission' };

    const students = await db
      .selectFrom('student_groups')
      .leftJoin('users', 'users.person', 'student_groups.student')
      .leftJoin('persons', 'persons.personId', 'users.person')
      .select(['student_groups.student'])
      .where('student_groups.groupId', '=', body.group_id)
      .orderBy('persons.lastName', 'asc')
      .orderBy('persons.firstName', 'asc')
      .execute();

    const gradeColumns = await db
      .selectFrom('grades_columns')
      .select([
        'columnIndex',
        'gcId',
        'topic',
        'type',
        'weight',
        'created'
      ])
      .where('grades_columns.groupId', '=', body.group_id)
      .where('grades_columns.subjectId', '=', body.subject_id)
      .orderBy('columnIndex')
      .execute();

    let grades: any;
    if (gradeColumns.length) {
      grades = await db
        .selectFrom('grades')
        .select(['mark', 'studentId', 'columnId'])
        .where('grades.columnId', 'in', gradeColumns.map((c: any) => c.gcId))
        .execute();
    }

    const semester_grades = await db
      .selectFrom('semester_grades')
      .select([
        'semester_grades.student_id',
        'semester_grades.semester as quarter',
        'semester_grades.grade',
        'semester_grades.verbal_assessment',
        'semester_grades.year'
      ])
      .where('semester_grades.student_id', 'in', students.map((student) => student.student))
      .where('semester_grades.subject_id', '=', body.subject_id)
      .where('semester_grades.year', '=', currentYear)
      .execute();

    // Připravíme strukturu pro výsledky
    const columns = gradeColumns.map((c: any) => ({
      columnId: c.gcId,
      topic: c.topic,
      type: c.type,
      weight: c.weight,
      created: c.created,
    }));

    const studentsWithMarks = await Promise.all(students.map(async (s: any) => {
      const studentMarks = gradeColumns.map((col: any) => {
        const grade = grades.find((g: any) => g.studentId === s.student && g.columnId === col.gcId);
        return grade ? grade.mark : null;
      });

      const name = await format_person_by_id(s.student);

      return {
        studentId: s.student,
        name,
        quarters: semester_grades.filter((g: any) => g.student_id === s.student).map((g: any) => ({
          quarter: g.quarter,
          grade: g.grade,
          verbal_assessment: g.verbal_assessment
        })),
        marks: studentMarks,
      };
    }));

    return { columns, students: studentsWithMarks };
  }, {
    body: t.Object({
      group_id: t.Number(),
      subject_id: t.Number(),
    }),
    query: t.Optional(t.Object({
      limit: t.Number({ default: 0 }),
      offset: t.Number({ default: 0 }),
    })),
  });

export default app;
