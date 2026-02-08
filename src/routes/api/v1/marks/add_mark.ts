import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { MainConfig } from '../../../../config/main.config';

const app = new Elysia().post(
  '/marks/add_mark',
  async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    const { column_id, student_id, mark, description } = body;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.userId', 'users.userId')
      .select([
        'tokens.userId',
        'users.person',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    if (auth.role != "teacher") {
      return Response.json({ error: 'no_permission' });
    }

    if (column_id == undefined || isNaN(column_id)) {
      return Response.json({ error: 'invalid_column_id' });
    }

    if (student_id == undefined || isNaN(student_id)) {
      return Response.json({ error: 'invalid_student_id' });
    }

    if (mark == undefined) {
      return Response.json({ error: 'invalid_mark' });
    }

    let mark_number = parseInt(mark);

    if (MainConfig.MARK_DISPLAY.includes(mark)) {
      mark_number = MainConfig.ALLOWED_MARKS[MainConfig.MARK_DISPLAY.indexOf(mark)];
    }

    if (
      mark_number == undefined ||
      mark_number < MainConfig.MIN_MARK ||
      mark_number > MainConfig.MAX_MARK ||
      !MainConfig.ALLOWED_MARKS.includes(mark_number)
    ) {
      return Response.json({ error: 'invalid_mark' });
    }

    // Check column
    const column = await db
      .selectFrom('grades_columns')
      .select('gcId')
      .where('gcId', '=', column_id)
      .executeTakeFirst();

    if (!column) {
      return Response.json({ error: 'invalid_column_id' });
    }

    const checkGrade = await db.selectFrom('grades')
    .select(['grades.gradeId'])
    .where('grades.columnId', '=', column.gcId)
    .where('grades.studentId', '=', student_id)
    .executeTakeFirst();
    if (checkGrade) {
      await db.updateTable('grades')
      .set({ mark: mark_number })
      .where('grades.columnId', '=', column.gcId)
      .where('grades.studentId', '=', student_id)
      .execute();
    } else {
      await db.insertInto('grades').values({
        columnId: column.gcId,
        mark: mark_number,
        studentId: student_id,
        teacherId: auth.person!,
      })
      .execute()
    }

    const notification = await db.selectFrom('notification_rules')
    .select('enabled')
    .where('type', '=', 'grade_new')
    .where('user_id', '=', auth.userId)
    .executeTakeFirst();
    
    if (
      (notification && notification.enabled == true)
      ||
      (!notification && MainConfig.DEFAULT_NOTIFICATION.includes('new_grade'))
    ) {
      const users = await db.selectFrom('users')
      .select('users.userId')
      .where('users.person', '=', student_id)
      .execute();

      users.forEach(async(user) => {
        await db.insertInto('notifications')
        .values({
          user_id: user.userId,
          type: 'new_grade',
          data: JSON.stringify({
            mark: mark_number
          })
        })
        .executeTakeFirst();
      })
    }

    return Response.json({ status: true });
  },
  {
    body: t.Object({
      column_id: t.Optional(t.Number()),
      mark: t.Optional(t.String()),
      student_id: t.Optional(t.Number()),
      description: t.Optional(t.String()),
    }),
  }
);

export default app;
