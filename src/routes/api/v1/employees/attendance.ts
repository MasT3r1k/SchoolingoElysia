import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';

const attendanceRouter = new Elysia()
  // GET /employees/attendance - Get attendance records
  .get('/employees/attendance', async({ query, cookie }) => {
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
    const canViewAll = auth.manager == -1;
    
    let queryBuilder = db.selectFrom('employee_attendance')
      .leftJoin('teachers', 'employee_attendance.teacherId', 'teachers.personId')
      .leftJoin('persons', 'teachers.personId', 'persons.personId')
      .select([
        'employee_attendance.attendanceId',
        'employee_attendance.teacherId',
        'persons.firstName',
        'persons.lastName',
        'employee_attendance.date',
        'employee_attendance.checkIn',
        'employee_attendance.checkOut',
        'employee_attendance.breakMinutes',
        'employee_attendance.workedMinutes',
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
      queryBuilder = queryBuilder.where('employee_attendance.teacherId', '=', auth.person);
    } else if (query.employeeId) {
      queryBuilder = queryBuilder.where('employee_attendance.teacherId', '=', query.employeeId);
    }

    // Filter by type
    if (query.type) {
      queryBuilder = queryBuilder.where('employee_attendance.type', '=', query.type as any);
    }

    const results = await queryBuilder
      .orderBy('employee_attendance.date', 'desc')
      .orderBy('employee_attendance.checkIn', 'desc')
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();

    return Response.json({ data: results });

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
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeNow = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    // Check if already checked in today
    const existing = await db.selectFrom('employee_attendance')
      .select('attendanceId')
      .where('teacherId', '=', auth.person)
      .where('date', '=', today)
      .where('checkOut', 'is', null)
      .executeTakeFirst();

    if (existing) {
      return new Response(JSON.stringify({ 
        error: 'already_checked_in' 
      }), { status: 400 });
    }

    await db.insertInto('employee_attendance')
      .values({
        teacherId: auth.person!,
        date: today,
        checkIn: timeNow,
        checkOut: null,
        breakMinutes: 0,
        workedMinutes: 0,
        type: (body.type || 'regular') as any,
        notes: body.notes || null,
        approved: false,
        approvedBy: null,
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
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeNow = now.toTimeString().split(' ')[0].substring(0, 5);

    // Find open check-in
    const existing = await db.selectFrom('employee_attendance')
      .select(['attendanceId', 'checkIn'])
      .where('teacherId', '=', auth.person)
      .where('date', '=', today)
      .where('checkOut', 'is', null)
      .executeTakeFirst();

    if (!existing) {
      return new Response(JSON.stringify({ 
        error: 'no_checkin' 
      }), { status: 400 });
    }

    // Calculate worked minutes
    const checkInParts = existing.checkIn!.split(':');
    const checkOutParts = timeNow.split(':');
    const checkInMinutes = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1]);
    const checkOutMinutes = parseInt(checkOutParts[0]) * 60 + parseInt(checkOutParts[1]);
    const workedMinutes = checkOutMinutes - checkInMinutes - (body.breakMinutes || 0);

    await db.updateTable('employee_attendance')
      .set({
        checkOut: timeNow,
        breakMinutes: body.breakMinutes || 0,
        workedMinutes: Math.max(0, workedMinutes),
        notes: body.notes,
      })
      .where('attendanceId', '=', existing.attendanceId)
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

    await db.updateTable('employee_attendance')
      .set({
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        breakMinutes: body.breakMinutes,
        workedMinutes: body.workedMinutes,
        type: body.type as any,
        notes: body.notes,
        approved: body.approved,
        approvedBy: body.approved ? auth.userId : null,
      })
      .where('attendanceId', '=', attendanceId)
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
  });

export default attendanceRouter;
