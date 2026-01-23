import { Elysia, t } from 'elysia';
import { db } from '../../../../../database'
import { sql } from 'kysely';
import moment from 'moment';
import { AbsenceType } from '../../../../types/absence';

interface lessonInfo {
    subjectId: number;
    subject: string;
    type: number[];
    absence: number;
    total_lessons: number;
}

const titlesBefore = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID')
  .select([
    'pd.person as person',
    sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_before')
  ])
  .where('d.isBefore', '=', true)
  .groupBy('pd.person')
  .as('tb');

const titlesAfter = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID') 
  .select([
    'pd.person as person',
    sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_after')
  ])
  .where('d.isBefore', '=', false)
  .groupBy('pd.person')
  .as('ta');

const fullName = sql`
  concat(
    COALESCE(
      CASE WHEN tb.titles_before IS NULL OR tb.titles_before = '' THEN ''
      ELSE CONCAT(tb.titles_before, ' ')
      END,
    ''
    ),
    persons.firstName, ' ', persons.lastName,
    COALESCE(
      CASE WHEN ta.titles_after IS NULL OR ta.titles_after = '' THEN ''
      ELSE CONCAT(' ', ta.titles_after)
      END,
    ''
    )
  )
`;

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
            .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
            .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
            .select([
                fullName.as('fullName'),
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
            .where('sy.start', '<=', moment().format("YYYY-MM-DD"))
            .where('sy.end', '>=', moment().format("YYYY-MM-DD"))
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
            .where('school_years.start', '<=', moment().format("YYYY-MM-DD"))
            .where('school_years.end', '>=', moment().format("YYYY-MM-DD"))
            .where('classbook.groupId', 'in', groupNumbers)
            .where('absence.student', '=', id)
            .where('absence.type', 'not in', absences)
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
