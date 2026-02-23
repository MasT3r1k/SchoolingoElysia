import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import moment from 'moment';

const attendanceRouter = new Elysia()
  // GET /employees/attendance - Get attendance records
  .get('/employees/attendance', async({ query, cookie }) => {
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

    // Check permissions - only admins can view all
    const canViewAll = auth.manager == -1 || auth.principal;
    
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

    // Date range filter
    if (query.dateFrom) {
      queryBuilder = queryBuilder.where('employee_attendance.date', '>=', query.dateFrom);
    }
    if (query.dateTo) {
      queryBuilder = queryBuilder.where('employee_attendance.date', '<=', query.dateTo);
    }

    // Filter by employee (if not admin, only show own records)
    if (!canViewAll) {
      queryBuilder = queryBuilder.where('employee_attendance.teacher_id', '=', auth.person_id);
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
  // POST /employees/attendance/checkin - Record check-in
  .post('/employees/attendance/checkin', async({ body, cookie }) => {
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
    
    const now = moment()
    const today = now.format('YYYY-MM-DD');
    const timeNow = now.format('HH:MM');

    // Check if already checked in today
    const existing = await db.selectFrom('employee_attendance')
      .select('attendance_id')
      .where('teacher_id', '=', auth.person_id)
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
        teacher_id: auth.person_id!,
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
  // POST /employees/attendance/checkout - Record check-out
  .post('/employees/attendance/checkout', async({ body, cookie }) => {
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
    
    const now = moment()
    const today = now.format('YYYY-MM-DD');
    const timeNow = now.format('HH:MM');

    // Find recent record for today
    const existing = await db.selectFrom('employee_attendance')
      .select(['attendance_id', 'check_in', 'check_out'])
      .where('teacher_id', '=', auth.person_id)
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
  // PUT /employees/attendance/:id - Update attendance record (admin only)
  .put('/employees/attendance/:id', async({ params, body, cookie }) => {
    const attendanceId = parseInt(params.id);
    
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
    
    const canManage = auth.manager == -1;
    
    if (!canManage) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
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
        approved_by: body.approved ? auth.user_id : null,
      })
      .where('attendance_id', '=', attendanceId)
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
  // POST /employees/attendance - Create attendance record (admin only)
  .post('/employees/attendance', async({ body, cookie }) => {
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
    
    const canManage = auth.manager == -1;
    if (!canManage) return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });

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
        approved_by: body.approved ? auth.user_id : null,
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

export default attendanceRouter;
