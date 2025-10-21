import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { MainConfig } from '../../../../config/main.config';

const app = new Elysia()
  .post('/marks/add_mark', async ({ cookie, body }) => {
    const token = cookie.token.value;
    const { column_id, student_id, mark, description } = body;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.userId', 'users.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    const teacher = await db.selectFrom("teachers")
    .where("personId", "=", auth.person)
    .limit(1)
    .execute();

    if (!teacher.length) {
        return Response.json({ error: 'no_permission' })
    }
    
    if (column_id == undefined || isNaN(column_id)) { return Response.json({ error: 'invalid_column_id' }) }
    if (student_id == undefined || isNaN(student_id)) { return Response.json({ error: 'invalid_student_id' }) }
    if (mark == undefined || mark < 0.8 || mark > 5 || !MainConfig.ALLOWED_MARKS.includes(mark)) { return Response.json({ error: 'invalid_mark' }) }

    // Check column
    const column = await db.selectFrom("grades_columns")
    .where("gcId", "=", column_id)
    .limit(1)
    .execute();

    if (!column.length) {
        return Response.json({ error: 'invalid_column_id' });
    }

    await db.insertInto("grades")
    .values({
        columnId: column_id,
        mark,
        studentId: student_id,
        teacherId: auth.person
    })


    return Response.json({ status: true });
  }, {
    body: t.Object({
      column_id: t.Optional(t.Number()),
      mark: t.Optional(t.Number()),
      student_id: t.Optional(t.Number()),
      description: t.Optional(t.Number())
    })
  });

export default app;