import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
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
    max: 5,
    duration: 1000,
    injectServer: () => app.server
  }))
  .post('/timetable', async ({ body }) => {
    try {
      let type = body.type;
      let id = body.id;
      let time = moment(body.time)

      const perms = await db.selectFrom("tokens")
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .leftJoin('students', 'students.personId', 'users.person')
      .leftJoin('teachers', 'teachers.personId', 'users.person')
      .leftJoin('family_relations', 'family_relations.source', 'users.person')
      .select([
          sql`students.personId`.as('student'),
          sql`teachers.personId`.as('teacher'),
          sql`family_relations.source`.as('parent')
      ])
      .where('users.person', '=', id)
      .limit(1)
      .executeTakeFirst()

      if (perms?.student) {
          const groups = await db.selectFrom('student_groups')
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
                  .leftJoin('building_rooms', 'building_rooms.br_id', 'timetable.room')
                  .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                  .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
                  .select([
                      sql`(timetable.day + 1) % 7`.as('day'),
                      'timetable.hour',
                      'timetable.type',
                      sql`building_rooms.name`.as('room'),
                      'subjects.subjectId',
                      sql`subjects.label`.as('subjectName'),
                      sql`subjects.shortcut`.as('subjectShortcut'),
                      sql`persons.lastName`.as('lastName'),
                      fullName.as('teacher')
                  ])
                  .where('timetable.groupId', 'in', groupNumbers)
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subjectId', 'subjects.subjectId')
                .leftJoin('persons',  'substitution.teacherId', 'persons.personId')
                .leftJoin('events', 'substitution.event_id', 'events.event_id')
                .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                .leftJoin(titlesAfter,  'ta.person', 'persons.personId')
                .select([
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'substitution.type',
                  'events.event_name',
                  'events.event_description',
                  sql`subjects.label`.as('subjectName'),
                  sql`subjects.shortcut`.as('subjectShortcut'),
                  sql`persons.lastName`.as('lastName'),
                  fullName.as('teacher')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('substitution.groupId', 'in', groupNumbers),
                      eb('substitution.groupId', 'is', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').format('YYYY-MM-DD')),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').format('YYYY-MM-DD'))
                  ])
                )
                .execute()
          ])

          return Response.json({timetable, substitution});
      } else if (perms?.teacher) {
        if (type == "person") {
          const [timetable, substitution] = await Promise.all([
              db.selectFrom('timetable')
                  .innerJoin('subjects', 'timetable.subject', 'subjects.subjectId')
                  .leftJoin('groups', 'groups.groupId', 'timetable.groupId')
                  .leftJoin('classes', 'groups.class', 'classes.classId')
                  .leftJoin('building_rooms', 'building_rooms.br_id', 'timetable.room')
                  .leftJoin('school_years as syClass', 'syClass.syId', 'classes.yearId')
                  .leftJoin('school_years as syGroup', 'syGroup.syId', 'groups.year')
                  .select([
                      sql`(timetable.day + 1) % 7`.as('day'),
                      'timetable.hour',
                      'timetable.type',
                      'timetable.groupId',
                      sql`building_rooms.name`.as('room'),
                      'subjects.subjectId',
                      sql`subjects.label`.as('subjectName'),
                      sql`subjects.shortcut`.as('subjectShortcut'),
                      sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, syClass.start, CURDATE()) + 1, classes.suffix)`.as('className')
                  ])
                  .where((eb) =>
                    eb.and([
                      eb('timetable.teacher', '=', id),
                      eb('syGroup.start', '<=',  time.clone().format("YYYY-MM-DD")),
                      eb('syGroup.end', '>=',    time.clone().format("YYYY-MM-DD"))
                    ])
                  )
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subjectId', 'subjects.subjectId')
                .leftJoin('groups', 'groups.groupId', 'substitution.groupId')
                .leftJoin('classes', 'groups.class', 'classes.classId')
                .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
                .leftJoin('persons',  'substitution.teacherId', 'persons.personId')
                .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                .leftJoin(titlesAfter,  'ta.person', 'persons.personId')
                .select([
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'subjects.subjectId',
                  sql`subjects.label`.as('subjectName'),
                  sql`subjects.shortcut`.as('subjectShortcut'),
                  sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('substitution.teacherId', '=', id),
                      eb('substitution.groupId', 'is', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').format('YYYY-MM-DD')),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').format('YYYY-MM-DD'))
                  ])
                )
                .execute()
          ])

          return Response.json({timetable, substitution});
        }
        else if (type == "class") {
          const [timetable, substitution] = await Promise.all([
              db.selectFrom('timetable')
                  .innerJoin('subjects', 'timetable.subject', 'subjects.subjectId')
                  .leftJoin('groups', 'groups.groupId', 'timetable.groupId')
                  .leftJoin('building_rooms', 'building_rooms.br_id', 'timetable.room')
                  .leftJoin('school_years as syGroup', 'syGroup.syId', 'groups.year')
                  .leftJoin('persons', 'timetable.teacher', 'persons.personId')
                  .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                  .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
                  .select([
                      sql`(timetable.day + 1) % 7`.as('day'),
                      'timetable.hour',
                      'timetable.type',
                      sql`building_rooms.name`.as('room'),
                      'subjects.subjectId',
                      sql`subjects.label`.as('subjectName'),
                      sql`subjects.shortcut`.as('subjectShortcut'),
                      sql`persons.lastName`.as('lastName'),
                      fullName.as('teacher')
                  ])
                  .where('groups.class', '=', id)
                  .where('syGroup.start', '<=',  time.clone().format("YYYY-MM-DD"))
                  .where('syGroup.end', '>=',    time.clone().format("YYYY-MM-DD"))
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subjectId', 'subjects.subjectId')
                .leftJoin('groups', 'groups.groupId', 'substitution.groupId')
                .leftJoin('persons', 'substitution.teacherId', 'persons.personId')
                .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                .leftJoin(titlesAfter,  'ta.person', 'persons.personId')
                .select([
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'subjects.subjectId',
                  sql`subjects.label`.as('subjectName'),
                  sql`subjects.shortcut`.as('subjectShortcut'),
                  fullName.as('teacher')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('groups.class', '=', id),
                      eb('substitution.groupId', '=', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').format('YYYY-MM-DD')),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').format('YYYY-MM-DD'))
                  ])
                )
                .execute()
          ])

          return Response.json({timetable, substitution});
        }
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: "Student not found", e }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }, {
    body: t.Object({
      type: t.String({
        default: 'person'
      }),
      id: t.Number({
        minimum: 1
      }),
      time: t.Date({
        default: moment().format("YYYY-MM-DD")
      })
    }),
    detail: {
      description: "This endpoint is rate-limited: max 5 requests per 1 second",
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
