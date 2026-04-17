import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  // GET /system/reports - List my reports and shared reports
  .get('/system/reports', async ({ cookie }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const myReports = await db
      .selectFrom('saved_reports')
      .selectAll()
      .where('user_id', '=', user.user_id)
      .orderBy('updated_at', 'desc')
      .execute();

    const sharedReports = await db
      .selectFrom('saved_report_shares')
      .innerJoin('saved_reports', 'saved_reports.report_id', 'saved_report_shares.report_id')
      .innerJoin('users', 'users.user_id', 'saved_reports.user_id')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .select([
        'saved_reports.report_id',
        'saved_reports.user_id',
        'saved_reports.name',
        'saved_reports.type',
        'saved_reports.config',
        'saved_reports.created_at',
        'saved_reports.updated_at',
        'persons.first_name as owner_first_name',
        'persons.last_name as owner_last_name'
      ])
      .where('saved_report_shares.user_id', '=', user.user_id)
      .orderBy('saved_reports.updated_at', 'desc')
      .execute();

    return {
      success: true,
      data: {
        myReports,
        sharedWithMe: sharedReports
      }
    };
  })

  // GET /system/reports/:id - Get single report details
  .get('/system/reports/:id', async ({ cookie, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const reportId = Number(params.id);
    if (isNaN(reportId)) return { error: 'invalid_id' };

    const report = await db
      .selectFrom('saved_reports')
      .selectAll()
      .where('report_id', '=', reportId)
      .executeTakeFirst();

    if (!report) return { error: 'not_found' };

    // Check permission (owner or shared)
    if (report.user_id !== user.user_id) {
      const isShared = await db
        .selectFrom('saved_report_shares')
        .where('report_id', '=', reportId)
        .where('user_id', '=', user.user_id)
        .executeTakeFirst();
      if (!isShared) return { error: 'no_permission' };
    }

    return { success: true, data: report };
  })

  // POST /system/reports - Save new report
  .post('/system/reports', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const { name, type, config } = body;

    const result = await db
      .insertInto('saved_reports')
      .values({
        user_id: user.user_id,
        name,
        type,
        config: JSON.stringify(config)
      } as any)
      .executeTakeFirst();

    return { success: true, report_id: Number(result.insertId) };
  }, {
    body: t.Object({
      name: t.String(),
      type: t.String(),
      config: t.Any()
    })
  })

  // PATCH /system/reports/:id - Update report
  .patch('/system/reports/:id', async ({ cookie, params, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const reportId = Number(params.id);
    if (isNaN(reportId)) return { error: 'invalid_id' };

    const report = await db
      .selectFrom('saved_reports')
      .select('user_id')
      .where('report_id', '=', reportId)
      .executeTakeFirst();

    if (!report) return { error: 'not_found' };
    if (report.user_id !== user.user_id) return { error: 'no_permission' };

    const { name, type, config } = body;
    const updates: any = { updated_at: new Date() };
    if (name) updates.name = name;
    if (type) updates.type = type;
    if (config) updates.config = JSON.stringify(config);

    await db
      .updateTable('saved_reports')
      .set(updates)
      .where('report_id', '=', reportId)
      .execute();

    return { success: true };
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      type: t.Optional(t.String()),
      config: t.Optional(t.Any())
    })
  })

  // DELETE /system/reports/:id - Delete report
  .delete('/system/reports/:id', async ({ cookie, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const reportId = Number(params.id);
    if (isNaN(reportId)) return { error: 'invalid_id' };

    const report = await db
      .selectFrom('saved_reports')
      .select('user_id')
      .where('report_id', '=', reportId)
      .executeTakeFirst();

    if (!report) return { error: 'not_found' };
    if (report.user_id !== user.user_id) return { error: 'no_permission' };

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('saved_report_shares').where('report_id', '=', reportId).execute();
      await trx.deleteFrom('saved_reports').where('report_id', '=', reportId).execute();
    });

    return { success: true };
  })

  // POST /system/reports/:id/share - Share report
  .post('/system/reports/:id/share', async ({ cookie, params, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const reportId = Number(params.id);
    const { user_id } = body; // recipient

    const report = await db
      .selectFrom('saved_reports')
      .select('user_id')
      .where('report_id', '=', reportId)
      .executeTakeFirst();

    if (!report) return { error: 'not_found' };
    if (report.user_id !== user.user_id) return { error: 'no_permission' };

    await db
      .insertInto('saved_report_shares')
      .values({
        report_id: reportId,
        user_id,
        shared_by: user.user_id
      } as any)
      .execute();

    return { success: true };
  }, {
    body: t.Object({
      user_id: t.Number()
    })
  })

  // DELETE /system/reports/:id/share/:user_id - Unshare report
  .delete('/system/reports/:id/share/:user_id', async ({ cookie, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const reportId = Number(params.id);
    const recipientId = Number(params.user_id);

    const report = await db
      .selectFrom('saved_reports')
      .select('user_id')
      .where('report_id', '=', reportId)
      .executeTakeFirst();

    if (!report) return { error: 'not_found' };
    if (report.user_id !== user.user_id) return { error: 'no_permission' };

    await db
      .deleteFrom('saved_report_shares')
      .where('report_id', '=', reportId)
      .where('user_id', '=', recipientId)
      .execute();

    return { success: true };
  })
  
  // GET /system/reports/:id/shares - List who report is shared with
  .get('/system/reports/:id/shares', async ({ cookie, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };

    const reportId = Number(params.id);
    const report = await db
      .selectFrom('saved_reports')
      .select('user_id')
      .where('report_id', '=', reportId)
      .executeTakeFirst();

    if (!report) return { error: 'not_found' };
    if (report.user_id !== user.user_id) return { error: 'no_permission' };

    const shares = await db
      .selectFrom('saved_report_shares')
      .innerJoin('users', 'users.user_id', 'saved_report_shares.user_id')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .select([
        'users.user_id',
        'users.username',
        'persons.first_name',
        'persons.last_name'
      ])
      .where('report_id', '=', reportId)
      .execute();

    return { success: true, data: shares };
  });

export default app;
