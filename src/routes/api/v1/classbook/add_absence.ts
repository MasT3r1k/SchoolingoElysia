import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';

import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const elysiaApp = new Elysia()
  .post('/classbook/absence', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.CLASSBOOK_EDIT);
    if (!perm) return { error: 'no_permission' };

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
