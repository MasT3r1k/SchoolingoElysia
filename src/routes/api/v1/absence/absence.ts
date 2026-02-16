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
  .get('/absence/:id', async ({ params: { id }, query }) => {
    try {
        let start = moment(query.start);
        let end = moment(query.end);
        if (!start.isValid()) {
          return new Response(JSON.stringify({
            error: "Invalid start"
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
        
        if (!end.isValid()) {
          return new Response(JSON.stringify({
            error: "Invalid end"
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        const ignored_absences: AbsenceType[] = [
          AbsenceType.EARLY,
          AbsenceType.LATE,
          AbsenceType.NON_COUNT
        ];

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

        const [absence, timetable] = await Promise.all([
          db.selectFrom('absence')
            .leftJoin('classbook', 'classbook.cbId', 'absence.lesson')
            .select([
              sql`COUNT(classbook.subject)`.as('count'),
              'classbook.subject'
            ])
            .where('classbook.date', '>=', start.format("YYYY-MM-DD"))
            .where('classbook.date', '<=', end.format("YYYY-MM-DD"))
            .where('absence.student', '=', id)
            .where('absence.type', 'not in', ignored_absences as number[])
            .execute(),

          db.selectFrom('timetable')
            .leftJoin('subjects', 'timetable.subject', 'subjects.subjectId')
            .select([
                sql`COUNT(timetable.type)`.as('count'),
                'timetable.type',
                sql`timetable.subject`.as('subjectId'),
                sql`TRIM(subjects.label)`.as('subjectName'),
            ])
            .where('timetable.groupId', 'in', groupNumbers)
            .groupBy("timetable.subject")
            .groupBy("timetable.type")
            .execute()
        ])

        let lessons: Record<number, lessonInfo> = {};
        timetable.forEach((lesson: any) => {
            let lessonData = lessons[lesson.subjectId];
            let type: number[] = [];
            if (lessonData) {
              type = lessonData.type;
            }
            type[lesson.type] = lesson.count;
            
            if (!lessonData) {
              lessons[lesson.subjectId] = {
                subjectId: lesson.subjectId,
                subject: lesson.subjectName,
                type,
                absence: 0,
                total_lessons: 0
              }
            }
        });

        let countWeeks = end.diff(start, 'week');
        let evenWeek = Math.floor((countWeeks + (end.isoWeek() % 2 === 0 ? 1 : 0)) / 2);
        let oddWeek = countWeeks - evenWeek;

        Object.values(lessons).forEach((lesson: lessonInfo) => {                
            let lessonNumber = 1;
            if (lesson.type[0]) { lessonNumber += countWeeks * lesson.type[0] }
            if (lesson.type[1]) { lessonNumber += oddWeek * lesson.type[1] }
            if (lesson.type[2]) { lessonNumber += evenWeek * lesson.type[2] }
            lesson.total_lessons = lessonNumber;
        });

        absence.forEach((absence: any) => {
            let lessonData = lessons[absence.subject];
            if (lessonData) {
              lessons[absence.subject].absence = absence.count;
            }
        });

        let obj: any = {
          date: { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') },
          lessons
        };

        return Response.json(obj);
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
