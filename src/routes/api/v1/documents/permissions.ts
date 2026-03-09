import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';
import { DocumentPermissionService } from '../../../../functions/document_permission.service';

const app = new Elysia()
  .post('/documents/get_permissions', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user' };

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .select(['users.user_id', 'users.role', 'users.manager', 'users.principal'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .executeTakeFirst();

    if (!user) return { error: 'no_user' };

    const { document_id } = body;

    const canView = await DocumentPermissionService.canViewPermissions(user.user_id, document_id);
    if (!canView) return { error: 'no_permission' };

    const perms = await db.selectFrom('document_permissions')
        .leftJoin('roles', 'roles.role_id', 'document_permissions.role_id')
        .leftJoin('users', 'users.user_id', 'document_permissions.user_id')
        .leftJoin('persons', 'persons.person_id', 'users.person_id')
        .select([
            'document_permission_id',
            'document_permissions.role_id',
            'roles.role_name',
            'document_permissions.user_id',
            'users.username',
            'persons.first_name',
            'persons.last_name',
            'permission_type'
        ])
        .where('document_id', '=', document_id)
        .execute();

    return perms;
  }, {
    body: t.Object({ document_id: t.Number() })
  })

  .post('/documents/set_permissions', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user' };

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .select(['users.user_id', 'users.role', 'users.manager', 'users.principal'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .executeTakeFirst();

    if (!user) return { error: 'no_user' };

    const { document_id, permissions } = body;

    const canEdit = await DocumentPermissionService.canViewPermissions(user.user_id, document_id);
    if (!canEdit) return { error: 'no_permission' };

    await db.transaction().execute(async (trx) => {
        // Delete old permissions
        await trx.deleteFrom('document_permissions')
            .where('document_id', '=', document_id)
            .execute();

        // Add new permissions
        if (permissions.length > 0) {
            const values = permissions.map(p => ({
                document_id,
                role_id: p.role_id,
                user_id: p.user_id,
                permission_type: p.permission_type
            }));
            await trx.insertInto('document_permissions')
                .values(values)
                .execute();
        }
    });

    return { success: true };
  }, {
    body: t.Object({
      document_id: t.Number(),
      permissions: t.Array(t.Object({
        role_id: t.Nullable(t.Number()),
        user_id: t.Nullable(t.Number()),
        permission_type: t.Union([t.Literal('READ'), t.Literal('WRITE'), t.Literal('DENY')])
      }))
    })
  })

  // Helper to list roles and users for selection
  .get('/documents/permission_options', async ({ cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user' };

    const [roles, users] = await Promise.all([
        db.selectFrom('roles').select(['role_id', 'role_name']).execute(),
        db.selectFrom('users')
            .innerJoin('persons', 'persons.person_id', 'users.person_id')
            .select(['users.user_id', 'users.username', 'persons.first_name', 'persons.last_name'])
            .execute()
    ]);

    // Add "Everyone" virtual role
    const allRoles = [{ role_id: 0, role_name: '_EVERYONE_' }, ...roles];

    return { roles: allRoles, users };
  });

export default app;
