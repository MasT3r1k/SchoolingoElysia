import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';

import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const elysiaApp = new Elysia()
  .get('/classbook/notes', async ({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.CLASSBOOK_VIEW);
    if (!perm) return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { subjectId, groupId } = query;
    if (subjectId == undefined || groupId == undefined) return { error: 'bad_query' };

    // === NAČTENÍ POZNÁMEK ===
    const notes = await db.selectFrom('classbook_notes')
    .select([
        'classbook_notes.classbook_note_id',
        'classbook_notes.title',
        'classbook_notes.note',
        'classbook_notes.created_at'
    ])
    .where('classbook_notes.group_id', '=', groupId)
    .where('classbook_notes.subject_id', '=', subjectId)
    .orderBy('classbook_notes.created_at', 'desc')
    .execute();

    return notes;

  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      subjectId: t.Optional(t.Number())
    })
  });

export default elysiaApp;
