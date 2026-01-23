import { Elysia } from 'elysia';
import { db } from '../../../../../database'
import moment from 'moment';

const elysiaApp = new Elysia()
  .get('/school/', async () => {
    const now = moment().format("YYYY-MM-DD");

    const [school, breaks, year] = await Promise.all([
        db.selectFrom("schools")
        .innerJoin('districts', 'districts.districtId', 'schools.district')
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
            'districts.district'
        ])
        .executeTakeFirst(),
        db.selectFrom("school_breaks")
        .select([
            "school_breaks.hour",
            "school_breaks.minutes"
        ])
        .execute(),
        db.selectFrom("school_years")
        .select([
          'school_years.start',
          'school_years.midterm',
          'school_years.end'
        ])
        .where('school_years.start', '<=', now)
        .where('school_years.end', '>=', now)
        .executeTakeFirst()
    ])

    return Response.json({
      ...school,
      year,
      breaks,
      loginExpires: 15000
    });
  });

export default elysiaApp;
