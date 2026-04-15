import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { getAuthUser } from '../../../../utils/auth';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

export const evaluationRouter = new Elysia({ prefix: '/evaluation' })
  // GET / - Get hospitace and annual evaluations
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

    const evaluations = await db.selectFrom('teachers_evaluations')
      .selectAll()
      .where('person_id', '=', employeeId)
      .orderBy('date', 'desc')
      .execute();

    return Response.json({ data: evaluations });
  });

// End of file
