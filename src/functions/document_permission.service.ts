import { db } from "../../database"
import { PermissionService } from "./permission.service";

export class DocumentPermissionService {
    static async hasAccess(userId: number, documentId: number | null, type: 'READ' | 'WRITE'): Promise<boolean> {
        if (documentId === null) {
            // Root folder - for now accessible by all teachers or based on some global permission
            // But usually we check if the user is a teacher.
            return true; 
        }

        const user = await db.selectFrom('users')
            .select(['user_id', 'role', 'manager', 'principal'])
            .where('user_id', '=', userId)
            .executeTakeFirst();
        
        if (!user) return false;

        const isSuperUser = user.manager === -1 || user.manager === 1 || user.principal === true || user.role === 'admin_staff';
        if (isSuperUser) return true;

        const document = await db.selectFrom('documents')
            .select(['owner_id'])
            .where('documents.document_id', '=', documentId)
            .executeTakeFirst();
        
        if (!document) return false;
        if (document.owner_id === userId) return true;

        const roles = await PermissionService.getUserRoles(userId);
        const roleIds = roles.map(r => r.role_id);

        const allUserPerms = await db.selectFrom('document_permissions')
            .where('document_id', '=', documentId)
            .where((eb) => eb.or([
                eb('user_id', '=', userId),
                eb('role_id', 'in', roleIds.length > 0 ? [...roleIds, 0] : [0]) // 0 = Everyone
            ]))
            .select(['permission_type'])
            .execute();

        // DENY takes absolute priority
        if (allUserPerms.some(p => p.permission_type === 'DENY')) return false;

        const anyPermsForDocument = await db.selectFrom('document_permissions')
            .where('document_id', '=', documentId)
            .select(eb => eb.fn.countAll().as('count'))
            .executeTakeFirst();
        
        // If no permissions are set at all for this document
        if (Number(anyPermsForDocument?.count) === 0) {
            if (type === 'READ') return true;
            return isSuperUser || document?.owner_id === userId;
        }

        // If specific permissions exist, check if user has one
        if (type === 'READ') {
            return allUserPerms.some(p => p.permission_type === 'READ' || p.permission_type === 'WRITE');
        }
        return allUserPerms.some(p => p.permission_type === 'WRITE');
    }

    static async canViewPermissions(userId: number, documentId: number): Promise<boolean> {
        const user = await db.selectFrom('users')
            .select(['user_id', 'role', 'manager', 'principal'])
            .where('user_id', '=', userId)
            .executeTakeFirst();
        
        if (!user) return false;

        const isSuperUser = user.manager === -1 || user.manager === 1 || user.principal === true || user.role === 'admin_staff';
        if (isSuperUser) return true;

        const document = await db.selectFrom('documents')
            .select(['owner_id'])
            .where('documents.document_id', '=', documentId)
            .executeTakeFirst();
        
        return document?.owner_id === userId;
    }
}
