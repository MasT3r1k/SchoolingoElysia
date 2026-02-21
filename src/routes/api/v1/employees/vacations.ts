import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';

const vacationsRouter = new Elysia()
  // GET /employees/vacations/balance - Get vacation balance
  .get('/employees/vacations/balance', async({ query, cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager', 'users.principal'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const canViewAll = auth.manager == -1 || auth.principal == true;
    
    const employeeId = canViewAll && query.employeeId ? query.employeeId : auth.person_id;
    const year = query.year || new Date().getFullYear();

    let balance = await db.selectFrom('employee_vacation_balance')
      .selectAll()
      .where('teacher_id', '=', employeeId)
      .where('year', '=', year)
      .executeTakeFirst();

    if (!balance && employeeId) {
      // Auto-assign default vacation days (25 days)
      const defaultEntitlement = 25;
      
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
  // POST /employees/vacations/balance/adjust - Adjust vacation entitlement (Admin only)
  .post('/employees/vacations/balance/adjust', async({ body, cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth || auth.manager != 1) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 403 });

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
            entitlement: 25 + body.amount, // Default + adjustment
            used: 0,
            remaining: 25 + body.amount
        })
        .execute();
    } else {
        await db.updateTable('employee_vacation_balance')
        .set({
            entitlement: sql`entitlement + ${body.amount}`,
            remaining: sql`remaining + ${body.amount}`
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
  // GET /employees/vacations/requests - Get vacation requests
  .get('/employees/vacations/requests', async({ query, store, cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const user = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    }
    
    const canViewAll = user.manager == 1;
    
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
    } else if (query.employeeId) {
      queryBuilder = queryBuilder.where('employee_vacation_requests.teacher_id', '=', query.employeeId);
    }

    const results = await queryBuilder
      .orderBy('employee_vacation_requests.created_at', 'desc')
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();

    return Response.json({ data: results });

  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
      offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
      employeeId: t.Optional(t.Number()),
      status: t.Optional(t.String()),
      type: t.Optional(t.String()),
    })
  })
  // POST /employees/vacations/request - Create vacation request
  .post('/employees/vacations/request', async({ body, cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
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
        .where('teacher_id', '=', auth.person_id)
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
        teacher_id: auth.person_id!,
        start_date: body.startDate,
        end_date: body.endDate,
        days: diffDays,
        type: body.type as any,
        status: 'pending',
        reason: body.reason || null,
        approved_by: null,
        approved_at: null,
        created_at: new Date().toISOString(),
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
  // PUT /employees/vacations/request/:id/approve - Approve request
  .put('/employees/vacations/request/:id/approve', async({ params, cookie }) => {
    const requestId = parseInt(params.id);
    
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    // Authorization check
    const canManage = auth.manager == 1;
    
    if (!canManage) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

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
        approved_by: auth.user_id,
        approved_at: new Date().toISOString(),
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
    }

    return Response.json({ success: true, message: 'Request approved' });
  })
  // PUT /employees/vacations/request/:id/reject - Reject request
  .put('/employees/vacations/request/:id/reject', async({ params, body, cookie }) => {
    const requestId = parseInt(params.id);
    
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const canManage = auth.manager == 1;
    
    if (!canManage) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    await db.updateTable('employee_vacation_requests')
      .set({
        status: 'rejected',
        reason: body.reason || null,
        approved_by: auth.user_id,
        approved_at: new Date().toISOString(),
      })
      .where('request_id', '=', requestId)
      .execute();

    return Response.json({ success: true, message: 'Request rejected' });

  }, {
    body: t.Object({
      reason: t.Optional(t.String()),
    })
  });

export default vacationsRouter;
