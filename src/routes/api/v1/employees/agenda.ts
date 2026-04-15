import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { getAuthUser } from '../../../../utils/auth';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

export const agendaRouter = new Elysia({ prefix: '/agenda' })
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

    const agenda = await db.selectFrom('teachers_agenda')
      .selectAll()
      .where('person_id', '=', employeeId)
      .orderBy('expires_at', 'asc')
      .execute();

    return Response.json({ data: agenda });
  });

// End of file
