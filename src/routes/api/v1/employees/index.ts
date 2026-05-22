import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { format_person_by_id } from '../../../../functions/format_person_by_id';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';
import moment from 'moment';

import { attendanceRouter } from './attendance';
import { vacationsRouter } from './vacations';
import { salariesRouter } from './salaries';
import { bonusesRouter } from './bonuses';
import { agendaRouter } from './agenda';
import { professionalRouter } from './professional';
import { equipmentRouter } from './equipment';
import { evaluationRouter } from './evaluation';
import { historyRouter } from './history';
import { subjectsRouter } from './subjects';
import { documentsRouter } from './documents';

const employeesRouter = new Elysia({ prefix: '/employees' })
  // POST /degrees - Create new degree (admin only)
  .post('/degrees', async({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_EDIT);
    if (!perm) return { error: 'no_permission' };

    const result = await db.insertInto('degrees')
      .values({
        degree: body.degree,
        shortcut: body.shortcut,
        is_before: body.isBefore,
        weight: body.weight || 10,
      })
      .executeTakeFirstOrThrow();

    const degreeId = Number(result.insertId);

    const newDegree = await db.selectFrom('degrees')
      .selectAll()
      .where('degree_id', '=', degreeId)
      .executeTakeFirst();

    return Response.json({ 
      success: true, 
      message: 'Degree created',
      degree: newDegree
    });
  }, {
    body: t.Object({
      degree: t.String(),
      shortcut: t.String(),
      isBefore: t.Boolean(),
      weight: t.Optional(t.Number()),
    })
  })
  // GET /summary - Get employee statistics
  .get('/summary', async({ cookie, school }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    
    const now = moment();
    const today = now.format('YYYY-MM-DD');
    const dayOfWeek = (now.isoWeekday() - 1); // 0 (Mon) - 6 (Sun)
    
    // 1. Total Employees
    const totalResult = await db.selectFrom('teachers')
      .select(sql<number>`count(*)`.as('total'))
      .where('school_id', '=', user.school_id!)
      .executeTakeFirst();
    
    // 2. Currently Present (checked in, not checked out)
    const presentResult = await db.selectFrom('employee_attendance')
      .select(sql<number>`count(distinct teacher_id)`.as('total'))
      .where('date', '=', today)
      .where('check_out', 'is', null)
      .executeTakeFirst();

    // 3. Supposed to be present today (has at least one lesson today)
    // We count unique teachers from both teacher_id and teacher2_id
    const currentYearIdSubquery = db.selectFrom('school_years')
      .select('sy_id')
      .where('start', '<=', today as any)
      .where('end', '>=', today as any)
      .limit(1);

    const supposedResult = await db.selectFrom((eb) => 
      eb.selectFrom('timetable')
        .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
        .select('teacher_id as person_id')
        .where('timetable.day', '=', dayOfWeek)
        .where('groups.year_id', '=', currentYearIdSubquery)
        .where('teacher_id', 'is not', null)
        .union(
          eb.selectFrom('timetable')
            .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
            .select('teacher2_id as person_id')
            .where('timetable.day', '=', dayOfWeek)
            .where('groups.year_id', '=', currentYearIdSubquery)
            .where('teacher2_id', 'is not', null) as any
        ).as('today_teachers')
    )
    .select(sql<number>`count(*)`.as('total'))
    .executeTakeFirst();

    // 4. On approved vacation/absence
    const vacationResult = await db.selectFrom('employee_vacation_requests')
      .select(sql<number>`count(distinct teacher_id)`.as('total'))
      .where('status', '=', 'approved')
      .where('start_date', '<=', today)
      .where('end_date', '>=', today)
      .executeTakeFirst();

    const total = Number(totalResult?.total || 0);
    const present = Number(presentResult?.total || 0);
    const supposed = Number(supposedResult?.total || 0);
    const onVacation = Number(vacationResult?.total || 0);

    return Response.json({
      total,
      present,
      supposed,
      onVacation,
      absencePercentage: supposed > 0 ? Math.round(((supposed - present) / supposed) * 100) : 0
    });
  })
  // GET / - List all employees (teachers)
  .get('/', async({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    
    // Check permissions - only admins can view all
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_VIEW);
    
    let queryBuilder = db.selectFrom('teachers')
      .leftJoin('persons', 'teachers.person_id', 'persons.person_id')
      .leftJoin('users', 'users.person_id', 'persons.person_id')
      .select([
        'teachers.person_id',
        'persons.first_name',
        'persons.last_name',
        'teachers.role',
        'teachers.cabinet_id',
        sql<string>`(SELECT email FROM emails WHERE emails.person_id = persons.person_id LIMIT 1)`.as('email'),
        sql<string>`(SELECT number FROM phone_numbers WHERE phone_numbers.person_id = persons.person_id LIMIT 1)`.as('phone'),
        'teachers.department',
        'teachers.contract_type',
      ])
      .where((eb) => eb.or([
        eb('users.school_id', '=', user.school_id),
        eb('teachers.school_id', '=', user.school_id)
      ]))

    // Search by name
    if (query.search) {
      const search = `%${query.search}%`;
      queryBuilder = queryBuilder.where((eb) => eb.or([
        eb('persons.first_name', 'like', search),
        eb('persons.last_name', 'like', search),
      ]))
    }

    // If not admin, only show self
    if (!perm) {
      queryBuilder = queryBuilder.where('teachers.person_id', '=', user.person_id);
    }

    // Sort
    queryBuilder = queryBuilder
      .orderBy('persons.last_name', 'asc')
      .orderBy('persons.first_name', 'asc')

    // Count total
    const countResult = await db.selectFrom(queryBuilder.as('filtered'))
      .select(sql<number>`count(*)`.as('total'))
      .executeTakeFirst();
    
    const total = Number(countResult?.total || 0);

    // Apply Pagination
    const results = await queryBuilder
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();

    const personIds = results.map(r => r.person_id).filter((id): id is number => id !== null);
    const formattedNames = await format_person_map_by_ids(personIds);

    const data = results.map(r => ({
      ...r,
      full_name: r.person_id ? formattedNames.get(r.person_id) : `${r.first_name} ${r.last_name}`
    }));

    return Response.json({
      canViewAll: perm,
      data,
      meta: {
        total,
        limit: query.limit!,
        offset: query.offset!
      }
    });

  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
      offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
      search: t.Optional(t.String()),
    })
  })
  // Global sub-resources (admin views of all employees)
  .use(attendanceRouter)
  .use(vacationsRouter)
  .use(salariesRouter)
  .use(bonusesRouter)

  // POST / - Create new employee (admin only)
  .post('/', async({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_EDIT);
    if (!perm) return { error: 'no_permission' };

    // Create person first
    const personResult = await db.insertInto('persons')
      .values({
        first_name: body.firstName,
        last_name: body.lastName,
        gender: body.gender || 0,
        birthday: body.birthday || null,
        birthnum: body.birthnum || null,
        birthplace_id: body.birthplace || null,
        address_id: body.address || null,
        insurance_id: body.insuranceId || null,
      })
      .executeTakeFirstOrThrow();

    const personId = Number(personResult.insertId);

    // Insert email if provided
    if (body.email) {
      await db.insertInto('emails')
        .values({
          person_id: personId,
          email: body.email,
          type: 'personal',
          description: null,
          is_verified: false,
        })
        .execute();
    }

    // Insert phone if provided
    if (body.phone) {
      await db.insertInto('phone_numbers')
        .values({
          person_id: personId,
          code: body.phoneCode || 420,
          number: body.phone,
          description: null,
          is_verified: false,
        })
        .execute();
    }

    // Insert degrees if provided
    if (body.degrees && body.degrees.length > 0) {
      for (const degreeId of body.degrees) {
        await db.insertInto('persons_degree')
          .values({
            person_id: personId,
            degree_id: degreeId,
          })
          .execute();
      }
    }

    // Create teacher record
    await db.insertInto('teachers')
      .values({
        person_id: personId,
        role: body.role!,
        cabinet_id: body.cabinet || null,
        department: body.department || null,
        contract_type: body.contractType || null,
        school_id: user.school_id!
      })
      .execute();

    return Response.json({ 
      success: true, 
      message: 'Employee created',
      personId: personId
    });

  }, {
    body: t.Object({
      firstName: t.String(),
      lastName: t.String(),
      gender: t.Optional(t.Number()),
      birthday: t.Optional(t.String()),
      birthnum: t.Optional(t.String()),
      birthplace: t.Optional(t.Number()),
      address: t.Optional(t.Number()),
      GDPR: t.Optional(t.Boolean()),
      insuranceId: t.Optional(t.Number()),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      phoneCode: t.Optional(t.Number()),
      role: t.Optional(t.UnionEnum(['teacher', 'admin_staff', 'maintenance', 'management', 'personnel', 'other'])),
      cabinet: t.Optional(t.Number()),
      department: t.Optional(t.String()),
      contractType: t.Optional(t.UnionEnum(['fulltime', 'parttime', 'dpp', 'dpc'])),
      degrees: t.Optional(t.Array(t.Number())),
    })
  })

  // Employee-specific sub-resources and detail
  .group('/:id', {
    params: t.Object({ id: t.Numeric() })
  }, (app) => app
    .use(attendanceRouter)
    .use(vacationsRouter)
    .use(salariesRouter)
    .use(bonusesRouter)
    .use(agendaRouter)
    .use(professionalRouter)
    .use(equipmentRouter)
    .use(evaluationRouter)
    .use(historyRouter)
    .use(subjectsRouter)
    .use(documentsRouter)

    // GET /:id - Employee detail
    .get('/', async({ cookie, params }: any) => {
      const user = await getAuthUser(cookie?.token?.value as string, cookie);
      if (!user) return { error: 'no_permission' };
      const employeeId = parseInt(params.id);
      
      // Check permissions - only admins can view all
      const canViewAll = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_VIEW);
      
      if (!canViewAll && user.person_id !== employeeId) {
        return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
      }

      const employeeResult = await db.selectFrom('teachers')
        .leftJoin('persons', 'teachers.person_id', 'persons.person_id')
        .leftJoin('users', 'users.person_id', 'persons.person_id')
        .select([
          'teachers.person_id',
          'persons.first_name',
          'persons.last_name',
          'users.avatar',
          'teachers.role',
          'teachers.cabinet_id',
          'teachers.department',
          'teachers.contract_type',
          sql<string>`DATE_FORMAT(persons.birthday, '%Y-%m-%d')`.as('date_of_birth'),
        ])
        .where('teachers.person_id', '=', employeeId)
        .where('teachers.school_id', '=', user.school_id)
        .executeTakeFirst();

      if (!employeeResult) {
        return new Response(JSON.stringify({ error: 'no_employee' }), { status: 404 });
      }

      const employee: any = employeeResult;
      employee.full_name = await format_person_by_id(employee.person_id);

      // Get emails
      const emails = await db.selectFrom('emails')
        .select([
          'email',
          'is_verified'
        ])
        .where('person_id', '=', employeeId)
        .execute();

      // Get phones
      const phones = await db.selectFrom('phone_numbers')
        .select([
          'code',
          'number',
          'is_verified'
        ])
        .where('person_id', '=', employeeId)
        .execute();

      return Response.json({
        ...employee,
        emails,
        phones
      });
    })

    // PUT /:id - Update employee (admin only)
    .put('/', async({ cookie, params, body }: any) => {
      const user = await getAuthUser(cookie?.token?.value as string, cookie);
      if (!user) return { error: 'no_permission' };
      const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_EDIT);
      if (!perm) return { error: 'no_permission' };
      const employeeId = parseInt(params.id);

      // Check if employee exists
      const employee = await db.selectFrom('teachers')
        .select('person_id')
        .where('person_id', '=', employeeId)
        .where('teachers.school_id', '=', user.school_id!)
        .executeTakeFirst();

      if (!employee) {
        return new Response(JSON.stringify({ error: 'no_employee' }), { status: 404 });
      }

      // Update teachers table
      await db.updateTable('teachers')
        .set({
          role: body.role,
          cabinet_id: body.cabinet,
          department: body.department,
          contract_type: body.contractType,
        })
        .where('person_id', '=', employeeId)
        .where('school_id', '=', user.school_id!)
        .execute();

      return Response.json({ success: true, message: 'Employee updated' });

    }, {
      body: t.Object({
        role: t.Optional(t.UnionEnum(['teacher', 'admin_staff', 'maintenance', 'management', 'personnel', 'other'])),
        cabinet: t.Optional(t.Number()),
        department: t.Optional(t.String()),
        contractType: t.Optional(t.UnionEnum(['fulltime', 'parttime', 'dpp', 'dpc'])),
      })
    })

    // DELETE /:id - Remove employee (admin only)
    .delete('/', async({ cookie, school, params }: any) => {
      const user = await getAuthUser(cookie?.token?.value as string, cookie);
      if (!user) return { error: 'no_permission' };
      const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_EDIT);
      if (!perm) return { error: 'no_permission' };
      const employeeId = parseInt(params.id);

      // Check if employee exists
      const employee = await db.selectFrom('teachers')
        .select('person_id')
        .where('person_id', '=', employeeId)
        .where('teachers.school_id', '=', user.school_id!)
        .executeTakeFirst();

      if (!employee) {
        return new Response(JSON.stringify({ error: 'no_employee' }), { status: 404 });
      }

      // Delete from teachers table
      await db.deleteFrom('teachers')
        .where('person_id', '=', employeeId)
        .where('school_id', '=', user.school_id!)
        .execute();

      return Response.json({ success: true, message: 'Employee removed' });
    })
  );

export default employeesRouter;
