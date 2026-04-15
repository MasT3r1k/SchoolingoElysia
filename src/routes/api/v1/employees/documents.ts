import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { getAuthUser } from '../../../../utils/auth';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

export const documentsRouter = new Elysia({ prefix: '/documents' })
  // GET / - Get personnel documents
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

    const documents = await db.selectFrom('documents')
      .leftJoin('files', 'files.file_id', 'documents.file_id')
      .select([
        'documents.name',
        'files.file_size as size',
        'documents.created_at as date',
        'files.storage_path as fileUrl'
      ])
      .where('documents.owner_id', '=', employeeId)
      .where('documents.type', '=', 'file')
      .execute();

    return Response.json({ data: documents });
  });

// End of file
