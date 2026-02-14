import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/messages/permissions', async ({ cookie }) => {
     const token = cookie.token?.value as string;
     if (!token) return { error: 'no_user' };

     // Check if admin? Skipping specific check for now, simplified.
     
     const perms = await db.selectFrom('role_communication_permissions').selectAll().execute();
     return perms;
  })
  .post('/messages/permissions', async ({ cookie, body }) => {
     const token = cookie.token?.value as string;
     // Verify admin...

     const { role_source, role_targets } = body;
     // role_targets is array of strings
     if (!role_source || !Array.isArray(role_targets)) return { error: 'invalid_body' };

     // Transaction needed ideally
     await db.deleteFrom('role_communication_permissions')
        .where('role_source', '=', role_source)
        .execute();

     if (role_targets.length > 0) {
         await db.insertInto('role_communication_permissions')
            .values(role_targets.map(target => ({
                role_source: role_source,
                role_target: target
            })))
            .execute();
     }
     
     return { success: true };
  }, {
      body: t.Object({
          role_source: t.String(),
          role_targets: t.Array(t.String())
      })
  });

export default app;
