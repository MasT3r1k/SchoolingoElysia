import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"

const bonusesRouter = new Elysia()
  // GET /employees/bonuses - Get bonuses
  .get('/employees/bonuses', async({ query, cookie }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    // Check permissions - only admins can view all
    const canViewAll = auth.manager == -1;
    
    let queryBuilder = db.selectFrom('employee_bonuses')
      .leftJoin('teachers', 'employee_bonuses.teacherId', 'teachers.personId')
      .leftJoin('persons', 'teachers.personId', 'persons.personId')
      .select([
        'employee_bonuses.bonusId',
        'employee_bonuses.teacherId',
        'persons.firstName',
        'persons.lastName',
        'employee_bonuses.date',
        'employee_bonuses.amount',
        'employee_bonuses.type',
        'employee_bonuses.reason',
        'employee_bonuses.paid',
        'employee_bonuses.paidDate',
      ])

    // Filter by employee
    if (!canViewAll) {
      queryBuilder = queryBuilder.where('employee_bonuses.teacherId', '=', auth.person);
    } else if (query.employeeId) {
      queryBuilder = queryBuilder.where('employee_bonuses.teacherId', '=', query.employeeId);
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
        .where('teacherId', '=', auth.person)
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
  .post('/employees/bonuses', async({ body, cookie }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const canManage = auth.manager == -1;
    
    if (!canManage) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    await db.insertInto('employee_bonuses')
      .values({
        teacherId: body.teacherId,
        date: body.date || new Date().toISOString().split('T')[0],
        amount: body.amount,
        type: body.type as any,
        reason: body.reason,
        approvedBy: auth.userId,
        paid: false,
        paidDate: null,
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
  .put('/employees/bonuses/:id', async({ params, body, cookie }) => {
    const bonusId = parseInt(params.id);
    
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const canManage = auth.manager == -1;
    
    if (!canManage) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    await db.updateTable('employee_bonuses')
      .set({
        amount: body.amount,
        type: body.type as any,
        reason: body.reason,
      })
      .where('bonusId', '=', bonusId)
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
  .put('/employees/bonuses/:id/paid', async({ params, cookie }) => {
    const bonusId = parseInt(params.id);
    
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const canManage = auth.manager == -1;
    
    if (!canManage) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    await db.updateTable('employee_bonuses')
      .set({
        paid: true,
        paidDate: new Date().toISOString().split('T')[0],
      })
      .where('bonusId', '=', bonusId)
      .execute();

    return Response.json({ success: true, message: 'Bonus marked as paid' });
  })
  // DELETE /employees/bonuses/:id - Delete bonus (only if not paid)
  .delete('/employees/bonuses/:id', async({ params, cookie }) => {
    const bonusId = parseInt(params.id);
    
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const canManage = auth.manager == -1;
    
    if (!canManage) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    // Check if paid
    const bonus = await db.selectFrom('employee_bonuses')
      .select('paid')
      .where('bonusId', '=', bonusId)
      .executeTakeFirst();

    if (bonus?.paid) {
      return new Response(JSON.stringify({ 
        error: 'bonus_already_paid' 
      }), { status: 400 });
    }

    await db.deleteFrom('employee_bonuses')
      .where('bonusId', '=', bonusId)
      .execute();

    return Response.json({ success: true, message: 'Bonus deleted' });
  });

export default bonusesRouter;
