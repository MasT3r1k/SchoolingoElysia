import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { getAuthUser } from '../../../../utils/auth';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

export const professionalRouter = new Elysia({ prefix: '/professional' })
  // GET / - Get education, DVPP and certificates
  .get('/', async({ cookie, query, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    
    const employeeId = parseInt(params.id);
    if (isNaN(employeeId)) {
      return new Response(JSON.stringify({ error: 'invalid_id' }), { status: 400 });
    }
    
    // Check permission - only admins or self can view
    const canViewAll = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_VIEW);
    if (!canViewAll && user.person_id !== employeeId) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    const education = await db.selectFrom('teachers_education')
      .selectAll()
      .where('person_id', '=', employeeId)
      .orderBy('year', 'desc')
      .orderBy('date', 'desc')
      .execute();

    return Response.json({ data: education });
  })
  // POST /professional - Add education or certificate
  .post('/', async({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_EDIT);
    if (!perm && user.person_id !== body.employeeId) return { error: 'no_permission' };

    await db.insertInto('teachers_education')
      .values({
        person_id: body.employeeId,
        title: body.title,
        institution: body.institution || null,
        year: body.year || null,
        type: body.type,
        date: body.date || null,
        file_url: body.fileUrl || null
      })
      .execute();

    return Response.json({ success: true, message: 'Education record added' });
  }, {
    body: t.Object({
      employeeId: t.Number(),
      title: t.String(),
      institution: t.Optional(t.String()),
      year: t.Optional(t.Number()),
      type: t.UnionEnum(['degree', 'certification', 'dvpp', 'other']),
      date: t.Optional(t.String()),
      fileUrl: t.Optional(t.String())
    })
  });

// End of file
