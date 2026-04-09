import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';

import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const elysiaApp = new Elysia()
  .get('/classbook/homework', async ({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.CLASSBOOK_VIEW);
    if (!perm) return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { subjectId, groupId } = query;
    if (subjectId == undefined || groupId == undefined) return { error: 'bad_query' };

    // === NAČTENÍ DOMÁCÍCH ÚKOL ===
    const homework: any[] = await db.selectFrom('homework')
    .select([
        'homework.homework_id',
        'homework.headline',
        'homework.homework',
        'homework.assigned_at',
        'homework.due_date',
        'homework.type'
    ])
    .where('homework.group_id', '=', groupId)
    .where('homework.subject_id', '=', subjectId)
    .orderBy('homework.due_date', 'desc')
    .execute();

    if (homework.length > 0) {
        const h_ids = homework.map(h => h.homework_id);
        const submissions = await db.selectFrom('student_homework')
          .leftJoin('persons', 'persons.person_id', 'student_homework.student_id')
          .select([
             'student_homework.homework_id',
             'student_homework.student_id',
             'persons.first_name',
             'persons.last_name',
             'student_homework.submitted',
             'student_homework.finished',
             'student_homework.type'
          ])
          .where('student_homework.homework_id', 'in', h_ids)
          .execute();
          
        for (let hw of homework) {
           hw.submissions = submissions.filter(s => s.homework_id === hw.homework_id);
        }
    }

    return homework;

  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      subjectId: t.Optional(t.Number())
    })
  });

export default elysiaApp;
