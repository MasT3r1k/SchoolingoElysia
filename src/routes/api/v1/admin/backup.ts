/**
 * Backup API Endpoints
 * Manual backup management endpoints for administrators
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { backupService } from '../../../../functions/backup.service';

const app = new Elysia()
    // List all backups
    .get('/backup', async ({ cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        // Check admin role
        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || auth.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const backups = await backupService.listBackups();
        return Response.json({ 
            backups: backups.map(b => ({
                filename: b.filename,
                size: b.size,
                createdAt: b.createdAt,
                compressed: b.compressed
            }))
        });
    })

    // Create new backup
    .post('/backup', async ({ body, cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || auth.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        try {
            const { description } = body as any;
            const backup = await backupService.createBackup(description);
            
            return Response.json({
                success: true,
                backup: {
                    filename: backup.filename,
                    size: backup.size,
                    createdAt: backup.createdAt,
                    compressed: backup.compressed
                }
            });
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }, {
        body: t.Object({
            description: t.Optional(t.String())
        })
    })

    // Download backup
    .get('/backup/:filename', async ({ params, cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || auth.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const backups = await backupService.listBackups();
        const backup = backups.find(b => b.filename === params.filename);
        
        if (!backup) {
            return Response.json({ error: 'not_found' }, { status: 404 });
        }

        const file = Bun.file(backup.path);
        return new Response(file, {
            headers: {
                'Content-Disposition': `attachment; filename="${backup.filename}"`,
                'Content-Type': backup.compressed ? 'application/gzip' : 'application/sql'
            }
        });
    }, {
        params: t.Object({
            filename: t.String()
        })
    })

    // Delete backup
    .delete('/backup/:filename', async ({ params, cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || auth.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        try {
            await backupService.deleteBackup(params.filename);
            return Response.json({ success: true });
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 404 });
        }
    }, {
        params: t.Object({
            filename: t.String()
        })
    })

    // Restore from backup
    .post('/backup/:filename/restore', async ({ params, cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || auth.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        try {
            await backupService.restoreBackup(params.filename);
            return Response.json({ success: true, message: 'Database restored successfully' });
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }, {
        params: t.Object({
            filename: t.String()
        })
    });

export default app;
