import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

const app = new Elysia()
  // POST /system/update_login - Update Authentication Settings
  .post('/system/update_login', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SCHOOL_EDIT);
    if (!perm) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { 
        auth_classic, 
        auth_ldap, 
        auth_qr, 
        auth_passkeys,
        reset_password_with_email,
        session_lifetime_minutes, 
        max_login_attempts,
    } = body;

    // Update school settings
    await db.updateTable('schools')
      .set({
        auth_classic: auth_classic ? 1 : 0, // Kysely boolean/tinyint match
        auth_ldap: auth_ldap ? 1 : 0,
        fastlogin: auth_qr ? true : false,
        auth_passkeys: auth_passkeys ? 1 : 0,
        reset_password_with_email: reset_password_with_email ? true : false,
        session_lifetime_minutes,
        max_login_attempts
      })
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
      auth_classic: t.Boolean(),
      auth_ldap: t.Boolean(),
      auth_qr: t.Boolean(),
      auth_passkeys: t.Boolean(),
      reset_password_with_email: t.Boolean(),
      session_lifetime_minutes: t.Number(),
      max_login_attempts: t.Number()
    })
  });

export default app;
