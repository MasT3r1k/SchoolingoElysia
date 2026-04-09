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
            .leftJoin('persons', 'students.person_id', 'persons.person_id')
            .leftJoin('classes', 'students.class_id', 'classes.class_id')
            .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
            .select([
                'students.status',
                sql`DATE_FORMAT(students.start_study, '%d. %m. %Y')`.as('startStudy'),
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
            ])
            .where('persons.person_id', '=', id)
            .limit(1)
            .executeTakeFirstOrThrow(),

          db.selectFrom('student_groups')
            .innerJoin('groups', 'student_groups.group_id', 'groups.group_id')
            .innerJoin('school_years as sy', 'groups.year_id', 'sy.sy_id')
            .select([
                'groups.group_id',
                'groups.name',
                'groups.num',
            ])
            .where('student_groups.student_id', '=', id)
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
            groupNumbers.push(group.group_id)
        });
        if (!groupNumbers.length) {
          groupNumbers = [-1];
        }

        const [absence] = await Promise.all([
          db.selectFrom('absence')
            .leftJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
            .leftJoin('groups', 'classbook.group_id', 'groups.group_id')
            .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')

            .select([
              'absence.type',
              'absence.minutes',
              'absence.reason',
              'classbook.date',
              'classbook.day_hour',
              'classbook.subject_id'
            ])
            .where('classbook.date', '>=', start.format("YYYY-MM-DD"))
            .where('classbook.date', '<=', end.format("YYYY-MM-DD"))
            .where('school_years.current', '=', true)
            .where('classbook.group_id', 'in', groupNumbers)
            .where('absence.student_id', '=', id)
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
