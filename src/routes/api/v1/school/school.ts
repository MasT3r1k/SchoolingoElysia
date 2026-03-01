import { Elysia } from 'elysia';
import { db } from '../../../../../database'
import moment from 'moment';
import { sql } from 'kysely';

const elysiaApp = new Elysia()
  .get('/school/', async ({ school, set }: any) => {
    if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
    }

    const now = moment().format("YYYY-MM-DD");

    const [schoolData, breaks, year] = await Promise.all([
        db.selectFrom("schools")
        .leftJoin('districts', 'districts.district_id', 'schools.district_id') // Use leftJoin in case district is 0/null
        .select([
            'schools.name',
            'schools.short_name',
            'schools.code',
            'schools.start_hour',
            'schools.start_minute',
            'schools.lesson_hour',
            'schools.break_time',
            'schools.reset_password_with_email',
            'schools.fastlogin',
            'schools.warning_absence_percent',
            'schools.modules',
            'schools.students_limit',
            'districts.district',
            'schools.auth_classic',
            'schools.auth_ldap',
            'schools.auth_passkeys',
            'schools.gdpr_first_name',
            'schools.gdpr_last_name',
            'schools.gdpr_phone',
            'schools.gdpr_email',
            'schools.gdpr_mobile',
            'schools.gdpr_databox',
            'schools.gdpr_web',
            'schools.msg_type_noticeboard_active',
            'schools.employee_vacation_days_default',
            'schools.employee_vacation_requests_enabled',
            'schools.employee_attendance_enabled',
            'schools.employee_salaries_enabled'
        ])
        .where('schools.school_id', '=', school.school_id)
        .executeTakeFirst(),
        db.selectFrom("school_breaks")
        .select([
            "school_breaks.hour",
            "school_breaks.minutes"
        ])
        .where('school_breaks.school_id', '=', school.school_id)
        .execute(),
        db.selectFrom("school_years")
        .select([
          'school_years.start',
          'school_years.midterm',
          'school_years.end'
        ])
        .where('school_years.start', '<=', new Date(now))
        .where('school_years.end', '>=', new Date(now))
        .executeTakeFirst()
    ])

    return Response.json({
      ...schoolData,
      year,
      breaks,
      login_expires: 15000
    });
  })
  .get('/school/degrees', async () => {
    return await db.selectFrom('degrees')
      .selectAll()
      .orderBy('weight', 'desc')
      .execute();
  })
  .get('/school/insurance', async () => {
    return await db.selectFrom('insurance_companies')
      .selectAll()
      .orderBy('insurance', 'asc')
      .execute();
  })
  .get('/school/subjects', async ({ school }: any) => {
    if (!school) return [];
    return await db.selectFrom('subjects')
      .selectAll()
      .where('school_id', '=', school.school_id)
      .orderBy('label', 'asc')
      .execute();
  })
  .get('/school/classes', async ({ school }: any) => {
    if (!school) return [];
    console.log('[SchoolAPI] Fetching classes for school:', school.school_id);
    const classes = await db.selectFrom("classes")
      .innerJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
      .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
      .leftJoin('teachers', 'teachers.person_id', 'classes.teacher_id')
      .leftJoin('persons', 'persons.person_id', 'teachers.person_id')
      .leftJoin('building_rooms', 'building_rooms.room_id', 'classes.room_id')
      .select(({ fn }) => [
        'classes.class_id',
        'classes.prefix',
        'classes.suffix',
        'sy.start as sy_start',
        'scopes.name as fieldOfStudy',
        'persons.first_name as teacher_first_name',
        'persons.last_name as teacher_last_name',
        'building_rooms.name as classroom',
        sql<number>`(SELECT COUNT(person_id) FROM students WHERE students.class_id = classes.class_id)`.as('studentsCount')
      ])
      .where('sy.school_id', '=', school.school_id)
      .execute();

    // Mapování jmen v JS, abychom se vyhnuli problémům s SQL dialektem v concat
    const mapped = classes.map(c => {
      const startYear = new Date(c.sy_start).getFullYear();
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      let yearDiff = currentYear - startYear;
      if (currentMonth >= 8) yearDiff++; // Školní rok začíná v září

      return {
        id: c.class_id,
        name: `${c.prefix}${yearDiff}${c.suffix}`,
        year: yearDiff,
        fieldOfStudy: c.fieldOfStudy || null,
        headTeacher: (c.teacher_first_name && c.teacher_last_name) ? `${c.teacher_first_name} ${c.teacher_last_name}` : null,
        classroom: c.classroom || null,
        studentsCount: c.studentsCount || 0
      };
    });

    console.log('[SchoolAPI] Found classes:', mapped.length);
    return mapped;
  })
  .get('/school/rooms', async ({ school }: any) => {
    if (!school) return [];
    return await db.selectFrom('building_rooms')
      .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
      .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
      .select([
        'building_rooms.room_id',
        'building_rooms.name',
        'building_rooms.capacity'
      ])
      .where('buildings.school_id', '=', school.school_id)
      .orderBy('building_rooms.name', 'asc')
      .execute();
  })

  .get('/school/classes/metadata', async ({ school }: any) => {
    if (!school) return { scopes: [], teachers: [], rooms: [] };
    const [scopes, teachersRaw, rooms] = await Promise.all([
      db.selectFrom('scopes').selectAll().where('school_id', '=', school.school_id).execute(),
      db.selectFrom('teachers')
        .innerJoin('persons', 'persons.person_id', 'teachers.person_id')
        .select(['teachers.person_id as id', 'persons.first_name', 'persons.last_name'])
        .where('teachers.school_id', '=', school.school_id).execute(),
      db.selectFrom('building_rooms')
        .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
        .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
        .select(['building_rooms.room_id as id', 'building_rooms.name'])
        .where('buildings.school_id', '=', school.school_id).execute()
    ]);
    return {
      scopes: scopes.map(s => ({ id: s.scope_id, name: s.name })),
      teachers: teachersRaw.map(t => ({ id: t.id, firstName: t.first_name, lastName: t.last_name })),
      rooms
    };
  })
  .post('/school/classes', async ({ body, school, set }: any) => {
    if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
    }
    const { name, year, scopeId, headTeacherId, classroomId } = body;
    if (!name || !year || !scopeId) {
        set.status = 400;
        return { error: 'Missing required fields' };
    }

    // Parse prefix and suffix from name (e.g., '1.A' or '1.')
    let prefix = name;
    let suffix = '';
    const match = name.match(/^(\d+\.?)(.*)/);
    if (match) {
        prefix = match[1];
        suffix = match[2];
    } else if (name.length > 2) {
      // rough fallback if without dots
      prefix = name.substring(0, 1) + '.';
      suffix = name.substring(1);
    }

    const currentYear = await db.selectFrom('school_years')
        .where('school_id', '=', school.school_id)
        .where('start', '<=', new Date())
        .where('end', '>=', new Date())
        .select('sy_id')
        .executeTakeFirst();
    
    if(!currentYear) {
      set.status = 400;
      return { error: 'No active school year found' };
    }

    try {
      await db.insertInto('classes').values({
        prefix,
        suffix,
        year_id: currentYear.sy_id,
        teacher_id: headTeacherId || 0,
        room_id: classroomId || 0,
        scope_id: scopeId
      }).execute();

      return { success: true };
    } catch (e: any) {
      set.status = 500;
      return { error: 'Failed to insert class: ' + e?.message };
    }
  })
  .delete('/school/classes/:id', async ({ params, school, set }: any) => {
    if (!school) {
        set.status = 412;
        return { error: 'School not configured' };
    }
    try {
      await db.deleteFrom('classes').where('class_id', '=', parseInt(params.id)).execute();
      return { success: true };
    } catch(e) {
      set.status = 500;
      return { error: 'Failed to delete class' };
    }
  });


export default elysiaApp;
