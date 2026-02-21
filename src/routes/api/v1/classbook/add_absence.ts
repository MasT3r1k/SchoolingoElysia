import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  .post('/classbook/absence', async ({ cookie, body }) => {
    // === AUTH ===
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.user_id', 'tokens.user_id')
      .innerJoin("passwords", "passwords.password_id", 'users.password_id')
      .select([
        'users.user_id',
        'users.username',
        'users.role',
        'users.person_id',
        'users.2fa',
        'users.2fa_secret',
        'passwords.password'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!user) return { error: 'no_user', details: 'no_db' };
    if (user.role != "teacher") return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { classbook_id, student_id, type, reason, minutes, note } = body;
    if (
           classbook_id == undefined
        || student_id == undefined
        || type == undefined
        || reason == undefined
        || minutes == undefined
        || note == undefined) return { error: 'bad_query' };

    const isExistAbsence = await db.selectFrom('absence')
    .select([
        'absence.lesson_id',
        'absence.student_id',
    ])
    .where('absence.lesson_id', '=', classbook_id)
    .where('absence.student_id', '=', student_id)
    .executeTakeFirst()

    if (!isExistAbsence && type >= 0) {
        await db.insertInto('absence')
        .values({
            lesson_id: classbook_id,
            student_id: student_id,
            type,
            reason,
            minutes,
            note
        })
        .execute();
    } else {
        if (type >= 0) {
            await db.updateTable('absence')
            .set('absence.type', type)
            .set('absence.minutes', minutes)
            .set('absence.note', note)
            .set('absence.reason', reason)
            .where('absence.lesson_id', '=', classbook_id)
            .where('absence.student_id', '=', student_id)
            .execute()
        } else {
            await db.deleteFrom('absence')
            .where('absence.lesson_id', '=', classbook_id)
            .where('absence.student_id', '=', student_id)
            .limit(1)
            .execute();
        }
    }

    return { success: true };

  }, {
    body: t.Object({
      student_id: t.Optional(t.Number()),
      classbook_id: t.Optional(t.Number()),
      type: t.Optional(t.Number()),
      reason: t.Optional(t.String()),
      minutes: t.Optional(t.Number()),
      note: t.Optional(t.String()),
    })
  });

export default elysiaApp;
