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
        .leftJoin('districts', 'districts.districtId', 'schools.district') // Use leftJoin in case district is 0/null
        .select([
            'schools.name',
            'schools.shortName',
            'schools.code',
            'schools.startHour',
            'schools.startMinute',
            'schools.lessonHour',
            'schools.breakTime',
            'schools.resetPasswordWithEmail',
            'schools.fastlogin',
            'schools.warningAbsencePercent',
            'schools.modules',
            'schools.studentsLimit',
            'districts.district',
            'schools.auth_classic',
            'schools.auth_ldap',
            'schools.auth_passkeys',
            'schools.gdpr_firstname',
            'schools.gdpr_lastname',
            'schools.gdpr_phone',
            'schools.gdpr_email',
            'schools.gdpr_mobile',
            'schools.gdpr_databox',
            'schools.gdpr_web'
        ])
        .where('schools.schoolId', '=', school.schoolId)
        .executeTakeFirst(),
        db.selectFrom("school_breaks")
        .select([
            "school_breaks.hour",
            "school_breaks.minutes"
        ])
        .where('school_breaks.school', '=', school.schoolId)
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
      loginExpires: 15000
    });
  });

export default elysiaApp;
