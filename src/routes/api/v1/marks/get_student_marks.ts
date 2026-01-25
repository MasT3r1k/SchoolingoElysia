import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/marks/student', async ({ cookie, body, query }) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .select(['tokens.userId'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    const { student_id } = body;
    if (!student_id || typeof student_id !== 'number') {
      return Response.json({ error: 'invalid_student_id' });
    }

    const student = await db.selectFrom('students')
      .select(['students.status'])
      .where('students.personId', '=', student_id)
      .limit(1)
      .execute();

    if (!student.length) {
      return Response.json({ error: 'invalid_student' });
    }

    let queryBuilder = db.selectFrom('grades')
      .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
      .leftJoin('subjects', 'subjects.subjectId', 'grades_columns.subjectId')
      .select([
        'grades.mark',
        'grades.teacherId',
        'grades_columns.created',
        'grades_columns.topic',
        'grades_columns.weight',
        'grades_columns.type',
        'grades_columns.columnIndex',
        'subjects.label as subjectName'
      ])
      .where('grades.studentId', '=', student_id)
      .where('grades_columns.status', '=', 'active')
      .orderBy('grades_columns.created', 'desc')

    // Použij limit pouze pokud je > 0
    if (query?.limit && query.limit > 0) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    // Offset použij vždy, ale jen pokud existuje
    if (query?.offset) {
      queryBuilder = queryBuilder.offset(query.offset);
    }

    const marks = await queryBuilder.execute();

    return Response.json({ status: true, marks });
  }, {
    body: t.Object({
      student_id: t.Optional(t.Number()),
    }),
    query: t.Optional(t.Object({
      limit: t.Number({ default: 0 }),
      offset: t.Number({ default: 0 }),
    })),
  });

export default app;
