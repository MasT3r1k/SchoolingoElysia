import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';

const app = new Elysia()
  .get(
    '/traineeship/students',
    async ({ cookie, query }) => {
      const token = cookie.token?.value as string;

      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' }, { status: 401 });
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
        return Response.json({ error: 'no_user', details: 'no_db' }, { status: 401 });
      }

      // Check if user is admin/traineeship manager
      // manager & 64 (traineeship:manage) or manager == -1
      const isTraineeshipManager = auth.manager === -1 || (auth.manager && (auth.manager & 64));

      // Check if user is teacher
      const teacher = await db
        .selectFrom("teachers")
        .select(['personId'])
        .where('personId', '=', auth.person)
        .executeTakeFirst();

      const traineeshipId = query.traineeship ? parseInt(query.traineeship as string) : null;

      let dbQuery = db
        .selectFrom('persons as p')
        .innerJoin('students as s', 's.personId', 'p.personId')
        .innerJoin('classes as cl', 'cl.classId', 's.class')
        .leftJoin('traineeship_students as ts', 'ts.studentId', 's.personId')
        .leftJoin('traineeship_weeks as tw', 'tw.trWeekId', 'ts.traineeship')
        .leftJoin('traineeship_companies as c', 'c.companyId', 'ts.company')
        .leftJoin('traineeship_instructors as i', 'i.instructorId', 'ts.instructor')
        .select([
          's.personId as studentId',
          sql<string>`CONCAT(p.firstname, ' ', p.lastname)`.as('name'),
          sql<string>`CONCAT(cl.prefix, cl.suffix)`.as('class'),
          'c.name as company',
          sql<string>`CONCAT(i.firstname, ' ', i.lastname)`.as('instructor'),
          sql<boolean>`CASE WHEN ts.company IS NOT NULL THEN 1 ELSE 0 END`.as('hasContract'),
          sql<boolean>`CASE WHEN (SELECT COUNT(*) FROM traineeship_diary WHERE trWeekId = ts.traineeship AND studentId = s.personId AND mark IS NOT NULL) > 0 THEN 1 ELSE 0 END`.as('isProcessed'),
          'tw.trWeekId as traineeshipId',
          'tw.name as traineeshipName'
        ]);

      if (traineeshipId) {
        dbQuery = dbQuery.where((eb) => eb.or([
            eb('ts.traineeship', '=', traineeshipId),
            eb('ts.traineeship', 'is', null)
        ]));
      }

      if (!isTraineeshipManager) {
        if (teacher) {
            // If they are a teacher, check if they are a class teacher
            const classTeacherClasses = await db
                .selectFrom('classes')
                .select('classId')
                .where('teacher', '=', teacher.personId)
                .execute();
            
            if (classTeacherClasses.length > 0) {
                const classIds = classTeacherClasses.map(c => c.classId);
                dbQuery = dbQuery.where('cl.classId', 'in', classIds);
            } else {
                return Response.json([]);
            }
        } else {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }
      }

      const students = await dbQuery.execute();
      return Response.json(students);
    }
  );

export default app;
