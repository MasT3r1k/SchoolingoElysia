import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

const app = new Elysia()
  .post('/system/domain', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SCHOOL_EDIT);
    if (!perm) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { domain } = body;
    const schoolId = user.school_id || 1;

    const existing = await db.selectFrom('school_domains')
      .selectAll()
      .where('domain', '=', domain)
      .where('school_id', '=', schoolId)
      .executeTakeFirst();
    
    if (existing) {
        return Response.json({ error: 'domain_exists' }, { status: 400 });
    }

    await db.insertInto('school_domains')
      .values({
        school_id: schoolId,
        domain
      })
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
        domain: t.String()
    })
  })
  .delete('/system/domain', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SCHOOL_EDIT);
    if (!perm) {
        return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { domainId } = body;
    
    await db.deleteFrom('school_domains')
        .where('domain_id', '=', domainId)
        .where('school_id', '=', user.school_id)
        .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
        domainId: t.Number()
    })
  });

export default app;
