import { Elysia, t } from 'elysia';
import { db } from '@database';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const elysiaApp = new Elysia()
  .post('/classbook/add_note', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.CLASSBOOK_EDIT);
    if (!perm) return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { subject_id, group_id, title, note } = body;
    if (
      subject_id === undefined ||
      group_id === undefined ||
      title === undefined ||
      note === undefined
    ) {
      return { error: 'bad_query' };
    }

    try {
      const noteDB = await db
        .insertInto('classbook_notes')
        .values({
          subject_id,
          group_id,
          title,
          note,
          created_by: user.person_id ?? user.user_id,
        })
        .executeTakeFirst();

      if (!noteDB) return { success: false };

      const newNote = await db
        .selectFrom('classbook_notes')
        .select([
          'classbook_notes.classbook_note_id',
          'classbook_notes.title',
          'classbook_notes.note',
          'classbook_notes.created_at',
        ])
        .where('classbook_notes.classbook_note_id', '=', Number(noteDB.insertId))
        .executeTakeFirst();

      if (!newNote) return { success: false };

      return {
        success: true,
        note: newNote,
      };
    } catch (e) {
      return { success: false, error: 'database_error' };
    }
  }, {
    body: t.Object({
      subject_id: t.Number(),
      group_id: t.Number(),
      title: t.String(),
      note: t.String(),
    }),
  });

export default elysiaApp;
