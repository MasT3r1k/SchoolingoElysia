import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value as string)
  }))
  // POST /system/update_ldap - Update LDAP Configuration
  .post('/system/update_ldap', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.is_principal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { 
        server_url, 
        bind_dn, 
        bind_password, 
        search_base,
        user_filter,
        mapping_username,
        mapping_email,
        mapping_name,
        enabled
    } = body;

    // We will try to find existing config
    const existing = await db.selectFrom('ldap_config')
        .select('config_id')
        .limit(1)
        .executeTakeFirst();

    if (existing) {
        await db.updateTable('ldap_config')
            .set({
                server_url,
                bind_dn,
                bind_password,
                search_base,
                user_filter,
                mapping_username,
                mapping_email,
                mapping_name,
                enabled: enabled ? 1 : 0
            })
            .where('config_id', '=', existing.config_id)
            .execute();
    } else {
         // Get school ID (assuming 1 for single tenant)
         const school = await db.selectFrom('schools').select('school_id').limit(1).executeTakeFirst();
         if (school) {
             await db.insertInto('ldap_config')
                 .values({
                     school_id: school.school_id,
                     server_url,
                     bind_dn,
                     bind_password,
                     search_base,
                     user_filter,
                     mapping_username,
                     mapping_email,
                     mapping_name,
                     enabled: enabled ? 1 : 0
                 })
                 .execute();
         }
    }

    return Response.json({ success: true });
  }, {
    body: t.Object({
        server_url: t.String(),
        bind_dn: t.Optional(t.String()),
        bind_password: t.Optional(t.String()),
        search_base: t.String(),
        user_filter: t.Optional(t.String()),
        mapping_username: t.Optional(t.String()),
        mapping_email: t.Optional(t.String()),
        mapping_name: t.Optional(t.String()),
        enabled: t.Boolean()
    })
  });

export default app;
