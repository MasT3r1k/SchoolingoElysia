import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';

const app = new Elysia()
  .get(
    '/traineeship/diary_weeks',
    async ({ cookie }) => {
      const token = cookie.token?.value as string;

      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.userId', 'users.userId')
      .select(['tokens.userId', 'users.person', 'users.manager'])
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
        .leftJoin('traineeship_instructors as in', 'in.instructorId', 'ts.instructor')
        .select((eb) => [
          'tw.trWeekId as traineeship',
          'tw.name',
          'tw.start',
          'tw.end',
          'tw.ignoredDays',
          'in.instructorId',
          'in.firstname as instructorFirstName',
          'in.lastname as instructorLastName',
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
        // Check if user is admin/traineeship manager
        // manager & 64 (traineeship:manage) or manager == -1
        const isTraineeshipManager = auth.manager === -1 || (auth.manager && (auth.manager & 64));

        let query = db
        .selectFrom('traineeship_weeks as tw')
        .leftJoin('traineeship_students as ts', 'ts.traineeship', 'tw.trWeekId')
        .leftJoin('student_groups as sg', 'sg.groupId', 'tw.groupId')
        .leftJoin('groups as g', 'g.groupId', 'tw.groupId')
        .leftJoin('classes as cl', 'cl.classId', 'g.class')
        .select([
            'tw.trWeekId',
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
        ]);

        if (!isTraineeshipManager) {
            // If they are a teacher, check if they are a class teacher
            const classTeacherClasses = await db
                .selectFrom('classes')
                .select('classId')
                .where('teacher', '=', teacher.personId)
                .execute();
            
            if (classTeacherClasses.length > 0) {
                const classIds = classTeacherClasses.map(c => c.classId);
                query = query.where('cl.classId', 'in', classIds);
            } else {
                // If not a class teacher and not manager, return empty
                return Response.json([]);
            }
        }

        const weeks = await query
        .groupBy('tw.trWeekId')
        .orderBy('tw.start', 'desc')
        .execute()
        return Response.json(weeks)
      }
      return Response.json([]);
    },
    {
    },
  );

export default app;
