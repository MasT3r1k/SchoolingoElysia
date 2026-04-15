import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import moment from 'moment';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';


export const attendanceRouter = new Elysia({ prefix: '/attendance' })
  // GET / - Get attendance records
  .get('/', async({ cookie, school, query, params = {} }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ATTENDANCE_VIEW);
    
    // Determine if we are looking for a specific employee or all
    const employeeId = params.id ? parseInt(params.id) : (query.employeeId ? parseInt(query.employeeId) : null);
    
    // Check permission - only admins can view others, anyone can view self
    if (!perm && employeeId && user.person_id !== employeeId) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    if (!perm && !employeeId) {
       // Regular users can only see their own attendance
       // Falling back to self
       return Response.redirect(`/api/v1/employees/${user.person_id}/attendance`);
    }

    // Check permissions - only admins/managers can view all
    const canViewAll = perm;
    
    let queryBuilder = db.selectFrom('employee_attendance')
      .leftJoin('teachers', 'employee_attendance.teacher_id', 'teachers.person_id')
      .leftJoin('persons', 'teachers.person_id', 'persons.person_id')
      .select([
        'employee_attendance.attendance_id',
        'employee_attendance.teacher_id',
        'persons.first_name',
        'persons.last_name',
        'employee_attendance.date',
        'employee_attendance.check_in',
        'employee_attendance.check_out',
        'employee_attendance.break_minutes',
        'employee_attendance.worked_minutes',
        'employee_attendance.type',
        'employee_attendance.notes',
        'employee_attendance.approved',
      ])

    // Filter by employee
    if (employeeId) {
      queryBuilder = queryBuilder.where('employee_attendance.teacher_id', '=', employeeId);
    } else if (!canViewAll) {
      queryBuilder = queryBuilder.where('employee_attendance.teacher_id', '=', user.person_id);
    }

    // Date range filter
    if (query.dateFrom) {
      queryBuilder = queryBuilder.where('employee_attendance.date', '>=', query.dateFrom);
    }
    if (query.dateTo) {
      queryBuilder = queryBuilder.where('employee_attendance.date', '<=', query.dateTo);
    }

    // Filter by employee (if not admin, only show own records)
    if (!canViewAll) {
      queryBuilder = queryBuilder.where('employee_attendance.teacher_id', '=', user.person_id);
    } else if (query.employeeId) {
      queryBuilder = queryBuilder.where('employee_attendance.teacher_id', '=', query.employeeId);
    }

    // Filter by type
    if (query.type) {
      queryBuilder = queryBuilder.where('employee_attendance.type', '=', query.type as any);
    }

    const results = await queryBuilder
      .orderBy('employee_attendance.date', 'desc')
      .orderBy('employee_attendance.check_in', 'desc')
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();

    const peopleFullNames = await format_person_map_by_ids(results.map((result) => (result.teacher_id)));

    return Response.json({ data: results.map((result) => ({
        ...result,
        full_name: peopleFullNames.get(result.teacher_id)
      }))
    });

  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ minimum: 1, maximum: 500, default: 100 })),
      offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
      employeeId: t.Optional(t.Number()),
      dateFrom: t.Optional(t.String()),
      dateTo: t.Optional(t.String()),
      type: t.Optional(t.String()),
    })
  })
  // POST /checkin - Record check-in
  .post('/checkin', async({ cookie, school, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = user.role == "teacher";
    if (!perm) return { error: 'no_permission' };
    
    // Check if attendance is enabled
    if (!school.employee_attendance_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }
    
    const now = moment()
    const today = now.format('YYYY-MM-DD');
    const timeNow = now.format('HH:mm');

    // Check if already checked in today
    const existing = await db.selectFrom('employee_attendance')
      .select('attendance_id')
      .where('teacher_id', '=', user.person_id)
      .where('date', '=', today)
      .where('check_out', 'is', null)
      .executeTakeFirst();

    if (existing) {
      return new Response(JSON.stringify({ 
        error: 'already_checked_in' 
      }), { status: 400 });
    }

    await db.insertInto('employee_attendance')
      .values({
        teacher_id: user.person_id!,
        date: today,
        check_in: timeNow,
        check_out: null,
        break_minutes: 0,
        worked_minutes: 0,
        type: (body.type || 'regular') as any,
        notes: body.notes || null,
        approved: false,
        approved_by: null,
      })
      .execute();

    return Response.json({ success: true, message: 'Check-in recorded', time: timeNow });

  }, {
    body: t.Object({
      type: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    })
  })
  // POST /checkout - Record check-out
  .post('/checkout', async({ cookie, school, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = user.role == "teacher";
    if (!perm) return { error: 'no_permission' };
    
    // Check if attendance is enabled
    if (!school.employee_attendance_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }
    
    const now = moment()
    const today = now.format('YYYY-MM-DD');
    const timeNow = now.format('HH:mm');

    // Find recent record for today
    const existing = await db.selectFrom('employee_attendance')
      .select(['attendance_id', 'check_in', 'check_out'])
      .where('teacher_id', '=', user.person_id)
      .where('date', '=', today)
      .orderBy(sql`check_out IS NULL`, 'desc')
      .orderBy('check_in', 'desc')
      .executeTakeFirst();

    if (!existing) {
      return new Response(JSON.stringify({ 
        error: 'no_checkin' 
      }), { status: 400 });
    }

    // Calculate worked minutes
    const checkInParts = existing.check_in!.split(':');
    const checkOutParts = timeNow.split(':');
    const checkInMinutes = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1]);
    const checkOutMinutes = parseInt(checkOutParts[0]) * 60 + parseInt(checkOutParts[1]);
    const workedMinutes = checkOutMinutes - checkInMinutes - (body.breakMinutes || 0);

    await db.updateTable('employee_attendance')
      .set({
        check_out: timeNow,
        break_minutes: body.breakMinutes || 0,
        worked_minutes: Math.max(0, workedMinutes),
        notes: body.notes,
      })
      .where('attendance_id', '=', existing.attendance_id)
      .execute();

    return Response.json({ 
      success: true, 
      message: 'Check-out recorded', 
      time: timeNow,
      workedMinutes: Math.max(0, workedMinutes)
    });

  }, {
    body: t.Object({
      breakMinutes: t.Optional(t.Number()),
      notes: t.Optional(t.String()),
    })
  })
  // PUT /:attendanceId - Update attendance record (admin only)
  .put('/:attendanceId', async({ cookie, school, params, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ATTENDANCE_MANAGE);
    if (!perm) return { error: 'no_permission' };

    // Check if attendance is enabled
    if (!school.employee_attendance_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }
    await db.updateTable('employee_attendance')
      .set({
        check_in: body.checkIn,
        check_out: body.checkOut,
        break_minutes: body.breakMinutes,
        worked_minutes: body.workedMinutes,
        type: body.type as any,
        notes: body.notes,
        approved: body.approved,
        approved_by: body.approved ? user.user_id : null,
      })
      .where('attendance_id', '=', parseInt(params.attendanceId))
      .execute();

    return Response.json({ success: true, message: 'Record updated' });

  }, {
    body: t.Object({
      checkIn: t.Optional(t.String()),
      checkOut: t.Optional(t.Nullable(t.String())),
      breakMinutes: t.Optional(t.Number()),
      workedMinutes: t.Optional(t.Number()),
      type: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      approved: t.Optional(t.Boolean()),
    })
  })
  // POST / - Create attendance record (admin only)
  .post('/', async({ cookie, school, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ATTENDANCE_MANAGE);
    if (!perm) return { error: 'no_permission' };

    // Check if attendance is enabled
    if (!school.employee_attendance_enabled) {
      return new Response(JSON.stringify({ error: 'feature_disabled' }), { status: 403 });
    }

    await db.insertInto('employee_attendance')
      .values({
        teacher_id: body.teacher_id,
        date: body.date,
        check_in: body.checkIn,
        check_out: body.checkOut,
        break_minutes: body.breakMinutes || 0,
        worked_minutes: body.workedMinutes || 0,
        type: (body.type || 'regular') as any,
        notes: body.notes || null,
        approved: body.approved || false,
        approved_by: body.approved ? user.user_id : null,
      })
      .execute();

    return Response.json({ success: true, message: 'Record created' });

  }, {
    body: t.Object({
      teacher_id: t.Number(),
      date: t.String(),
      checkIn: t.String(),
      checkOut: t.Optional(t.Nullable(t.String())),
      breakMinutes: t.Optional(t.Number()),
      workedMinutes: t.Optional(t.Number()),
      type: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      approved: t.Optional(t.Boolean()),
    })
  });

// End of file
