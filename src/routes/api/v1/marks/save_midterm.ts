import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { MainConfig, MainConfigSchema } from '../../../../config/main.config';

const app = new Elysia()
  .post('/marks/midterm', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        'tokens.userId',
        'users.person',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    // Teacher check
    if (auth.role != "teacher") {
      return { error: 'no_permission', details: 'not_teacher' };
    }

    const { student_id, subject_id, quarter, grade } = body;

    // Validation
    if (!student_id || !subject_id || !quarter || !grade) {
      return { error: 'missing_params' };
    }

    if (quarter < MainConfig.MIN_QUARTER || quarter > MainConfig.MAX_QUARTER) {
      return { error: 'invalid_quarter' };
    }

    if (grade < MainConfig.MIN_MARK || grade > MainConfig.MAX_MARK) {
      return { error: 'invalid_grade' };
    }

    // Get current school year
    const now = moment();
    const currentYear = now.month() >= MainConfig.SEMESTER_START_MONTH ? now.year() : now.year() - 1;

    // Check if grade already exists
    const existingGrade = await db
      .selectFrom('semester_grades')
      .select([
        's_g_id'
      ])
      .where('student_id', '=', student_id)
      .where('subject_id', '=', subject_id)
      .where('semester', '=', quarter)
      .where('year', '=', currentYear)
      .executeTakeFirst();

    if (existingGrade) {
      // Update existing grade
      await db
        .updateTable('semester_grades')
        .set({
          grade: grade,
          updated_at: moment().toDate()
        })
        .where('s_g_id', '=', existingGrade.s_g_id)
        .execute();
    } else {
      // Insert new grade
      await db
        .insertInto('semester_grades')
        .values({
          student_id,
          subject_id,
          semester: quarter,
          grade: grade,
          year: currentYear,
          teacher_id: auth.person!
        })
        .execute();
    }

    return { success: true };

  }, {
    body: t.Object({
      student_id: t.Optional(t.Number()),
      subject_id: t.Optional(t.Number()),
      quarter: t.Optional(t.Number()),
      grade: t.Optional(t.Number())
    })
  })

  .delete('/marks/midterm', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        'tokens.userId',
        'users.person',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    if (auth.role != "teacher") {
      return { error: 'no_permission', details: 'not_teacher' };
    }

    const { student_id, subject_id, quarter } = body;

    if (!student_id || !subject_id || !quarter) {
      return { error: 'missing_params' };
    }

    // Get current school year
    const now = moment();
    const currentYear = now.month() >= 8 ? now.year() : now.year() - 1;

    await db
      .deleteFrom('semester_grades')
      .where('student_id', '=', student_id)
      .where('subject_id', '=', subject_id)
      .where('semester', '=', quarter)
      .where('year', '=', currentYear)
      .execute();

    return { success: true };

  }, {
    body: t.Object({
      student_id: t.Optional(t.Number()),
      subject_id: t.Optional(t.Number()),
      quarter: t.Optional(t.Number())
    })
  });

export default app;
