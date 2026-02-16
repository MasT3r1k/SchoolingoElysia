import { Elysia, t } from 'elysia';
import { db } from '../../../../../database'
import { sql } from 'kysely';
import moment from 'moment';

export enum AbsenceType {
    ABSENCE,
    EXCUSED,
    UNEXCUSED,
    NON_COUNT,
    LATE,
    EARLY,
    DISTANCE
}

interface lessonInfo {
    subjectId: number;
    subject: string;
    type: number[];
    absence: number;
    total_lessons: number;
}

const elysiaApp = new Elysia()
  .get('/absences/:id', async ({ params: { id }, query }) => {
    try {
        let start = moment(query.start);
        let end = moment(query.end);
        if (!start.isValid()) {
          return new Response(JSON.stringify({ error: "Invalid start" }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
        
        if (!end.isValid()) {
          return new Response(JSON.stringify({ error: "Invalid end" }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        const absences: AbsenceType[] = [AbsenceType.EARLY, AbsenceType.LATE, AbsenceType.NON_COUNT];

        const [student, groups] = await Promise.all([
          db.selectFrom('students')
            .leftJoin('persons', 'students.personId', 'persons.personId')
            .leftJoin('classes', 'students.class', 'classes.classId')
            .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
            .select([
                'students.status',
                sql`DATE_FORMAT(students.startStudy, '%d. %m. %Y')`.as('startStudy'),
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
            ])
            .where('persons.personId', '=', id)
            .limit(1)
            .executeTakeFirstOrThrow(),

          db.selectFrom('student_groups')
            .innerJoin('groups', 'student_groups.groupId', 'groups.groupId')
            .innerJoin('school_years as sy', 'groups.year', 'sy.syId')
            .select([
                'groups.groupId',
                'groups.name',
                'groups.num',
            ])
            .where('student_groups.student', '=', id)
            .where('sy.current', '=', true)
            .execute()
        ]);

        if (!student) {
          return new Response(JSON.stringify({ error: "Student not found" }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        let groupNumbers: number[] = [];
        groups.forEach((group) => {
            groupNumbers.push(group.groupId)
        });
        if (!groupNumbers.length) {
          groupNumbers = [-1];
        }

        const [absence] = await Promise.all([
          db.selectFrom('absence')
            .leftJoin('classbook', 'classbook.cbId', 'absence.lesson')
            .leftJoin('groups', 'classbook.groupId', 'groups.groupId')
            .leftJoin('school_years', 'school_years.syId', 'groups.year')

            .select([
              'absence.type',
              'absence.minutes',
              'absence.reason',
              'classbook.date',
              'classbook.dayHour',
              'classbook.subject'
            ])
            .where('school_years.current', '=', true)
            .where('classbook.groupId', 'in', groupNumbers)
            .where('absence.student', '=', id)
            .where('absence.type', 'not in', absences as number[])
            .execute()
        ])
        return Response.json(absence);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Student not found", e }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    query: t.Object({
      start: t.String({
        default: moment().format("YYYY-MM-DD")
      }),
      end: t.String({
        default: moment().format("YYYY-MM-DD")
      })
    })
  });

export default elysiaApp;
