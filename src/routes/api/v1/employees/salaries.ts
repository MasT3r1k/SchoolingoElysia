import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"

const salariesRouter = new Elysia()
  // GET /employees/salaries - Get salaries (admin/personnel only)
  .get('/employees/salaries', async({ query, cookie }) => {
    const token = cookie.token?.value as string;
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
    const canView = auth.manager == -1;
    
    if (!canView) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    let queryBuilder = db.selectFrom('teachers_salary')
      .leftJoin('teachers', 'teachers_salary.teacherId', 'teachers.personId')
      .leftJoin('persons', 'teachers.personId', 'persons.personId')
      .select([
        'teachers_salary.salaryId',
        'teachers_salary.teacherId',
        'persons.firstName',
        'persons.lastName',
        'teachers_salary.role',
        'teachers_salary.salary',
        'teachers_salary.validFrom',
        'teachers_salary.validTo',
        'teachers_salary.currency',
        'teachers_salary.deductions',
      ])
      .where('teachers_salary.teacherId', 'is not', null)

    // Filter by employee
    if (query.employeeId) {
      queryBuilder = queryBuilder.where('teachers_salary.teacherId', '=', query.employeeId);
    }

    // Only active salaries
    if (query.activeOnly) {
      const today = new Date().toISOString().split('T')[0];
      queryBuilder = queryBuilder
        .where('teachers_salary.validFrom', '<=', today)
        .where((eb) => eb.or([
          eb('teachers_salary.validTo', 'is', null),
          eb('teachers_salary.validTo', '>=', today)
        ]))
    }

    const results = await queryBuilder
      .orderBy('persons.lastName', 'asc')
      .execute();

    return Response.json({ data: results });

  }, {
    query: t.Object({
      employeeId: t.Optional(t.Number()),
      activeOnly: t.Optional(t.Boolean()),
    })
  })
  // POST /employees/salaries - Set salary (admin only)
  .post('/employees/salaries', async({ body, cookie }) => {
    const token = cookie.token?.value as string;
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

    // End current salary if exists
    const today = new Date().toISOString().split('T')[0];
    await db.updateTable('teachers_salary')
      .set({ validTo: today })
      .where('teacherId', '=', body.teacherId)
      .where('validTo', 'is', null)
      .execute();

    // Insert new salary
    await db.insertInto('teachers_salary')
      .values({
        teacherId: body.teacherId,
        role: body.role || '',
        salary: body.salary,
        validFrom: body.validFrom,
        validTo: body.validTo || null,
        currency: body.currency || 'CZK',
        deductions: body.deductions || 0,
      })
      .execute();

    return Response.json({ success: true, message: 'Salary set' });

  }, {
    body: t.Object({
      teacherId: t.Number(),
      role: t.Optional(t.String()),
      salary: t.Number(),
      validFrom: t.String(),
      validTo: t.Optional(t.Nullable(t.String())),
      currency: t.Optional(t.String()),
      deductions: t.Optional(t.Number()),
    })
  })
  // PUT /employees/salaries/:id - Update salary (admin only)
  .put('/employees/salaries/:id', async({ params, body, cookie }) => {
    const salaryId = parseInt(params.id);
    
    const token = cookie.token?.value as string;
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

    await db.updateTable('teachers_salary')
      .set({
        role: body.role,
        salary: body.salary,
        validFrom: body.validFrom,
        validTo: body.validTo,
        deductions: body.deductions,
      })
      .where('salaryId', '=', salaryId)
      .execute();

    return Response.json({ success: true, message: 'Salary updated' });

  }, {
    body: t.Object({
      role: t.Optional(t.String()),
      salary: t.Optional(t.Number()),
      validFrom: t.Optional(t.String()),
      validTo: t.Optional(t.Nullable(t.String())),
      deductions: t.Optional(t.Number()),
    })
  })
  // GET /employees/salaries/history/:employeeId - Salary history (admin only)
  .get('/employees/salaries/history/:employeeId', async({ params, cookie }) => {
    const employeeId = parseInt(params.employeeId);
    
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const canView = auth.manager == -1;
    
    if (!canView) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    const history = await db.selectFrom('teachers_salary')
      .selectAll()
      .where('teacherId', '=', employeeId)
      .orderBy('validFrom', 'desc')
      .execute();

    return Response.json({ data: history });
  });

export default salariesRouter;
