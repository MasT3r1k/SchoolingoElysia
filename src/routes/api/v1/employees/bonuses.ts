import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';


const bonusesRouter = new Elysia()
  // GET /employees/bonuses - Get bonuses
  .get('/employees/bonuses', async({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.BONUSES_VIEW);
    if (!perm && user.person_id !== query.employeeId) return { error: 'no_permission' };

    // Check permissions - only admins can view all
    const canViewAll = perm;
    
    let queryBuilder = db.selectFrom('employee_bonuses')
      .leftJoin('teachers', 'employee_bonuses.teacher_id', 'teachers.person_id')
      .leftJoin('persons', 'teachers.person_id', 'persons.person_id')
      .select([
        'employee_bonuses.bonus_id',
        'employee_bonuses.teacher_id',
        'persons.first_name',
        'persons.last_name',
        'employee_bonuses.date',
        'employee_bonuses.amount',
        'employee_bonuses.type',
        'employee_bonuses.reason',
        'employee_bonuses.paid',
        'employee_bonuses.paid_date',
      ])

    // Filter by employee
    if (!canViewAll) {
      queryBuilder = queryBuilder.where('employee_bonuses.teacher_id', '=', user.person_id);
    } else if (query.employeeId) {
      queryBuilder = queryBuilder.where('employee_bonuses.teacher_id', '=', query.employeeId);
    }

    // Filter by type
    if (query.type) {
      queryBuilder = queryBuilder.where('employee_bonuses.type', '=', query.type as any);
    }

    // Filter by paid status
    if (query.paid !== undefined) {
      queryBuilder = queryBuilder.where('employee_bonuses.paid', '=', query.paid === 'true');
    }

    // Date range
    if (query.dateFrom) {
      queryBuilder = queryBuilder.where('employee_bonuses.date', '>=', query.dateFrom);
    }
    if (query.dateTo) {
      queryBuilder = queryBuilder.where('employee_bonuses.date', '<=', query.dateTo);
    }

    const results = await queryBuilder
      .orderBy('employee_bonuses.date', 'desc')
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();

    // Get total unpaid bonuses for current user
    let unpaidTotal = 0;
    if (!canViewAll) {
      const unpaid = await db.selectFrom('employee_bonuses')
        .select(db.fn.sum<number>('amount').as('total'))
        .where('teacher_id', '=', user.person_id)
        .where('paid', '=', false)
        .executeTakeFirst();
      unpaidTotal = unpaid?.total || 0;
    }

    return Response.json({ 
      data: results,
      unpaidTotal: canViewAll ? undefined : unpaidTotal
    });

  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
      offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
      employeeId: t.Optional(t.Number()),
      type: t.Optional(t.String()),
      paid: t.Optional(t.String()),
      dateFrom: t.Optional(t.String()),
      dateTo: t.Optional(t.String()),
    })
  })
  // POST /employees/bonuses - Add bonus (admin only)
  .post('/employees/bonuses', async({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.BONUSES_MANAGE);
    if (!perm) return { error: 'no_permission' };
    

    await db.insertInto('employee_bonuses')
      .values({
        teacher_id: body.teacherId,
        date: body.date || new Date().toISOString().split('T')[0],
        amount: body.amount,
        type: body.type as any,
        reason: body.reason,
        approved_by: user.user_id,
        paid: false,
        paid_date: null,
      })
      .execute();

    return Response.json({ success: true, message: 'Bonus added' });

  }, {
    body: t.Object({
      teacherId: t.Number(),
      date: t.Optional(t.String()),
      amount: t.Number(),
      type: t.String(), // performance, annual, project, other
      reason: t.String(),
    })
  })
  // PUT /employees/bonuses/:id - Update bonus
  .put('/employees/bonuses/:id', async({ cookie, params, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.BONUSES_MANAGE);
    if (!perm && user.person_id != params.id) return { error: 'no_permission' };
    const bonusId = parseInt(params.id);
    

    await db.updateTable('employee_bonuses')
      .set({
        amount: body.amount,
        type: body.type as any,
        reason: body.reason,
      })
      .where('bonus_id', '=', bonusId)
      .execute();

    return Response.json({ success: true, message: 'Bonus updated' });

  }, {
    body: t.Object({
      amount: t.Optional(t.Number()),
      type: t.Optional(t.String()),
      reason: t.Optional(t.String()),
    })
  })
  // PUT /employees/bonuses/:id/paid - Mark as paid
  .put('/employees/bonuses/:id/paid', async({ cookie, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.BONUSES_MANAGE);
    if (!perm && user.person_id != params.id) return { error: 'no_permission' };
    const bonusId = parseInt(params.id);
    

    await db.updateTable('employee_bonuses')
      .set({
        paid: true,
        paid_date: new Date().toISOString().split('T')[0],
      })
      .where('bonus_id', '=', bonusId)
      .execute();

    return Response.json({ success: true, message: 'Bonus marked as paid' });
  })
  // DELETE /employees/bonuses/:id - Delete bonus (only if not paid)
  .delete('/employees/bonuses/:id', async({ cookie, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.BONUSES_MANAGE);
    if (!perm && user.person_id != params.id) return { error: 'no_permission' };
    const bonusId = parseInt(params.id);
    

    // Check if paid
    const bonus = await db.selectFrom('employee_bonuses')
      .select('paid')
      .where('bonus_id', '=', bonusId)
      .executeTakeFirst();

    if (bonus?.paid) {
      return new Response(JSON.stringify({ 
        error: 'bonus_already_paid' 
      }), { status: 400 });
    }

    await db.deleteFrom('employee_bonuses')
      .where('bonus_id', '=', bonusId)
      .execute();

    return Response.json({ success: true, message: 'Bonus deleted' });
  });

export default bonusesRouter;
