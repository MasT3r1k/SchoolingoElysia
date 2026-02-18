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
  
  .post('/timetable', async ({ body, user }) => {
    try {
      if (!user) {
         return Response.json({ error: 'unauthorized' }, { status: 401 });
      }

      let type = body.type;
      let targetId = body.id;
      let time = moment(body.time)

      if (user.person !== targetId) {
          const isPrincipal = user.isPrincipal;
          if (!isPrincipal) {
              // Check if requester is a teacher
              const isTeacher = await db.selectFrom('teachers')
                  .select(['personId'])
                  .where('personId', '=', user.person)
                  .executeTakeFirst();
              
              if (!isTeacher) {
                  // Check if requester is a parent of the target
                  const isParent = await db.selectFrom('family_relations')
                    .select(['source'])
                    .where('source', '=', user.person)
                    .where('target', '=', targetId)
                    .executeTakeFirst();
                  
                  if (!isParent) {
                      return Response.json({ error: 'forbidden', details: 'You are not allowed to view this timetable' }, { status: 403 });
                  }
              }
          }
      }

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
      .where('users.person', '=', targetId)
      .limit(1)
      .executeTakeFirst()

      const targetRoles = await db.selectFrom('users')
         .leftJoin('students', 'students.personId', 'users.person')
         .leftJoin('teachers', 'teachers.personId', 'users.person')
         .select([
             'students.personId as student',
             'teachers.personId as teacher'
         ])
         .where('users.person', '=', targetId)
         .executeTakeFirst();
      

      if (targetRoles?.student) {
          const groups = await db.selectFrom('student_groups')
              .innerJoin('groups', 'student_groups.groupId', 'groups.groupId')
              .innerJoin('school_years as sy', 'groups.year', 'sy.syId')
              .select([
                  'groups.groupId',
                  'groups.name',
                  'groups.num',
              ])
              .where('student_groups.student', '=', targetId)
              .where('sy.start', '<=', time.toDate())
              .where('sy.end', '>=', time.toDate())
              .execute()
          
          let groupNumbers: number[] = [];
          groups.forEach((group) => {
              groupNumbers.push(group.groupId)
          });
          if (!groupNumbers.length) {
              groupNumbers = [-1];
          }

          const [timetable, substitution, absences] = await Promise.all([
              db.selectFrom('timetable')
                  .innerJoin('subjects', 'timetable.subject', 'subjects.subjectId')
                  .leftJoin('persons', 'timetable.teacher', 'persons.personId')
                  .leftJoin('groups', 'groups.groupId', 'timetable.groupId')
                  .leftJoin('building_rooms', 'building_rooms.br_id', 'timetable.room')
                  .leftJoin('classes', 'classes.classId', 'groups.class')
                  .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
                  .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                  .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
                  .select([
                      'timetable.lessonId',
                      'groups.groupId',
                      'groups.name as groupName',
                      'groups.num as groupNum',
                      sql`(timetable.day + 1) % 7`.as('day'),
                      'timetable.hour',
                      'timetable.type',
                      sql`building_rooms.name`.as('room'),
                      'subjects.subjectId',
                      sql`subjects.label`.as('subjectName'),
                      sql`subjects.shortcut`.as('subjectShortcut'),
                      sql`persons.lastName`.as('lastName'),
                      fullName.as('teacher'),
                      'timetable.teacher as teacherId',
                      sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
                  ])
                  .where('timetable.groupId', 'in', groupNumbers)
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subjectId', 'subjects.subjectId')
                .leftJoin('persons',  'substitution.teacherId', 'persons.personId')
                .leftJoin('events', 'substitution.event_id', 'events.event_id')
                .leftJoin('groups', 'groups.groupId', 'substitution.groupId')
                .leftJoin('classes', 'classes.classId', 'groups.class')
                .leftJoin('building_rooms', 'building_rooms.br_id', 'substitution.roomId')
                .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
                .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                .leftJoin(titlesAfter,  'ta.person', 'persons.personId')
                .select([
                  'groups.groupId',
                  'groups.name as groupName',
                  'groups.num as groupNum',
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'substitution.type',
                  'events.event_name',
                  'events.event_description',
                  'building_rooms.name as room',
                  sql`subjects.label`.as('subjectName'),
                  sql`subjects.shortcut`.as('subjectShortcut'),
                  sql`persons.lastName`.as('lastName'),
                  fullName.as('teacher'),
                  'substitution.teacherId',
                  sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('substitution.groupId', 'in', groupNumbers),
                      eb('substitution.groupId', 'is', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').toDate()),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').toDate())
                  ])
                )
                .execute(),

              db.selectFrom('absence')
                .innerJoin('classbook', 'classbook.cbId', 'absence.lesson')
                .select([
                  'classbook.date',
                  'classbook.dayHour as hour',
                  'absence.type'
                ])
                .where('absence.student', '=', targetId)
                // Use the same date logic as substitutions
                .where('classbook.date', '>=', time.clone().startOf('isoWeek').format('YYYY-MM-DD')) 
                .where('classbook.date', '<=', time.clone().endOf('isoWeek').format('YYYY-MM-DD'))
                .execute()
          ])

          return Response.json({timetable, substitution, absences});
      } else if (targetRoles?.teacher) {
        if (type == "person") {
          const [timetable, substitution] = await Promise.all([
              db.selectFrom('timetable')
                  .innerJoin('subjects', 'timetable.subject', 'subjects.subjectId')
                  .leftJoin('groups', 'groups.groupId', 'timetable.groupId')
                  .leftJoin('persons', 'persons.personId', 'timetable.teacher')
                  .leftJoin('classes', 'groups.class', 'classes.classId')
                  .leftJoin('building_rooms', 'building_rooms.br_id', 'timetable.room')
                  .leftJoin('school_years as syClass', 'syClass.syId', 'classes.yearId')
                  .leftJoin('school_years as syGroup', 'syGroup.syId', 'groups.year')
                  .select([
                    'timetable.lessonId',
                    'groups.groupId',
                    'groups.name as groupName',
                    'groups.num as groupNum',
                    sql`(timetable.day + 1) % 7`.as('day'),
                    'timetable.hour',
                    'timetable.type',
                    'timetable.groupId',
                    sql`building_rooms.name`.as('room'),
                    'subjects.subjectId',
                    'timetable.teacher as teacherId',
                    sql`subjects.label`.as('subjectName'),
                    sql`subjects.shortcut`.as('subjectShortcut'),
                    sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, syClass.start, CURDATE()) + 1, classes.suffix)`.as('className')
                  ])
                  .where((eb) =>
                    eb.and([
                      eb('timetable.teacher', '=', targetId),
                      eb('syGroup.start', '<=',  time.clone().toDate()),
                      eb('syGroup.end', '>=',    time.clone().toDate())
                    ])
                  )
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subjectId', 'subjects.subjectId')
                .leftJoin('groups', 'groups.groupId', 'substitution.groupId')
                .leftJoin('classes', 'groups.class', 'classes.classId')
                .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
                .leftJoin('persons',  'substitution.teacherId', 'persons.personId')
                .leftJoin('building_rooms', 'building_rooms.br_id', 'substitution.roomId')
                .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                .leftJoin(titlesAfter,  'ta.person', 'persons.personId')
                .select([
                  'groups.groupId',
                  'groups.name as groupName',
                  'groups.num as groupNum',
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'subjects.subjectId',
                  'substitution.teacherId',
                  'building_rooms.name as room',
                  sql`subjects.label`.as('subjectName'),
                  sql`subjects.shortcut`.as('subjectShortcut'),
                  sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('substitution.teacherId', '=', targetId),
                      eb('substitution.groupId', 'is', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').toDate()),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').toDate())
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
                  .leftJoin('classes', 'classes.classId', 'groups.class')
                  .leftJoin('building_rooms', 'building_rooms.br_id', 'timetable.room')
                  .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
                  .leftJoin('persons', 'timetable.teacher', 'persons.personId')
                  .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                  .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
                  .select([
                    'timetable.lessonId',
                    'groups.groupId',
                    'groups.name as groupName',
                    'groups.num as groupNum',
                    sql`(timetable.day + 1) % 7`.as('day'),
                    'timetable.hour',
                    'timetable.type',
                    sql`building_rooms.name`.as('room'),
                    'subjects.subjectId',
                    sql`subjects.label`.as('subjectName'),
                    sql`subjects.shortcut`.as('subjectShortcut'),
                    sql`persons.lastName`.as('lastName'),
                    'timetable.teacher as teacherId',
                    sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className'),
                    fullName.as('teacher')
                  ])
                  .where('groups.class', '=', targetId)
                  .where((eb) => eb.exists(
                      db.selectFrom('school_years as syGroup').select('syGroup.start')
                      .whereRef('syGroup.syId', '=', 'groups.year')
                      .where('syGroup.start', '<=', time.clone().toDate())
                      .where('syGroup.end', '>=', time.clone().toDate())
                   ))
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subjectId', 'subjects.subjectId')
                .leftJoin('groups', 'groups.groupId', 'substitution.groupId')
                .leftJoin('classes', 'classes.classId', 'groups.class')
                .leftJoin('persons', 'substitution.teacherId', 'persons.personId')
                .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
                .leftJoin('building_rooms', 'building_rooms.br_id', 'substitution.roomId')
                .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
                .leftJoin(titlesAfter,  'ta.person', 'persons.personId')
                .select([
                  'groups.groupId',
                  'groups.name as groupName',
                  'groups.num as groupNum',
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'subjects.subjectId',
                  'substitution.teacherId',
                  'building_rooms.name as room',
                  sql`subjects.label`.as('subjectName'),
                  sql`subjects.shortcut`.as('subjectShortcut'),
                  fullName.as('teacher'),
                  sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('groups.class', '=', targetId),
                      eb('substitution.groupId', '=', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').toDate()),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').toDate())
                  ])
                )
                .execute()
          ])

          return Response.json({timetable, substitution});
        } else if (type == "supervision") {
          const timetable = await db.selectFrom('supervisions')
            .innerJoin('persons', 'persons.personId', 'supervisions.teacherId')
            .innerJoin('supervision_places', 'supervision_places.placeId', 'supervisions.placeId')
            .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
            .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
            .select([
              'supervisions.supervisionId',
              'supervisions.teacherId',
              'supervision_places.name as room',
              sql`(supervisions.day + 1) % 7`.as('day'),
              'supervisions.hour',
              'supervisions.description as className',
              sql`'supervision'`.as('type'),
              sql`'Dozor'`.as('subjectName'),
              sql`'Dozor'`.as('subjectShortcut'),
              fullName.as('teacher')
            ])
            .where('supervisions.teacherId', '=', targetId)
            .execute();

          return Response.json({ timetable, substitution: [] });
        }
      }
      
      // If no valid roles found or structure unsupported
      return Response.json({ timetable: [], substitution: [] });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Student not found or internal error", e }), {
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
    })
  });

export default elysiaApp;
