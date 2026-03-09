import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';
import { sql } from 'kysely';
import { PermissionService } from '../../../../functions/permission.service';
import { getAuthUser } from '../../../../utils/auth';

const elysiaApp = new Elysia()
  
  .post('/documents/files', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) {
        return Response.json({ error: 'no_user' });
    }

    const userRoles = await PermissionService.getUserRoles(user.user_id);
    const roleIds = userRoles.map(r => r.role_id);
    const isSuperUser = user.manager === -1 || user.principal === true || user.role === 'admin_staff';

    try {

        const files = await db
        .selectFrom('documents')
        .leftJoin('files', 'files.file_id', 'documents.file_id')
        .select((eb) => [
            'documents.document_id',
            'documents.parent_id',
            'documents.type',
            'documents.name',
            'files.file_uuid',
            'files.real_file_name',
            'files.file_format',
            'files.mime_type',
            'files.file_size',
            'files.thumbnail_path',
            'files.owner_id',
            'files.last_accessed_at',
            'files.modified_at',
            'documents.created_at',
            eb.selectFrom('documents as d2')
                .select(eb2 => eb2.fn.countAll().as('count'))
                .whereRef('d2.parent_id', '=', 'documents.document_id')
                .as('files_count'),
            eb.selectFrom('document_permissions as dp')
                .select(sql<string>`GROUP_CONCAT(dp.permission_type)`.as('perms'))
                .whereRef('dp.document_id', '=', 'documents.document_id')
                .where((eb2) => eb2.or([
                    eb2('dp.user_id', '=', user.user_id),
                    eb2('dp.role_id', 'in', roleIds.length > 0 ? [...roleIds, 0] : [0])
                ]))
                .as('effective_permissions')
        ])
        .where((eb) => eb.or([
            eb('files.deleted_at', 'is', null),
            eb('documents.type', '=', 'folder')
        ]))
        .where((eb) => {
            if (isSuperUser) return eb.and([]);
            return eb.and([
                // PRIORITY 1: Explicitly DENY takes precedence
                eb.not(
                    eb.exists(
                        eb.selectFrom('document_permissions as dp_deny')
                            .select(sql`1`.as('val'))
                            .whereRef('dp_deny.document_id', '=', 'documents.document_id')
                            .where('dp_deny.permission_type', '=', 'DENY')
                            .where((eb2) => eb2.or([
                                eb2('dp_deny.user_id', '=', user.user_id),
                                eb2('dp_deny.role_id', 'in', roleIds.length > 0 ? [...roleIds, 0] : [0])
                            ]))
                    )
                ),
                // PRIORITY 2: Owner or explicit READ/WRITE or Public (no perms)
                eb.or([
                    eb('files.owner_id', '=', user.user_id),
                    eb.exists(
                        eb.selectFrom('document_permissions as dp2')
                            .select(sql`1`.as('val'))
                            .whereRef('dp2.document_id', '=', 'documents.document_id')
                            .where('dp2.permission_type', 'in', ['READ', 'WRITE'])
                            .where((eb2) => eb2.or([
                                eb2('dp2.user_id', '=', user.user_id),
                                eb2('dp2.role_id', 'in', roleIds.length > 0 ? [...roleIds, 0] : [0])
                            ]))
                    ),
                    eb.not(
                        eb.exists(
                            eb.selectFrom('document_permissions as dp3')
                                .select(sql`1`.as('val'))
                                .whereRef('dp3.document_id', '=', 'documents.document_id')
                        )
                    )
                ])
            ])
        })
        .where('documents.parent_id', body.parent_id == null ? 'is' : '=', body.parent_id ?? null)
        .execute();

        const folderIds = files.filter(f => f.type === 'folder').map(f => f.document_id);
        let folderMeta: Record<number, { size: number, modified_at: Date | null }> = {};

        if (folderIds.length > 0) {
            const stats = await db.withRecursive('folder_hierarchy', (eb) => 
                eb.selectFrom('documents as d_base')
                  .where('d_base.document_id', 'in', folderIds)
                  .select(['d_base.document_id', 'd_base.file_id', 'd_base.type', 'd_base.document_id as root_id'])
                  .unionAll(
                    eb.selectFrom('documents as d')
                      .innerJoin('folder_hierarchy as fh', 'fh.document_id', 'd.parent_id')
                      .select(['d.document_id', 'd.file_id', 'd.type', 'fh.root_id'])
                  )
            )
            .selectFrom('folder_hierarchy')
            .leftJoin('files', 'files.file_id', 'folder_hierarchy.file_id')
            .select([
                'root_id', 
                (eb) => eb.fn.sum<number>('files.file_size').as('total_size'),
                (eb) => eb.fn.max('files.modified_at').as('max_modified')
            ])
            .where('folder_hierarchy.type', '=', 'file')
            .groupBy('root_id')
            .execute();

            stats.forEach(s => {
                folderMeta[s.root_id as number] = {
                    size: Number(s.total_size) || 0,
                    modified_at: s.max_modified ? new Date(s.max_modified as any) : null
                };
            });
        }

        return files.map(
          (file: any) => {
            let perms = file.effective_permissions ? file.effective_permissions.split(',') : [];
            if (isSuperUser || file.owner_id === user.user_id) {
                if (!perms.includes('READ')) perms.push('READ');
                if (!perms.includes('WRITE')) perms.push('WRITE');
            }
            // If no permissions are set at all for this file/folder, allow READ for everyone
            // and WRITE only for superusers or owners
            if (perms.length === 0) {
                perms = ['READ'];
                if (isSuperUser || file.owner_id === user.user_id) {
                    perms.push('WRITE');
                }
            }
            const canManage = isSuperUser || file.owner_id === user.user_id;
            return {
                ...file, 
                name: file.name == null ? file.real_file_name : file.name, 
                real_file_name: undefined,
                file_size: file.type === 'folder' ? (folderMeta[file.document_id]?.size || 0) : Number(file.file_size),
                modified_at: (file.type === 'folder' && folderMeta[file.document_id]?.modified_at) ? folderMeta[file.document_id].modified_at : (file.modified_at ?? file.created_at),
                permissions: perms,
                can_manage_permissions: canManage,
                effective_permissions: undefined
            };
          }
        );
    } catch (e: any) {
      console.error('[Documents API Error]:', e);
      return { error: 'failed_get_files', details: e.message };
    }
  }, {
    body: t.Object({
      parent_id: t.Nullable(t.Number())
    })
  });

export default elysiaApp;
