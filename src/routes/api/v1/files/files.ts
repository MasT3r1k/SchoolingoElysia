import { Elysia, t } from 'elysia';
import { sql } from 'kysely';
import { db } from '../../../../../database';
import { format_person_by_id } from '../../../../functions/format_person_by_id';

const app = new Elysia({ prefix: '/files' })

    // GET / - List available polls
    .get('/', async ({ cookie, query }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.manager', 'users.principal'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        const hasAccess = auth.manager === -1 || auth.principal;
        if (!hasAccess) {
            return { error: 'no_permission' };
        }

        let filesQuery = db.selectFrom('files')
        .select([
            'files.file_id',
            'files.file_uuid',
            'files.name',
            'files.real_file_name',
            'files.origin',
            'files.mime_type',
            'files.file_size',
            'files.storage_path',
            'files.owner_id',
            'files.created_at'
        ])
        .offset(query.offset)
        .limit(query.limit)
        
        if (query.user_id != -1) {
            filesQuery.where('files.owner_id', '=', query.user_id);
        }
        const files = await filesQuery.execute();

        return files;
    }, {
        query: t.Object({
            limit: t.Number({ default: 20, minimum: 0, maximum: 100 }),
            offset: t.Number({ default: 0, minimum: 0 }),
            user_id: t.Number({ default: -1 })
        })
    })

    // GET /:id - Get details (questions)
    .get('/stats', async ({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db.selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person', 'users.manager', 'users.principal'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) return { error: 'no_user', details: 'no_db' };

        const hasAccess = auth.manager === -1 || auth.principal;
        if (!hasAccess) {
            return { error: 'no_permission' };
        }

        const storage_limit = await db.selectFrom('schools')
        .select([
            'schools.total_storage_limit'
        ])
        .executeTakeFirst();

        const stats = await db.selectFrom('files')
        .select((eb) => [
            eb.fn.countAll<number>().as('files_count'),
            sql<number>`COALESCE(SUM(${eb.ref('files.file_size')}), 0)`.as('total_file_size'),
            sql<number>`COUNT(DISTINCT ${eb.ref('files.owner_id')})`.as('unique_owners')
        ])
        .executeTakeFirst();

        return {
            files_count: Number(stats?.files_count) ?? 0,
            total_file_size: Number(stats?.total_file_size) ?? 0,
            unique_owners: Number(stats?.unique_owners) ?? 0,
            storage_limit: Number(storage_limit?.total_storage_limit) ?? 0,
        };
    })

export default app;
