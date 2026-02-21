import { Elysia, t } from 'elysia';
import { sql } from 'kysely';
import { db } from '../../../../../database';
import { format_person_by_id } from '../../../../functions/format_person_by_id';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const mimeGroups: any = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
    archive: ['.zip', '.rar', '.7z', '.tar', '.gz'],
};

const app = new Elysia({ prefix: '/files' })

    // GET / - List available polls
    .get('/', async ({ cookie, query }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['users.person_id', 'users.manager', 'users.principal', 'users.school_id'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

        const hasAccess = auth.manager === -1 || auth.principal;
        if (!hasAccess) {
            return { error: 'no_permission' };
        }

        let filesQuery = db.selectFrom('files')
        .leftJoin('users', 'users.person_id', 'files.owner_id')
        .where('users.school_id', '=', auth.school_id)
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

        if (query.name && query.name != '') {
            const safeName = query.name.replace(/[%_]/g, '\\$&');
            filesQuery = filesQuery.where('files.real_file_name', 'like', `%${safeName}%`);
        }
        
        if (query.user_id != -1) {
            filesQuery = filesQuery.where('files.owner_id', '=', query.user_id);
        }

        if (query.type && query.type !== 'all') {
            const type = query.type;

            if (type === 'other') {
                // Vybere vše, co nepatří do definovaných skupin
                const allKnownExtensions: any = Object.values(mimeGroups).flat();
                filesQuery = filesQuery.where('files.file_format', 'not in', allKnownExtensions);
            } 
            else if (mimeGroups[type]) {
                // Vybere přípony pro danou kategorii (image, document, atd.)
                filesQuery = filesQuery.where('files.file_format', 'in', mimeGroups[type]);
            }
        }

        const filesData = await filesQuery.execute();

        const files = await Promise.all(
            filesData.map(async (file) => ({
                ...file,
                owner: await format_person_by_id(file.owner_id!)
            }))
        );

        return files;
    }, {
        query: t.Object({
            limit: t.Number({ default: 20, minimum: 0, maximum: 100 }),
            offset: t.Number({ default: 0, minimum: 0 }),
            user_id: t.Number({ default: -1 }),
            name: t.Optional(t.String()),
            type: t.Optional(t.String())
        })
    })

    // GET /:id - Get details (questions)
    .get('/stats', async ({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return { error: 'no_user', details: 'no_cookie' };

        const auth = await db.selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['users.person_id', 'users.manager', 'users.principal', 'users.school_id'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

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
        .innerJoin('users', 'users.person_id', 'files.owner_id')
        .select((eb) => [
            eb.fn.countAll<number>().as('files_count'),
            sql<number>`COALESCE(SUM(${eb.ref('files.file_size')}), 0)`.as('total_file_size'),
            sql<number>`COUNT(DISTINCT ${eb.ref('files.owner_id')})`.as('unique_owners')
        ])
        .where('users.school_id', '=', auth.school_id)
        .executeTakeFirst();

        return {
            files_count: Number(stats?.files_count) ?? 0,
            total_file_size: Number(stats?.total_file_size) ?? 0,
            unique_owners: Number(stats?.unique_owners) ?? 0,
            storage_limit: Number(storage_limit?.total_storage_limit) ?? 0,
        };
    })

export default app;
