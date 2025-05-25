import { Elysia, t } from 'elysia';
import { db } from "../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../..';
import moment from 'moment';

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
  .use(rateLimit({
    scoping: "scoped",
    max: 1,
    duration: 1000,
    injectServer: () => app.server
  }))
  .get('/student/:id', async ({ params: { id }, query }) => {
    try {
        let time = moment(query.time);
        let show = query.type.split(',');
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
            .where('sy.start', '<=', time.format("YYYY-MM-DD"))
            .where('sy.end', '>=', time.format("YYYY-MM-DD"))
            .execute()
        ]);

        let groupNumbers: number[] = [];
        groups.forEach((group) => {
            groupNumbers.push(group.groupId)
        });
        if (!groupNumbers.length) {
          groupNumbers = [-1];
        }

        const [timetable, substitution] = await Promise.all([
            db.selectFrom('timetable')
            .innerJoin('subjects', 'timetable.subject', 'subjects.subjectId')
            .leftJoin('persons', 'timetable.teacher', 'persons.personId')
            .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
            .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
            .select([
                sql`(timetable.day + 1) % 7`.as('day'),
                'timetable.hour',
                'timetable.type',
                sql`subjects.label`.as('subjectName'),
                sql`subjects.shortcut`.as('subjectShortcut'),
                fullName.as('teacher')
            ])
            .where('timetable.groupId', 'in', groupNumbers)
            .execute(),

            db.selectFrom('substitution')
            .leftJoin('subjects', 'substitution.subjectId', 'subjects.subjectId')
            .leftJoin('persons',  'substitution.teacherId', 'persons.personId')
            .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
            .leftJoin(titlesAfter,  'ta.person', 'persons.personId')
            .select([
                'substitution.date',
                'substitution.hour',
                sql`subjects.label`.as('subjectName'),
                sql`subjects.shortcut`.as('subjectShortcut'),
                fullName.as('teacher')
            ])
            .where('substitution.groupId', 'in', groupNumbers)
            .where('substitution.date', '>=', time.clone().startOf('isoWeek').format("YYYY-MM-DD"))
            .where('substitution.date', '<=', time.clone().endOf('isoWeek')  .format("YYYY-MM-DD"))
            .execute()
        ])


        let obj: any = {};
        if (show.includes('basic')) {
          obj = {...student};
        }

        if (show.includes('groups')) {
            obj.groups = groups;
        }

        if (show.includes('timetable')) {
            obj.timetable = timetable;
            obj.substitution = substitution;
        }

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
        type: t.String({
            default: ''
        }),
        time: t.String({
            default: moment().format("YYYY-MM-DD")
        })
    }),
    detail: {
      description: "This endpoint is rate-limited: max 1 request per 1 second",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", example: "Ing. Bc. Josef Kosík" },
                  status: { type: "string", enum: ["active", "archive"] },
                  startStudy: { type: "string", example: "06. 09. 2021" },
                  className: { type: "string", example: "B3.I" },
                  groups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        groupId: { type: "number", example: 42 },
                        name: { type: "string", example: "Laboratorní skupina A" },
                        num: { type: "string", example: "01" },
                        class: { type: "string", example: "B3.I" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: "Invalid student",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string", example: "Student not found" }
                }
              }
            }
          }
        },
        429: {
          description: "Rate limit exceeded",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "rate-limited"
                  }
                }
              }
            }
          }
        }
      }
    }
  });

export default elysiaApp;
