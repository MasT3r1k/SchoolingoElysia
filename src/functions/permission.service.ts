import { db } from "../../database";
import { PermissionKey } from "../config/permissions.config";

export class PermissionService {
  /**
   * Checks if a user has a specific permission.
   * Permissions are checked through assigned roles and direct user permissions.
   */
  static async hasPermission(userId: number, permission: PermissionKey, userContext?: any): Promise<boolean> {
    // 0. Check for superuser bypass
    let user = userContext;
    if (!user) {
      user = await db.selectFrom('users')
        .select(['manager', 'principal', 'role'])
        .where('user_id', '=', userId)
        .executeTakeFirst();
    }

    if (user) {
      if (user.manager == -1 || user.principal == true || user.principal == 1 || user.isPrincipal == true || user.is_principal == true || user.role == 'admin_staff') {
        return true;
      }

      if (user.role == permission) {
        return true;
      }
    }

    // 1. Check direct user permissions
    const directPermission = await db
      .selectFrom('user_permissions')
      .innerJoin('permissions', 'permissions.permission_id', 'user_permissions.permission_id')
      .where('user_permissions.user_id', '=', userId)
      .where('permissions.permission_name', '=', permission)
      .select('permissions.permission_id')
      .executeTakeFirst();

    if (directPermission) return true;

    // 2. Check permissions via roles
    const rolePermission = await db
      .selectFrom('user_roles')
      .leftJoin('roles', 'roles.role_id', 'user_roles.role_id')
      .leftJoin('role_permissions', 'role_permissions.role_id', 'user_roles.role_id')
      .leftJoin('permissions', 'permissions.permission_id', 'role_permissions.permission_id')
      .where((eb) => eb.or([
        eb('user_roles.user_id', '=', userId),
        eb('roles.role_key', '=', user.role)
      ]))
      .where('permissions.permission_name', '=', permission)
      .select('permissions.permission_id')
      .executeTakeFirst();

    if (rolePermission) return true;

    const userRolePermission = await db
      .selectFrom('users')
      .leftJoin('roles', 'roles.role_key', 'users.role')
      .leftJoin('role_permissions', 'role_permissions.role_id', 'roles.role_id')
      .leftJoin('permissions', 'permissions.permission_id', 'role_permissions.permission_id')
      .where('users.user_id', '=', userId)
      .where('permissions.permission_name', '=', permission)
      .select('permissions.permission_id')
      .executeTakeFirst();

    return !!userRolePermission;
  }

  /**
   * Retrieves all unique permission names assigned to a user.
   */
  static async getUserPermissions(userId: number): Promise<string[]> {
    // Direct permissions
    const direct = await db
      .selectFrom('user_permissions')
      .innerJoin('permissions', 'permissions.permission_id', 'user_permissions.permission_id')
      .where('user_permissions.user_id', '=', userId)
      .select('permissions.permission_name')
      .execute();

    // Role-based permissions
    const fromRoles = await db
      .selectFrom('user_roles')
      .innerJoin('role_permissions', 'role_permissions.role_id', 'user_roles.role_id')
      .innerJoin('permissions', 'permissions.permission_id', 'role_permissions.permission_id')
      .where('user_roles.user_id', '=', userId)
      .select('permissions.permission_name')
      .execute();

    const allPermissions = new Set([
      ...direct.map(p => p.permission_name),
      ...fromRoles.map(p => p.permission_name)
    ]);

    return Array.from(allPermissions);
  }

  /**
   * Retrieves all roles assigned to a user.
   */
  static async getUserRoles(userId: number) {
    return await db
      .selectFrom('user_roles')
      .innerJoin('roles', 'roles.role_id', 'user_roles.role_id')
      .where('user_roles.user_id', '=', userId)
      .select(['roles.role_id', 'roles.role_name', 'roles.role_key', 'roles.description'])
      .execute();
  }

  /**
   * Assigns a role to a user.
   */
  static async assignRoleToUser(userId: number, roleId: number) {
    return await db
      .insertInto('user_roles')
      .values({ user_id: userId, role_id: roleId })
      .execute();
  }

  /**
   * Removes a role from a user.
   */
  static async removeRoleFromUser(userId: number, roleId: number) {
    return await db
      .deleteFrom('user_roles')
      .where('user_id', '=', userId)
      .where('role_id', '=', roleId)
      .execute();
  }

  /**
   * Assigns a direct permission to a user.
   */
  static async assignPermissionToUser(userId: number, permissionId: number) {
    return await db
      .insertInto('user_permissions')
      .values({ user_id: userId, permission_id: permissionId })
      .execute();
  }

  /**
   * Removes a direct permission from a user.
   */
  static async removePermissionFromUser(userId: number, permissionId: number) {
    return await db
      .deleteFrom('user_permissions')
      .where('user_id', '=', userId)
      .where('permission_id', '=', permissionId)
      .execute();
  }
}
