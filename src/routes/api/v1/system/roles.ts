import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';


const app = new Elysia()
  // GET /system/roles - Načtení všech rolí a všech dostupných oprávnění
  .get('/system/roles', async ({ cookie }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ROLES_VIEW);
    if (!perm) return { error: 'no_permission' };

    const [roles, rolePermissions] = await Promise.all([
      db.selectFrom('roles')
        .selectAll()
        .orderBy('role_name', 'asc')
        .execute(),
      db.selectFrom('role_permissions')
        .selectAll()
        .execute()
    ]);

    // Map permissions to roles
    const rolesWithPermissions = roles.map(role => ({
      ...role,
      permissions: rolePermissions
        .filter(rp => rp.role_id === role.role_id)
        .map(rp => rp.permission_id)
    }));

    const permissions = Object.entries(GlobalPermissions).map((perm, index) => ({ permission_id: index, permission_name: perm[1], description: '' }));
    console.log(permissions);

    return Response.json({
      roles: rolesWithPermissions,
      all_permissions: permissions
    });
  })

  // POST /system/update_role - Vytvoření nebo úprava role
  .post('/system/update_role', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ROLES_EDIT);
    if (!perm) return { error: 'no_permission' };

    const { roleId, name, key, description, permissionIds } = body;

    let id = roleId;

    await db.transaction().execute(async (trx) => {
      if (roleId) {
        // Update existing role
        await trx.updateTable('roles')
          .set({
            role_name: name,
            role_key: key,
            description: description
          })
          .where('role_id', '=', roleId)
          .execute();
      } else {
        // Create new role
        const result = await trx.insertInto('roles')
          .values({
            role_name: name,
            role_key: key,
            description: description
          })
          .executeTakeFirst();
        id = Number(result.insertId);
      }

      // Update permissions
      if (permissionIds !== undefined) {
        // Remove old permissions
        await trx.deleteFrom('role_permissions')
          .where('role_id', '=', id)
          .execute();

        // Add new permissions
        if (permissionIds.length > 0) {
          const values = permissionIds.map((pId: number) => ({
            role_id: id,
            permission_id: pId
          }));
          await trx.insertInto('role_permissions')
            .values(values)
            .execute();
        }
      }
    });

    return Response.json({ success: true, roleId: id });
  }, {
    body: t.Object({
      roleId: t.Optional(t.Union([t.Number(), t.Null()])),
      name: t.String(),
      key: t.String(),
      description: t.Optional(t.Union([t.String(), t.Null()])),
      permissionIds: t.Optional(t.Array(t.Number()))
    })
  })

  // DELETE /system/role - Smazání role
  .delete('/system/role', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ROLES_EDIT);
    if (!perm) return { error: 'no_permission' };

    const { roleId } = body;

    await db.deleteFrom('roles')
      .where('role_id', '=', roleId)
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
      roleId: t.Number()
    })
  });

export default app;
