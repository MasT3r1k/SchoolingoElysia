import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';

const app = new Elysia()
  .get(
    '/traineeship/diary_weeks',
    async ({ cookie }) => {
      const token = cookie.token.value;

      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.userId', 'users.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

      if (!auth) {
        return Response.json({ error: 'no_user', details: 'no_db' });
      }

      const student = await db
      .selectFrom("students")
      .select(['personId'])
      .where('personId', '=', auth.person)
      .executeTakeFirst();
      if (student) {
        const groups = await db.selectFrom("student_groups")
        .select("groupId")
        .where("student", "=", auth.person)
        .execute();

        let ids: number[] = [];
        for(let i = 0;i < groups.length;i++) {
            ids.push(groups[i].groupId);
        }

        const diary = await db
        .selectFrom('traineeship_weeks as tw')
        .leftJoin('traineeship_students as ts', (join) =>
          join
            .onRef('ts.traineeship', '=', 'tw.trWeekId')
            .on('ts.studentId', '=', auth.person),
        )
        .leftJoin('traineeship_companies as c', 'ts.company', 'c.companyId')
        .leftJoin(
          'traineeship_company_rating as r',
          'r.companyId',
          'c.companyId',
        )
        .leftJoin('addresses as a', 'a.addressId', 'c.addressOffice')
        .leftJoin('cities as ci', 'ci.cityId', 'a.cityId')
        .leftJoin('persons as in', 'in.personId', 'ts.instructor')
        .select((eb) => [
          'tw.trWeekId as traineeship',
          'tw.start',
          'tw.end',
          'tw.ignoredDays',
          'in.firstName as instructorFirstName',
          'in.lastName as instructorLastName',
          'c.name as companyName',
          'c.companyId',
          'c.status',
          'c.email',
          'c.phone',
          'a.street',
          'a.houseNumber',
          'ci.cityName',
          'ci.postcode',
          eb.fn.avg('r.rating').as('rating'),
        ])
        .where('tw.groupId', 'in', ids)
        .groupBy('tw.trWeekId')
        .orderBy('tw.start', 'desc')
        .execute();
        return Response.json(diary.map((_) => ({
          ..._,
          instructorFirstName: undefined,
          instructorLastName: undefined,
          instructor: (_.instructorFirstName && _.instructorLastName) ? `${_.instructorFirstName} ${_.instructorLastName}` : null
        })));
      }

      const teacher = await db
      .selectFrom("teachers")
      .select(['teachers.personId'])
      .where('personId', '=', auth.person)
      .executeTakeFirst()
      if (teacher) {
        const weeks = await db
        .selectFrom('traineeship_weeks as tw')
        .leftJoin('traineeship_students as ts', 'ts.traineeship', 'tw.trWeekId')
        .leftJoin('student_groups as sg', 'sg.groupId', 'tw.groupId')
        .select([
            'tw.state',
            'tw.start',
            'tw.end',
            'tw.name',
            'tw.ignoredDays',

            // COUNT DISTINCT CASE WHEN ...
            sql<number>`
            COUNT(DISTINCT CASE WHEN ts.company IS NOT NULL 
                                AND ts.traineeship = tw.trWeekId 
                                THEN ts.studentId END)
            `.as('zapsaniStudenti'),

            // COUNT DISTINCT student
            sql<number>`COUNT(DISTINCT sg.student)`.as('celkemStudentu')
        ])
        .groupBy('tw.trWeekId')
        .orderBy('tw.start', 'desc')
        .execute()
        return Response.json(weeks)
      }
      return Response.json({});
    },
    {
    },
  );

export default app;
