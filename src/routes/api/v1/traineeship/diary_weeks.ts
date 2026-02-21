import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';

const app = new Elysia()
  .get(
    '/traineeship/diary_weeks',
    async ({ cookie }: any) => {
      const token = cookie.token?.value as string;

      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.user_id', 'users.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

      if (!auth) {
        return Response.json({ error: 'no_user', details: 'no_db' });
      }

      const student = await db
      .selectFrom("students")
      .select(['person_id'])
      .where('person_id', '=', auth.person_id)
      .executeTakeFirst();
      if (student) {
        const groups = await db.selectFrom("student_groups")
        .select("group_id")
        .where("student_id", "=", auth.person_id)
        .execute();

        const groupIds = groups.map(g => g.group_id);
        if (groupIds.length === 0) groupIds.push(-1);

        const diary = await db
        .selectFrom('traineeship_weeks as tw')
        .leftJoin('traineeship_students as ts', (join) =>
          join
            .onRef('ts.traineeship_id', '=', 'tw.tr_week_id')
            .on('ts.student_id', '=', auth.person_id),
        )
        .leftJoin('traineeship_companies as c', 'ts.company_id', 'c.company_id')
        .leftJoin(
          'traineeship_company_rating as r',
          'r.company_id',
          'c.company_id',
        )
        .leftJoin('addresses as a', 'a.address_id', 'c.address_office')
        .leftJoin('cities as ci', 'ci.city_id', 'a.city_id')
        .leftJoin('traineeship_instructors as in', 'in.instructor_id', 'ts.instructor_id')
        .select((eb) => [
          'tw.tr_week_id as traineeship',
          'tw.name',
          'tw.start',
          'tw.end',
          'tw.ignored_days',
          'in.instructor_id',
          'in.firstname as instructor_first_name',
          'in.lastname as instructor_last_name',
          'c.name as company_name',
          'c.company_id',
          'c.status',
          'c.email',
          'c.phone',
          'a.street',
          'a.house_number',
          'ci.city_name',
          'ci.postcode',
          eb.fn.avg('r.rating').as('rating'),
        ])
        .where('tw.group_id', 'in', groupIds)
        .groupBy('tw.tr_week_id')
        .orderBy('tw.start', 'desc')
        .execute();
        
        return Response.json(diary.map((_) => ({
          ..._,
          instructor_first_name: undefined,
          instructor_last_name: undefined,
          instructor: (_.instructor_first_name && _.instructor_last_name) ? `${_.instructor_first_name} ${_.instructor_last_name}` : null
        })));
      }

      const teacher = await db
      .selectFrom("teachers")
      .select(['teachers.person_id'])
      .where('person_id', '=', auth.person_id)
      .executeTakeFirst()
      if (teacher) {
        // Check if user is admin/traineeship manager
        // manager & 64 (traineeship:manage) or manager == -1
        const isTraineeshipManager = auth.manager === -1 || (auth.manager && (auth.manager & 64));

        let queryBuilder = db
        .selectFrom('traineeship_weeks as tw')
        .leftJoin('traineeship_students as ts', 'ts.traineeship_id', 'tw.tr_week_id')
        .leftJoin('student_groups as sg', 'sg.group_id', 'tw.group_id')
        .leftJoin('groups as g', 'g.group_id', 'tw.group_id')
        .leftJoin('classes as cl', 'cl.class_id', 'g.class_id')
        .select([
            'tw.tr_week_id',
            'tw.state',
            'tw.start',
            'tw.end',
            'tw.name',
            'tw.ignored_days',

            // COUNT DISTINCT CASE WHEN ...
            sql<number>`
            COUNT(DISTINCT CASE WHEN ts.company_id IS NOT NULL 
                                AND ts.traineeship_id = tw.tr_week_id 
                                THEN ts.student_id END)
            `.as('registered_students'),

            // COUNT DISTINCT student
            sql<number>`COUNT(DISTINCT sg.student_id)`.as('total_students')
        ]);

        if (!isTraineeshipManager) {
            // If they are a teacher, check if they are a class teacher
            const classTeacherClasses = await db
                .selectFrom('classes')
                .select('class_id')
                .where('teacher_id', '=', teacher.person_id)
                .execute();
            
            if (classTeacherClasses.length > 0) {
                const classIds = classTeacherClasses.map(c => c.class_id);
                queryBuilder = queryBuilder.where('cl.class_id', 'in', classIds);
            } else {
                // If not a class teacher and not manager, return empty
                return Response.json([]);
            }
        }

        const weeks = await queryBuilder
        .groupBy('tw.tr_week_id')
        .orderBy('tw.start', 'desc')
        .execute()
        return Response.json(weeks)
      }
      return Response.json([]);
    }
  );

export default app;
