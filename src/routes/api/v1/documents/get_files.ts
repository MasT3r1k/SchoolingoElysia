import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  .use(rateLimit({
    scoping: "scoped",
    max: 10,
    duration: 1000,
    injectServer: () => app.server
  }))
  .post('/documents/files', async ({ cookie, body }) => {
    const token = cookie.token.value;
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
        .select((eb) => [
            'documents.file_id',
            'documents.parent_id',
            'documents.type',
            'documents.name',
            'documents.real_file_name',
            'documents.file_format',
            'documents.mime_type',
            'documents.file_size',
            'documents.storage_path',
            'documents.thumbnail_path',
            'documents.owner_id',
            'documents.last_accessed_at',
            'documents.modified_at',
            'documents.created_at',
            eb.selectFrom('documents as d2')
                .whereRef('d2.parent_id', '=', 'documents.file_id')
                .select((eb2) => eb2.fn.countAll().as('files_count'))
                .as('files_count')
        ])
        .where('documents.is_deleted', '=', false)
        .where('documents.parent_id', body.parent_id == null ? 'is' : '=', body.parent_id ?? null)
        .execute();


        console.log(files);

        return files;
    } catch (e) {
      return { error: 'failed_get_files' };
    }
  }, {
    body: t.Object({
        parent_id: t.Nullable(t.Number())
    })
  });

export default elysiaApp;
