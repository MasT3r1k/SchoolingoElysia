import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { getAuthUser } from '../../../../utils/auth';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

export const historyRouter = new Elysia({ prefix: '/history' })
  // GET / - Get employee change history
  .get('/', async({ cookie, query, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    
    const employeeId = parseInt(params.id);
    if (isNaN(employeeId)) {
      return new Response(JSON.stringify({ error: 'invalid_id' }), { status: 400 });
    }
    
    // Check permission - only admins can view history
    const canViewAll = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_VIEW);
    if (!canViewAll) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    const history = await db.selectFrom('teachers_history')
      .selectAll()
      .where('person_id', '=', employeeId)
      .orderBy('created_at', 'desc')
      .execute();

    const authorIds = history.map(h => h.author_id).filter((id): id is number => id !== null);
    const authorNames = await format_person_map_by_ids(authorIds);

    const data = history.map(h => ({
      ...h,
      full_name: h.author_id ? authorNames.get(h.author_id) : 'Systém',
      details: h.details ? JSON.parse(h.details) : []
    }));

    return Response.json({ data });
  });

// End of file
