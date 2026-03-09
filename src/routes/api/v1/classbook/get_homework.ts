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
    const homework = await db.selectFrom('homework')
    .select([
        'homework.homework_id',
        'homework.homework',
        'homework.assigned_at',
        'homework.due_date',
        'homework.type'
    ])
    .where('homework.group_id', '=', groupId)
    .where('homework.subject_id', '=', subjectId)
    .orderBy('homework.due_date', 'desc')
    .execute();

    return homework;

  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      subjectId: t.Optional(t.Number())
    })
  });

export default elysiaApp;
