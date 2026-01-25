import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .post('/documents/files', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .innerJoin("passwords", "passwords.passwordId", "users.password")
        .select([
            'users.userId',
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
            'files.created_at',
            eb.selectFrom('documents as d2')
                .whereRef('d2.parent_id', '=', 'documents.file_id')
                .select((eb2) => eb2.fn.countAll().as('files_count'))
                .as('files_count')
        ])
        .where('files.deleted_at', 'is', null)
        .where('documents.parent_id', body.parent_id == null ? 'is' : '=', body.parent_id ?? null)
        .execute();


        console.log(files);

        return files.map(
          (file) => ({...file, name: file.name == null ? file.real_file_name : file.name, real_file_name: undefined })
        );
    } catch (e) {
      return { error: 'failed_get_files' };
    }
  }, {
    body: t.Object({
      parent_id: t.Nullable(t.Number())
    })
  });

export default elysiaApp;
