import { Elysia, t } from 'elysia';
import { getAuthUser } from '../../../../utils/auth';
import { Client } from 'ldapts';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value as string)
  }))
  .post('/system/test_ldap', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized', message: 'Neověřený uživatel' }, { status: 401 });
    if (user.manager !== -1 && !user.is_principal) {
      return Response.json({ error: 'no_permission', message: 'Nedostatečná oprávnění' }, { status: 403 });
    }

    const config = body as any;

    try {
        const client = new Client({
            url: config.server_url,
            timeout: 5000,
            connectTimeout: 5000
        });

        if (config.bind_dn && config.bind_password) {
            await client.bind(config.bind_dn, config.bind_password);
        } else {
            await client.bind('', '');
        }
        
        await client.unbind();

        return Response.json({ success: true, message: 'Připojení k LDAP serveru bylo úspěšné.' });
    } catch (e: any) {
        return Response.json({ success: false, message: e?.message || 'Neznámá chyba' }, { status: 400 });
    }
  }, {
    body: t.Object({
        config_id: t.Optional(t.Number()),
        type: t.Optional(t.Number()),
        server_url: t.String(),
        bind_dn: t.Optional(t.String()),
        bind_password: t.Optional(t.String()),
        search_base: t.String(),
        user_filter: t.Optional(t.String()),
        mapping_username: t.Optional(t.String()),
        mapping_email: t.Optional(t.String()),
        mapping_name: t.Optional(t.String()),
        enabled: t.Optional(t.Union([t.Boolean(), t.Number()]))
    })
  });

export default app;
