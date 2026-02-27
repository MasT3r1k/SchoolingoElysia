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
      .select([
        'classes.class_id',
        'classes.prefix',
        'classes.suffix',
        'sy.start as sy_start'
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
        class_id: c.class_id,
        class_name: `${c.prefix}${yearDiff}${c.suffix}`
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
  });




export default elysiaApp;
