import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

import { DocumentPermissionService } from '../../../../functions/document_permission.service';

const UPLOAD_DIR = './uploads';

const app = new Elysia().delete(
  '/documents/delete',
  async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    const { document_id, type } = body;

    if (!document_id) {
      return Response.json({ error: 'invalid_body' }, { status: 422 });
    }

    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' }, { status: 401 });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.user_id', 'users.user_id')
      .select([
        'tokens.user_id',
        'users.person_id',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' }, { status: 401 });
    }

    const hasWriteAccess = await DocumentPermissionService.hasAccess(auth.user_id, document_id, 'WRITE');
    if (!hasWriteAccess) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    // === Get Document ===
    const document = await db.selectFrom('documents')
      .leftJoin('files', 'files.file_id', 'documents.file_id')
      .select([
        'documents.document_id',
        'documents.file_id',
        'documents.type',
        'files.storage_path',
        'files.file_uuid'
      ])
      .where('documents.document_id', '=', document_id)
      .executeTakeFirst();

    if (!document) {
      return Response.json({ error: 'document_not_found' }, { status: 404 });
    }

    try {
      if (type === 'complete_delete') {
        // Recursively find all children if it's a folder
        const allDocsToDelete: number[] = [document.document_id];
        const allFilesToDelete: { file_id: number, storage_path: string | null }[] = [];
        
        if (document.file_id) {
            allFilesToDelete.push({ file_id: document.file_id, storage_path: document.storage_path });
        }

        if (document.type === 'folder') {
          const getChildren = async (parentId: number) => {
            const children = await db.selectFrom('documents')
              .leftJoin('files', 'files.file_id', 'documents.file_id')
              .select(['documents.document_id', 'documents.file_id', 'documents.type', 'files.storage_path'])
              .where('documents.parent_id', '=', parentId)
              .execute();

            for (const child of children) {
              allDocsToDelete.push(child.document_id);
              if (child.file_id) {
                allFilesToDelete.push({ file_id: child.file_id, storage_path: child.storage_path });
              }
              if (child.type === 'folder') {
                await getChildren(child.document_id);
              }
            }
          };
          await getChildren(document.document_id);
        }

        // Delete from documents table
        await db.deleteFrom('documents')
          .where('document_id', 'in', allDocsToDelete)
          .execute();

        // Handle file deletion
        for (const f of allFilesToDelete) {
          // Set deleted_at in files table instead of hard delete
          await db.updateTable('files')
            .set({ deleted_at: new Date() })
            .where('file_id', '=', f.file_id)
            .execute();

          // Physically delete from disk if storage_path exists
          if (f.storage_path) {
            const filepath = resolve(UPLOAD_DIR, f.storage_path);
            if (filepath.startsWith(resolve(UPLOAD_DIR)) && existsSync(filepath)) {
              await unlink(filepath).catch(err => console.error(`Failed to delete file ${filepath}:`, err));
            }
          }
        }
      } else {
        // remove_access - only delete from documents table
        // For folders, we should also delete children from documents table? 
        // If we "remove access" to a folder, the user shouldn't see it or its content.
        
        const allDocsToRemove: number[] = [document.document_id];
        
        if (document.type === 'folder') {
            const getChildrenIds = async (parentId: number) => {
                const children = await db.selectFrom('documents')
                    .select(['document_id', 'type'])
                    .where('documents.parent_id', '=', parentId)
                    .execute();
                for(const child of children) {
                    allDocsToRemove.push(child.document_id);
                    if (child.type === 'folder') {
                        await getChildrenIds(child.document_id);
                    }
                }
            }
            await getChildrenIds(document.document_id);
        }

        await db.deleteFrom('documents')
          .where('document_id', 'in', allDocsToRemove)
          .execute();
      }

      return { success: true };
    } catch (e: any) {
      console.error('Delete error:', e);
      return Response.json({ error: 'internal_error', details: e.message }, { status: 500 });
    }
  },
  {
    body: t.Object({
      document_id: t.Number(),
      type: t.String()
    })
  }
);

export default app;
