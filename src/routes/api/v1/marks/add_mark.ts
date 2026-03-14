import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { MainConfig } from '../../../../config/main.config';
import { notificationService } from '../../../../functions/notification.service';

const app = new Elysia().post(
  '/marks/add_mark',
  async ({ cookie, body }: any) => {
    const token = cookie.token?.value as string;
    let { column_id, student_id, mark, description } = body;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.user_id', 'users.user_id')
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

    if (auth.role != "teacher") {
      return Response.json({ error: 'no_permission' });
    }

    if (column_id === undefined || isNaN(column_id)) {
      return Response.json({ error: 'invalid_column_id' });
    }

    if (student_id === undefined || isNaN(student_id)) {
      return Response.json({ error: 'invalid_student_id' });
    }

    if (mark === undefined) {
      return Response.json({ error: 'invalid_mark' });
    }

    const column = await db
      .selectFrom('grades_columns')
      .leftJoin('subjects', 'subjects.subject_id', 'grades_columns.subject_id')
      .select([
        'grades_columns.column_id',
        'grades_columns.type',
        'grades_columns.weight',
        'grades_columns.topic',
        'grades_columns.max_points',
        'grades_columns.group_id',
        'grades_columns.subject_id',
        'subjects.label as subjectName'
      ])
      .where('column_id', '=', column_id)
      .executeTakeFirst();

    if (!column) {
      return Response.json({ error: 'invalid_column_id' });
    }

    let mark_number: number;

    if (column.type === 1) {
      // Body (Points) -> Calculate Grade
      const points = parseFloat(mark.replace(',', '.'));
      if (isNaN(points) || points < 0) {
        return Response.json({ error: 'invalid_mark' });
      }

      // Fetch marking scale
      let scale = await db.selectFrom('marking_scales_groups')
        .leftJoin('marking_scales', 'marking_scales.ms_id', 'marking_scales_groups.ms_id')
        .select(['grade_1_min', 'grade_2_min', 'grade_3_min', 'grade_4_min'])
        .where('marking_scales_groups.subject_id', '=', column.subject_id!)
        .where('marking_scales_groups.group_id', '=', column.group_id!)
        .executeTakeFirst();
      
      if (!scale) {
        scale = await db.selectFrom('marking_scales')
          .select(['grade_1_min', 'grade_2_min', 'grade_3_min', 'grade_4_min'])
          .where('is_default', '=', true)
          .executeTakeFirst();
      }

      const max_points = (column.max_points && column.max_points > 0) ? column.max_points : 100;
      const percent = (points / max_points) * 100;

      const g1 = scale?.grade_1_min ?? MainConfig.MARKING_SCALE[0];
      const g2 = scale?.grade_2_min ?? MainConfig.MARKING_SCALE[1];
      const g3 = scale?.grade_3_min ?? MainConfig.MARKING_SCALE[2];
      const g4 = scale?.grade_4_min ?? MainConfig.MARKING_SCALE[3];

      if (percent >= g1) mark_number = 1;
      else if (percent >= g2) mark_number = 2;
      else if (percent >= g3) mark_number = 3;
      else if (percent >= g4) mark_number = 4;
      else mark_number = 5;

      // Update mark string for notification - we can show both for clarity
      mark = `${mark_number} (${points}b)`;
    } else {
      // Známky (Marks)
      mark_number = parseInt(mark);

      if (MainConfig.MARK_DISPLAY.includes(mark)) {
        mark_number = MainConfig.ALLOWED_MARKS[MainConfig.MARK_DISPLAY.indexOf(mark)];
      }

      if (
        mark_number === undefined ||
        mark_number < MainConfig.MIN_MARK ||
        mark_number > MainConfig.MAX_MARK ||
        !MainConfig.ALLOWED_MARKS.includes(mark_number)
      ) {
        return Response.json({ error: 'invalid_mark' });
      }
    }

    // Check grade existence
    const checkGrade = await db.selectFrom('grades')
    .select(['grades.grade_id'])
    .where('grades.column_id', '=', column.column_id)
    .where('grades.student_id', '=', student_id)
    .executeTakeFirst();
    
    if (checkGrade) {
      await db.updateTable('grades')
      .set({ mark: mark_number })
      .where('grades.column_id', '=', column.column_id)
      .where('grades.student_id', '=', student_id)
      .execute();
    } else {
      await db.insertInto('grades').values({
        column_id: column.column_id,
        mark: mark_number,
        student_id: student_id,
        teacher_id: auth.person_id as number,
      })
      .execute()
    }

    // Notify student
    const studentUser = await db.selectFrom('users')
      .select('user_id')
      .where('person_id', '=', student_id)
      .executeTakeFirst();

    if (studentUser) {
        const teacher = await db.selectFrom('persons')
            .select(['first_name', 'last_name'])
            .where('person_id', '=', auth.person_id as number)
            .executeTakeFirst();
        
        const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Učitel';

        await notificationService.sendNotification('grade_new', studentUser.user_id, {
            subject: column.subjectName || 'Neznámý předmět',
            grade: mark, // Use the display mark string
            weight: column.weight,
            topic: column.topic,
            teacherName: teacherName
        });
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
