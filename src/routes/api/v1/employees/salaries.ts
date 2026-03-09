import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';


const salariesRouter = new Elysia()
  // GET /employees/salaries - Get salaries (admin/personnel only)
  .get('/employees/salaries', async({ cookie, school, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SALARIES_VIEW);
    if (!perm) return { error: 'no_permission' };
    // Check if salaries are enabled
    if (!school.employee_salaries_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }

    // Check permissions - only admins can view all
    const canView = perm;

    let queryBuilder = db.selectFrom('teachers_salary')
      .leftJoin('teachers', 'teachers_salary.teacher_id', 'teachers.person_id')
      .leftJoin('persons', 'teachers.person_id', 'persons.person_id')
      .select([
        'teachers_salary.salary_id',
        'teachers_salary.teacher_id',
        'persons.first_name',
        'persons.last_name',
        'teachers_salary.role',
        'teachers_salary.salary',
        'teachers_salary.valid_from',
        'teachers_salary.valid_to',
        'teachers_salary.currency',
        'teachers_salary.deductions',
      ])
      .where('teachers_salary.teacher_id', 'is not', null)

    // Filter by employee
    if (query.employeeId) {
      queryBuilder = queryBuilder.where('teachers_salary.teacher_id', '=', query.employeeId);
    }

    // Only active salaries
    if (query.activeOnly) {
      const today = moment().format('YYYY-MM-DD');
      queryBuilder = queryBuilder
        .where('teachers_salary.valid_from', '<=', today)
        .where((eb) => eb.or([
          eb('teachers_salary.valid_to', 'is', null),
          eb('teachers_salary.valid_to', '>=', today)
        ]))
    }

    const results = await queryBuilder
      .orderBy('persons.last_name', 'asc')
      .execute();

    return Response.json({ data: results });

  }, {
    query: t.Object({
      employeeId: t.Optional(t.Number()),
      activeOnly: t.Optional(t.Boolean()),
    })
  })
  // POST /employees/salaries - Set salary (admin only)
  .post('/employees/salaries', async({ cookie, school, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SALARIES_MANAGE);
    if (!perm) return { error: 'no_permission' };
    // Check if salaries are enabled
    if (!school.employee_salaries_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }
    

    // End current salary if exists
    const today = new Date().toISOString().split('T')[0];
    await db.updateTable('teachers_salary')
      .set({ valid_to: today })
      .where('teacher_id', '=', body.teacherId)
      .where('valid_to', 'is', null)
      .execute();

    // Insert new salary
    await db.insertInto('teachers_salary')
      .values({
        teacher_id: body.teacherId,
        role: body.role || '',
        salary: body.salary,
        valid_from: body.validFrom,
        valid_to: body.validTo || null,
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
  .put('/employees/salaries/:id', async({ cookie, school, params, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SALARIES_MANAGE);
    if (!perm) return { error: 'no_permission' };
    // Check if salaries are enabled
    if (!school.employee_salaries_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }
    const salaryId = parseInt(params.id);
    

    await db.updateTable('teachers_salary')
      .set({
        role: body.role,
        salary: body.salary,
        valid_from: body.validFrom,
        valid_to: body.validTo,
        deductions: body.deductions,
      })
      .where('salary_id', '=', salaryId)
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
  .get('/employees/salaries/history/:employeeId', async({ cookie, school, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SALARIES_VIEW);
    if (!perm) return { error: 'no_permission' };
    // Check if salaries are enabled
    if (!school.employee_salaries_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }
    const employeeId = parseInt(params.employeeId);
    
    // Authorization already handled by middleware

    const history = await db.selectFrom('teachers_salary')
      .selectAll()
      .where('teacher_id', '=', employeeId)
      .orderBy('valid_from', 'desc')
      .execute();

    return Response.json({ data: history });
  });

export default salariesRouter;
