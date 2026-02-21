import { Elysia } from 'elysia';
import { db } from '../../../../../database'
import moment from 'moment';

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
            'schools.gdpr_web'
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
  });

export default elysiaApp;
