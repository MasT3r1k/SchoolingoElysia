import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';
import { sql } from 'kysely';

const elysiaApp = new Elysia()
  
  .post('/documents/files', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .innerJoin("passwords", "passwords.password_id", 'users.password_id')
        .select([
            'users.user_id',
            'users.username',
            'users.2fa',
            'users.2fa_secret',
            'passwords.password'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst()

    if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
    }

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
                .whereRef('d2.parent_id', '=', 'documents.document_id')
                .select((eb2) => eb2.fn.countAll().as('files_count'))
                .as('files_count')
        ])
        .where((eb) => eb.or([
            eb('files.deleted_at', 'is', null),
            eb('documents.type', '=', 'folder')
        ]))
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
          (file: any) => ({
            ...file, 
            name: file.name == null ? file.real_file_name : file.name, 
            real_file_name: undefined,
            file_size: file.type === 'folder' ? (folderMeta[file.document_id]?.size || 0) : Number(file.file_size),
            modified_at: (file.type === 'folder' && folderMeta[file.document_id]?.modified_at) ? folderMeta[file.document_id].modified_at : (file.modified_at ?? file.created_at)
          })
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
