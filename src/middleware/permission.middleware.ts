import { Elysia } from 'elysia';
import { PermissionService } from '../functions/permission.service';
import { PermissionKey } from '../config/permissions.config';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { auth } from './auth.middleware';

/**
 * Permission middleware for Elysia.
 * Automatically checks if the authenticated user has the required permission.
 * Includes bypass logic for managers (-1), principals, and admin_staff.
 */
export const permissions = (key: PermissionKey) => 
  new Elysia()
    .use(auth)
    .derive(async ({ user }: any) => {
        if (!user) throw new UnauthorizedError('Not authenticated');
        
        const has = await PermissionService.hasPermission(user.user_id, key, user);
        
        if (!has) {
            throw new ForbiddenError(`Missing permission: ${key}`);
        }
        
        return { 
            hasPermission: has 
        };
    });
