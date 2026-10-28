import { Elysia } from 'elysia';
import { db } from '../database/connection';
import type { PermissionKey } from '../config/permissions.config';
import { ForbiddenError, UnauthorizedError } from '../errors/http-errors';
import { requireAuth, type AuthUser } from './auth.guard';

export class PermissionEvaluator {
  static async hasPermission(
    userId: number,
    permission: PermissionKey | string,
    userContext?: AuthUser | null
  ): Promise<boolean> {
    let user: AuthUser | null = userContext ?? null;

    if (!user) {
      const dbUser = await db
        .selectFrom('users')
        .select(['manager', 'principal', 'role', 'school_id', 'user_id', 'person_id', 'username', 'locale'])
        .where('user_id', '=', userId)
        .executeTakeFirst();

      if (!dbUser) return false;

      user = {
        user_id: dbUser.user_id,
        person_id: dbUser.person_id,
        username: dbUser.username,
        locale: dbUser.locale,
        is_principal: Boolean(dbUser.principal),
        manager: dbUser.manager,
        role: dbUser.role as AuthUser['role'],
        school_id: dbUser.school_id,
      };
    }

    if (!user) return false;

    if (user.manager === -1 || user.is_principal || user.role === 'admin_staff' || user.role === 'management') {
      return true;
    }

    if (user.role === permission) {
      return true;
    }

    const directPerm = await db
      .selectFrom('user_permissions')
      .innerJoin('permissions', 'permissions.permission_id', 'user_permissions.permission_id')
      .where('user_permissions.user_id', '=', userId)
      .where('permissions.permission_name', '=', permission)
      .select('permissions.permission_id')
      .executeTakeFirst();

    if (directPerm) return true;

    if (user.role) {
      const rolePerm = await db
        .selectFrom('roles')
        .innerJoin('role_permissions', 'role_permissions.role_id', 'roles.role_id')
        .innerJoin('permissions', 'permissions.permission_id', 'role_permissions.permission_id')
        .where('roles.role_key', '=', user.role)
        .where('permissions.permission_name', '=', permission)
        .select('permissions.permission_id')
        .executeTakeFirst();

      if (rolePerm) return true;
    }

    const userRolePerm = await db
      .selectFrom('user_roles')
      .innerJoin('roles', 'roles.role_id', 'user_roles.role_id')
      .innerJoin('role_permissions', 'role_permissions.role_id', 'roles.role_id')
      .innerJoin('permissions', 'permissions.permission_id', 'role_permissions.permission_id')
      .where('user_roles.user_id', '=', userId)
      .where('permissions.permission_name', '=', permission)
      .select('permissions.permission_id')
      .executeTakeFirst();

    return Boolean(userRolePerm);
  }
}

export const requirePermission = (permission: PermissionKey | string) =>
  new Elysia({ name: `require-permission-${permission}` })
    .use(requireAuth)
    .derive({ as: 'scoped' }, async ({ user }) => {
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }
      const has = await PermissionEvaluator.hasPermission(user.user_id, permission, user);
      if (!has) {
        throw new ForbiddenError(`Access denied. Missing required permission: ${permission}`);
      }
      return { hasPermission: true };
    });
