import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .get(
    '/traineeship/students',
    async ({ cookie, query }: any) => {
      const token = cookie.token?.value as string;

      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' }, { status: 401 });
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
        return Response.json({ error: 'no_user', details: 'no_db' }, { status: 401 });
      }

      // Check if user is admin/traineeship manager
      // manager & 64 (traineeship:manage) or manager == -1
      const isTraineeshipManager = auth.manager === -1 || (auth.manager && (auth.manager & 64));

      // Check if user is teacher
      const teacher = await db
        .selectFrom("teachers")
        .select(['person_id'])
        .where('person_id', '=', auth.person_id)
        .executeTakeFirst();

      const traineeshipId = query.traineeship ? parseInt(query.traineeship as string) : null;

      let dbQuery = db
        .selectFrom('persons as p')
        .innerJoin('students as s', 's.person_id', 'p.person_id')
        .innerJoin('classes as cl', 'cl.class_id', 's.class_id')
        .leftJoin('traineeship_students as ts', 'ts.student_id', 's.person_id')
        .leftJoin('traineeship_weeks as tw', 'tw.tr_week_id', 'ts.traineeship_id')
        .leftJoin('traineeship_companies as c', 'c.company_id', 'ts.company_id')
        .leftJoin('traineeship_instructors as i', 'i.instructor_id', 'ts.instructor_id')
        .select([
          's.person_id as student_id',
          'p.first_name',
          'p.last_name',
          sql<string>`CONCAT(cl.prefix, cl.suffix)`.as('class'),
          'c.name as company',
          sql<string>`CONCAT(i.first_name, ' ', i.lastname)`.as('instructor'),
          sql<boolean>`CASE WHEN ts.company_id IS NOT NULL THEN 1 ELSE 0 END`.as('has_contract'),
          sql<boolean>`CASE WHEN (SELECT COUNT(*) FROM traineeship_diary WHERE tr_week_id = ts.traineeship_id AND student_id = s.person_id AND mark IS NOT NULL) > 0 THEN 1 ELSE 0 END`.as('is_processed'),
          'tw.tr_week_id as traineeship_id',
          'tw.name as traineeship_name'
        ]);

      if (traineeshipId) {
        dbQuery = dbQuery.where((eb) => eb.or([
            eb('ts.traineeship_id', '=', traineeshipId),
            eb('ts.traineeship_id', 'is', null)
        ]));
      }

      if (!isTraineeshipManager) {
        if (teacher) {
            // If they are a teacher, check if they are a class teacher
            const classTeacherClasses = await db
                .selectFrom('classes')
                .select('class_id')
                .where('teacher_id', '=', teacher.person_id)
                .execute();
            
            if (classTeacherClasses.length > 0) {
                const classIds = classTeacherClasses.map(c => c.class_id);
                dbQuery = dbQuery.where('cl.class_id', 'in', classIds);
            } else {
                return Response.json([]);
            }
        } else {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }
      }

      const results = await dbQuery.execute();

      const studentIds = results.map(r => r.student_id).filter((id): id is number => id !== null);
      const formattedNames = await format_person_map_by_ids(studentIds);

      const students = results.map(r => ({
        ...r,
        full_name: r.student_id ? formattedNames.get(r.student_id) : `${r.first_name} ${r.last_name}`
      }));

      return Response.json(students);
    }
  );

export default app;
