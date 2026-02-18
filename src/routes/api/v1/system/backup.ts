import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';
import { backupService } from '../../../../functions/backup.service';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
    user: await getAuthUser(cookie?.token?.value as string)
  }))

  // POST /system/backup/interval - Update backup interval
  .post('/system/backup/interval', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { interval } = body; // 0: daily, 1: weekly, 2: monthly
    
    // Map interval index to hours
    let hours = 24;
    if (interval === 1) hours = 168; // 7 days
    if (interval === 2) hours = 720; // 30 days

    await Promise.all([
        db.updateTable('schools')
          .set({
            backup_interval: interval
          })
          .where('schoolId', '=', user.school)
          .execute(),
        backupService.updateInterval(hours)
    ]);

    return { success: true };
  }, {
    body: t.Object({
      interval: t.Number()
    })
  })

  // POST /system/backup/trigger - Trigger a manual backup
  .post('/system/backup/trigger', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    try {
        const backup = await backupService.createBackup(body.description || 'Manual backup triggered via API');
        
        // Save to our new backups logging table
        await db.insertInto('backups')
            .values({
                filename: backup.filename,
                size: backup.size,
                type: 'manual',
                status: 'success',
                school_id: user.school as number
            })
            .execute();

        return { success: true, filename: backup.filename };
    } catch (error: any) {
        // Log failure to backups table too
         await db.insertInto('backups')
         .values({
             filename: 'failed_backup_' + Date.now(),
             size: 0,
             type: 'manual',
             status: 'failed',
             school_id: user.school as number
         })
         .execute();

        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
  }, {
    body: t.Object({
      description: t.Optional(t.String())
    })
  })

  // GET /system/backup/list - List all backups
  .get('/system/backup/list', async ({ user }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const backups = await db.selectFrom('backups')
      .selectAll()
      .where('school_id', '=', user.school)
      .orderBy('created', 'desc')
      .execute();
      
    return backups;
  });


export default app;
