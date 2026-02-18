import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';

import attendanceRouter from './attendance';
import vacationsRouter from './vacations';
import salariesRouter from './salaries';
import bonusesRouter from './bonuses';

// Build fullname with degrees
const titlesBefore = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID')
  .select([
      'pd.person as person',
      sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_before')
  ])
  .where('d.isBefore', '=', true)
  .groupBy('pd.person')
  .as('tb')

const titlesAfter = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID')
  .select([
      'pd.person as person',
      sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_after')
  ])
  .where('d.isBefore', '=', false)
  .groupBy('pd.person')
  .as('ta');

const fullName = sql`
  concat(
      COALESCE(
      CASE WHEN tb.titles_before IS NULL OR tb.titles_before = '' THEN ''
      ELSE CONCAT(tb.titles_before, ' ')
      END,
      ''
      ),
      persons.firstName, ' ', persons.lastName,
      COALESCE(
      CASE WHEN ta.titles_after IS NULL OR ta.titles_after = '' THEN ''
      ELSE CONCAT(' ', ta.titles_after)
      END,
      ''
      )
  )
  `.as('fullName')

const employeesRouter = new Elysia()
    .use(attendanceRouter)
    .use(vacationsRouter)
    .use(salariesRouter)
    .use(bonusesRouter)
  // GET /degrees - Get all degrees for selection
  .get('/degrees', async() => {

    const degrees = await db.selectFrom('degrees')
      .selectAll()
      .orderBy('weight', 'asc')
      .execute();

    return Response.json({ data: degrees });
  })
  // POST /degrees - Create new degree (admin only)
  .post('/degrees', async({ body, cookie }) => {
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

    if (auth.manager != -1) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    const result = await db.insertInto('degrees')
      .values({
        degree: body.degree,
        shortcut: body.shortcut,
        isBefore: body.isBefore,
        weight: body.weight || 10,
      })
      .executeTakeFirstOrThrow();

    const degreeId = Number(result.insertId);

    const newDegree = await db.selectFrom('degrees')
      .selectAll()
      .where('degreeID', '=', degreeId)
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
  // GET /employees - List all employees (teachers)
  .get('/employees', async({ query, cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager', 'users.school'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    // Check permissions - only admins can view all
    const canViewAll = auth.manager == -1;
    
    let queryBuilder = db.selectFrom('teachers')
      .leftJoin('persons', 'teachers.personId', 'persons.personId')
      .leftJoin('users', 'users.person', 'persons.personId')
      .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
      .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
      .select([
        'teachers.personId',
        'persons.firstName',
        'persons.lastName',
        fullName,
        'teachers.role',
        'teachers.cabinet',
        sql<string>`(SELECT email FROM emails WHERE emails.personId = persons.personId LIMIT 1)`.as('email'),
        sql<string>`(SELECT number FROM phone_numbers WHERE phone_numbers.personId = persons.personId LIMIT 1)`.as('phone'),
      ])
      .where('users.school', '=', auth.school)

    // Search by name
    if (query.search) {
      const search = `%${query.search}%`;
      queryBuilder = queryBuilder.where((eb) => eb.or([
        eb('persons.firstName', 'like', search),
        eb('persons.lastName', 'like', search),
      ]))
    }

    // If not admin, only show self
    if (!canViewAll) {
      queryBuilder = queryBuilder.where('teachers.personId', '=', auth.person);
    }

    // Sort
    queryBuilder = queryBuilder
      .orderBy('persons.lastName', 'asc')
      .orderBy('persons.firstName', 'asc')

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

    return Response.json({
      data: results,
      meta: {
        total,
        page: Math.floor(query.offset! / query.limit!) + 1,
        limit: query.limit!
      }
    });

  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 50 })),
      offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
      search: t.Optional(t.String()),
    })
  })
  // GET /employees/:id - Employee detail
  .get('/employees/:id', async({ params, cookie }) => {
    const employeeId = parseInt(params.id);
    
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person', 'users.manager', 'users.school'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    // Check permissions - only admins can view all
    const canViewAll = auth.manager == -1;
    
    if (!canViewAll && auth.person !== employeeId) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    const employee = await db.selectFrom('teachers')
      .leftJoin('persons', 'teachers.personId', 'persons.personId')
      .innerJoin('users', 'users.person', 'persons.personId')
      .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
      .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
      .select([
        'teachers.personId',
        'persons.firstName',
        'persons.lastName',
        fullName,
        'teachers.role',
        'teachers.cabinet',
        sql<string>`DATE_FORMAT(persons.birthday, '%Y-%m-%d')`.as('dateOfBirth'),
      ])
      .where('teachers.personId', '=', employeeId)
      .where('users.school', '=', auth.school)
      .executeTakeFirst();

    if (!employee) {
      return new Response(JSON.stringify({ error: 'no_employee' }), { status: 404 });
    }

    // Get emails
    const emails = await db.selectFrom('emails')
      .select([
        'email',
        'is_verified'
      ])
      .where('personId', '=', employeeId)
      .execute();

    // Get phones
    const phones = await db.selectFrom('phone_numbers')
      .select([
        'code',
        'number',
        'is_verified'
      ])
      .where('personId', '=', employeeId)
      .execute();

    return Response.json({
      ...employee,
      emails,
      phones
    });
  })
  // POST /employees - Create new employee (admin only)
  .post('/employees', async({ body, cookie }) => {
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

    // Only admins can create employees
    if (auth.manager != -1) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    // Create person first
    const personResult = await db.insertInto('persons')
      .values({
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender || 0,
        birthday: body.birthday || null,
        birthnum: body.birthnum || null,
        birthplace: body.birthplace || null,
        address: body.address || null,
        GDPR: body.GDPR !== undefined ? body.GDPR : true,
        insuranceId: body.insuranceId || null,
      })
      .executeTakeFirstOrThrow();

    const personId = Number(personResult.insertId);

    // Insert email if provided
    if (body.email) {
      await db.insertInto('emails')
        .values({
          personId: personId,
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
          personId: personId,
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
            person: personId,
            degree: degreeId,
          })
          .execute();
      }
    }

    // Create teacher record
    await db.insertInto('teachers')
      .values({
        personId: personId,
        role: body.role!,
        cabinet: body.cabinet || null
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
      degrees: t.Optional(t.Array(t.Number())),
    })
  })
  // PUT /employees/:id - Update employee (admin only)
  .put('/employees/:id', async({ params, body, cookie }) => {
    const employeeId = parseInt(params.id);
    
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
    
    // Only admins can update employees
    if (auth.manager != -1) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    // Check if employee exists
    const employee = await db.selectFrom('teachers')
      .select('personId')
      .where('personId', '=', employeeId)
      .executeTakeFirst();

    if (!employee) {
      return new Response(JSON.stringify({ error: 'no_employee' }), { status: 404 });
    }

    // Update teachers table
    await db.updateTable('teachers')
      .set({
        role: body.role,
        cabinet: body.cabinet,
      })
      .where('personId', '=', employeeId)
      .execute();

    return Response.json({ success: true, message: 'Employee updated' });

  }, {
    body: t.Object({
      role: t.Optional(t.UnionEnum(['teacher', 'admin_staff', 'maintenance', 'management', 'personnel', 'other'])),
      cabinet: t.Optional(t.Number()),
    })
  })
  // DELETE /employees/:id - Remove employee (admin only)
  .delete('/employees/:id', async({ params, cookie }) => {
    const employeeId = parseInt(params.id);
    
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
    
    // Only admins can delete employees
    if (auth.manager != -1) {
      return new Response(JSON.stringify({ error: 'no_permission' }), { status: 403 });
    }

    // Check if employee exists
    const employee = await db.selectFrom('teachers')
      .select('personId')
      .where('personId', '=', employeeId)
      .executeTakeFirst();

    if (!employee) {
      return new Response(JSON.stringify({ error: 'no_employee' }), { status: 404 });
    }

    // Delete from teachers table
    await db.deleteFrom('teachers')
      .where('personId', '=', employeeId)
      .execute();

    return Response.json({ success: true, message: 'Employee removed' });
  });

export default employeesRouter;
