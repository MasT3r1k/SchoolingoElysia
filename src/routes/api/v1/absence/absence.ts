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

        const [absence, timetable] = await Promise.all([
          db.selectFrom('absence')
            .leftJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
            .leftJoin('groups', 'classbook.group_id', 'groups.group_id')
            .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')
            .select([
              sql`COUNT(classbook.subject_id)`.as('count'),
              'classbook.subject_id'
            ])
            .where('classbook.date', '>=', start.format("YYYY-MM-DD"))
            .where('classbook.date', '<=', end.format("YYYY-MM-DD"))
            .where('school_years.current', '=', true)
            .where('classbook.group_id', 'in', groupNumbers)
            .where('absence.student_id', '=', id)
            .where('absence.type', 'not in', ignored_absences as number[])
            .groupBy('classbook.subject_id')
            .execute(),

          db.selectFrom('timetable')
            .leftJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
            .select([
                sql`COUNT(timetable.type)`.as('count'),
                'timetable.type',
                sql`timetable.subject_id`.as('subject_id'),
                sql`TRIM(subjects.label)`.as('subject_name'),
            ])
            .where('timetable.group_id', 'in', groupNumbers)
            .groupBy("timetable.subject_id")
            .groupBy("timetable.type")
            .execute()
        ])

        let lessons: Record<number, lessonInfo> = {};
        timetable.forEach((lesson: any) => {
            let lessonData = lessons[lesson.subject_id];
            let type: number[] = [];
            if (lessonData) {
              type = lessonData.type;
            }
            type[lesson.type] = lesson.count;
            
            if (!lessonData) {
              lessons[lesson.subject_id] = {
                subjectId: lesson.subject_id,
                subject: lesson.subject_name,
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

        absence.forEach((ab: any) => {
            let lessonData = lessons[ab.subject_id];
            if (lessonData) {
              lessonData.absence = parseInt(ab.count);
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
