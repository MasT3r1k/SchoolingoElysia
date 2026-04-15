import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { getAuthUser } from '../../../../utils/auth';


export const vacationsRouter = new Elysia({ prefix: '/vacations' })
  // GET /balance - Get vacation balance
  .get('/balance', async({ cookie, school, query, params = {} }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    
    const employeeId = parseInt(params.id);
    if (isNaN(employeeId)) return { error: 'invalid_id' };

    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.VACATIONS_VIEW);
    if (!perm && user.person_id !== employeeId) return { error: 'no_permission' };

    const canViewAll = perm;
    const year = query.year || new Date().getFullYear();

    let balance = await db.selectFrom('employee_vacation_balance')
      .selectAll()
      .where('teacher_id', '=', employeeId)
      .where('year', '=', year)
      .executeTakeFirst();

    if (!balance && employeeId) {
      // Auto-assign default vacation days from school settings
      const defaultEntitlement = school.employee_vacation_days_default ?? 25;
      
      try {
        await db.insertInto('employee_vacation_balance')
            .values({
                teacher_id: employeeId,
                year: year,
                entitlement: defaultEntitlement,
                used: 0,
                remaining: defaultEntitlement
            })
            .execute();
            
        // Fetch the newly created record
        balance = await db.selectFrom('employee_vacation_balance')
            .selectAll()
            .where('teacher_id', '=', employeeId)
            .where('year', '=', year)
            .executeTakeFirst();
      } catch (e) {
        console.error("Error creating default balance:", e);
      }
    }

    if (!balance) {
         return Response.json({
            teacherId: employeeId,
            year,
            entitlement: 0, 
            used: 0,
            remaining: 0
          });
    }

    return Response.json(balance);

  }, {
    query: t.Object({
      employeeId: t.Optional(t.Number()),
      year: t.Optional(t.Number()),
    })
  })
  // POST /balance/adjust - Adjust vacation entitlement (Admin only)
  .post('/balance/adjust', async({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.VACATIONS_MANAGE);
    if (!perm) return { error: 'no_permission' };

    const currentYear = new Date().getFullYear();

    // Check if balance exists, if not create it
    const balance = await db.selectFrom('employee_vacation_balance')
        .select(['remaining', 'entitlement'])
        .where('teacher_id', '=', body.employeeId)
        .where('year', '=', currentYear)
        .executeTakeFirst();

    if (!balance) {
        await db.insertInto('employee_vacation_balance')
        .values({
            teacher_id: body.employeeId,
            year: currentYear,
            entitlement: body.amount,
            used: 0,
            remaining: body.amount
        })
        .execute();
    } else {
        await db.updateTable('employee_vacation_balance')
        .set({
            entitlement: body.amount,
            remaining: sql`(${body.amount} - used)`
        } as any)
        .where('teacher_id', '=', body.employeeId)
        .where('year', '=', currentYear)
        .execute();
    }

    return Response.json({ success: true });

  }, {
    body: t.Object({
        employeeId: t.Number(),
        amount: t.Number(), // Can be positive or negative
        reason: t.Optional(t.String())
    })
  })
  // GET /requests - Get vacation requests
  .get('/requests', async({ cookie, query, params = {} }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    
    const employeeId = params.id ? parseInt(params.id) : (query.employeeId ? parseInt(query.employeeId) : null);
    if (params.id && isNaN(employeeId!)) return { error: 'invalid_id' };

    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.VACATIONS_VIEW);
    if (!perm && user.person_id !== employeeId) return { error: 'no_permission' };

    const canViewAll = perm;
    
    let queryBuilder = db.selectFrom('employee_vacation_requests')
      .leftJoin('teachers', 'employee_vacation_requests.teacher_id', 'teachers.person_id')
      .leftJoin('persons', 'teachers.person_id', 'persons.person_id')
      .select([
        'employee_vacation_requests.request_id',
        'employee_vacation_requests.teacher_id',
        'persons.first_name',
        'persons.last_name',
        'employee_vacation_requests.start_date',
        'employee_vacation_requests.end_date',
        'employee_vacation_requests.days',
        'employee_vacation_requests.type',
        'employee_vacation_requests.status',
        'employee_vacation_requests.reason',
        'employee_vacation_requests.created_at',
        'employee_vacation_requests.approved_at',
      ])

    // Filter by status
    if (query.status && query.status !== 'all') {
      queryBuilder = queryBuilder.where('employee_vacation_requests.status', '=', query.status as any);
    }

    // Filter by type
    if (query.type) {
      queryBuilder = queryBuilder.where('employee_vacation_requests.type', '=', query.type as any);
    }

    // If not admin, only show own requests
    if (!canViewAll) {
      queryBuilder = queryBuilder.where('employee_vacation_requests.teacher_id', '=', user.person_id);
    } else {
      queryBuilder = queryBuilder.where('employee_vacation_requests.teacher_id', '=', employeeId);
    }


    const results = await queryBuilder
      .orderBy('employee_vacation_requests.created_at', 'desc')
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();

    const personNames = await format_person_map_by_ids(results.map((r) => r.teacher_id));
    const data = results.map((r) => ({...r, full_name: personNames.get(r.teacher_id)}));

    return Response.json({ data });

  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
      offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
      status: t.Optional(t.String()),
      type: t.Optional(t.String()),
    })
  })
  // POST /request - Create vacation request
  .post('/request', async({ cookie, school, body, params = {} }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.VACATIONS_VIEW);
    if (!perm) return { error: 'no_permission' };
    // Check if vacation requests are enabled
    if (!school.employee_vacation_requests_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }
    
    // Calculate number of days
    let diffDays = 0;
    
    if (body.days) {
        diffDays = body.days;
    } else {
        const startDate = new Date(body.startDate);
        const endDate = new Date(body.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Check vacation balance for vacation type
    if (body.type === 'vacation') {
      const year = new Date(body.startDate).getFullYear();
      const balance = await db.selectFrom('employee_vacation_balance')
        .select('remaining')
        .where('teacher_id', '=', user.person_id)
        .where('year', '=', year)
        .executeTakeFirst();

      if (balance && balance.remaining < diffDays) {
        return new Response(JSON.stringify({ 
          error: 'insufficient_days',
          remaining: balance.remaining,
          requested: diffDays
        }), { status: 400 });
      }
    }

    await db.insertInto('employee_vacation_requests')
      .values({
        teacher_id: (params.id || user.person_id) as any,
        start_date: body.startDate,
        end_date: body.endDate,
        days: diffDays,
        type: body.type as any,
        status: 'pending',
        reason: body.reason || null,
        approved_by: null,
        approved_at: null
      })
      .execute();

    return Response.json({ 
      success: true, 
      message: 'Request submitted',
      days: diffDays 
    });

  }, {
    body: t.Object({
      startDate: t.String(),
      endDate: t.String(),
      type: t.String(), // vacation, sick, personal, unpaid, study, parental
      days: t.Optional(t.Number()),
      reason: t.Optional(t.String()),
    })
  })
  // PUT /request/:requestId/approve - Approve request
  .put('/request/:requestId/approve', async({ cookie, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.VACATIONS_MANAGE);
    if (!perm) return { error: 'no_permission' };
    const requestId = parseInt(params.requestId);
    
    // Authorization check removed as handled by middleware

    // Get request details
    const request = await db.selectFrom('employee_vacation_requests')
      .select(['teacher_id', 'days', 'type', 'start_date', 'end_date'])
      .where('request_id', '=', requestId)
      .executeTakeFirst();

    if (!request) {
      return new Response(JSON.stringify({ error: 'request_not_found' }), { status: 404 });
    }

    // Update request status
    await db.updateTable('employee_vacation_requests')
      .set({
        status: 'approved',
        approved_by: user.user_id,
        approved_at: new Date(),
      })
      .where('request_id', '=', requestId)
      .execute();
      
    // Create attendance records logic here if needed (omitted for brevity, handled by user request scope)
    // Update vacation balance for vacation type
    if (request.type === 'vacation') {
      const year = new Date(request.start_date).getFullYear();
      
      await db.updateTable('employee_vacation_balance')
        .set({
          used: sql`used + ${request.days}`,
          remaining: sql`remaining - ${request.days}`,
        } as any)
        .where('teacher_id', '=', request.teacher_id)
        .where('year', '=', year)
        .execute();
    } else if (request.type === 'extra_vacation') {
      const year = new Date(request.start_date).getFullYear();

      await db.updateTable('employee_vacation_balance')
        .set({
          entitlement: sql`entitlement + ${request.days}`,
          remaining: sql`remaining + ${request.days}`,
        } as any)
        .where('teacher_id', '=', request.teacher_id)
        .where('year', '=', year)
        .execute();
    }

    return Response.json({ success: true, message: 'Request approved' });
  })
  // PUT /request/:requestId/reject - Reject request
  .put('/request/:requestId/reject', async({ cookie, params, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.VACATIONS_MANAGE);
    if (!perm) return { error: 'no_permission' };
    const requestId = parseInt(params.requestId);
    
    // Authorization check already handled by middleware

    await db.updateTable('employee_vacation_requests')
      .set({
        status: 'rejected',
        reason: body.reason || null,
        approved_by: user.user_id,
        approved_at: new Date(),
      })
      .where('request_id', '=', requestId)
      .execute();

    return Response.json({ success: true, message: 'Request rejected' });

  }, {
    body: t.Object({
      reason: t.Optional(t.String()),
    })
  });

// End of file
