import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  // POST /system/evaluation_templates - Vytvoření nebo aktualizace šablony hodnocení
  .post('/system/evaluation_templates', async ({ cookie, school, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SYSTEM_STATUS);
    if (!perm) return { error: 'no_permission' };

    if (!school) return Response.json({ error: 'no_school' }, { status: 404 });

    const { templateId, type, text, value, isPublic } = body;

    if (templateId) {
      await db.updateTable('school_evaluation_templates')
        .set({
          type,
          text,
          value,
          is_public: isPublic ? 1 : 0
        } as any)
        .where('template_id', '=', templateId)
        .where('school_id', '=', school.school_id)
        .execute();
      
      return { success: true, templateId };
    } else {
      const result = await db.insertInto('school_evaluation_templates')
        .values({
          school_id: school.school_id,
          type,
          text,
          value,
          is_public: isPublic ? 1 : 0
        } as any)
        .executeTakeFirst();
      
      return { success: true, templateId: Number(result.insertId) };
    }
  }, {
    body: t.Object({
      templateId: t.Optional(t.Nullable(t.Number())),
      type: t.String(),
      text: t.String(),
      value: t.String(),
      isPublic: t.Boolean()
    })
  })

  // DELETE /system/evaluation_templates - Smazání šablony hodnocení
  .delete('/system/evaluation_templates', async ({ cookie, school, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SYSTEM_STATUS);
    if (!perm) return { error: 'no_permission' };

    if (!school) return Response.json({ error: 'no_school' }, { status: 404 });

    const { templateId } = body;

    await db.deleteFrom('school_evaluation_templates')
      .where('template_id', '=', templateId)
      .where('school_id', '=', school.school_id)
      .execute();

    return { success: true };
  }, {
    body: t.Object({
      templateId: t.Number()
    })
  });

export default app;
