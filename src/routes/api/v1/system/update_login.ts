import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value)
  }))
  // POST /system/update_login - Update Authentication Settings
  .post('/system/update_login', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { 
        auth_classic, 
        auth_ldap, 
        auth_qr, 
        auth_passkeys, 
        session_lifetime_minutes, 
        max_login_attempts 
    } = body;

    // Update school settings
    await db.updateTable('schools')
      .set({
        auth_classic: auth_classic ? 1 : 0, // Kysely boolean/tinyint match
        auth_ldap: auth_ldap ? 1 : 0,
        auth_qr: auth_qr ? 1 : 0,
        auth_passkeys: auth_passkeys ? 1 : 0,
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
      session_lifetime_minutes: t.Number(),
      max_login_attempts: t.Number()
    })
  });

export default app;
