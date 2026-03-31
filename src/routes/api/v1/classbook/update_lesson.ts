import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const elysiaApp = new Elysia()
  .post('/classbook/lesson', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.CLASSBOOK_EDIT);
    if (!perm) return { error: 'no_permission' };

    const { classbook_id, topic, note, internalNote } = body;
    if (classbook_id == undefined) return { error: 'bad_query' };

    await db.updateTable('classbook')
      .set({
        topic: topic || null,
        note: note || null,
        internal_note: internalNote || null
      })
      .where('classbook_id', '=', classbook_id)
      .execute();

    return { success: true };
  }, {
    body: t.Object({
      classbook_id: t.Number(),
      topic: t.Optional(t.Nullable(t.String())),
      note: t.Optional(t.Nullable(t.String())),
      internalNote: t.Optional(t.Nullable(t.String()))
    })
  });

export default elysiaApp;
