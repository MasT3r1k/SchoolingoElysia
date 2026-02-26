import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const elysiaApp = new Elysia()
  
  .post('/timetable', async ({ body, user }: any) => {
    try {
      if (!user) {
         return Response.json({ error: 'unauthorized' }, { status: 401 });
      }

      let type = body.type;
      let targetId = body.id;
      let time = moment(body.time)
      console.log(user)
      if (user.person_id !== targetId) {
          const isPrincipal = user.is_principal;
          if (!isPrincipal) {
              // Check if requester is a teacher
              const isTeacher = await db.selectFrom('teachers')
                  .select(['person_id'])
                  .where('person_id', '=', user.person_id)
                  .executeTakeFirst();
              
              if (!isTeacher) {
                  // Check if requester is a parent of the target
                  const isParent = await db.selectFrom('family_relations')
                    .select(['source_id'])
                    .where('source_id', '=', targetId)
                    .where('target_id', '=',  user.person_id)
                    .executeTakeFirst();
                  
                  if (!isParent) {
                      return Response.json({ error: 'forbidden', details: 'You are not allowed to view this timetable' }, { status: 403 });
                  }
              }
          }
      }

      if (type === 'room') {
          // Room schedule is usually only for teachers/admins
          const isTeacher = await db.selectFrom('teachers')
              .select(['person_id'])
              .where('person_id', '=', user.person_id)
              .where('school_id', '=', user.school_id)
              .executeTakeFirst();
          
          if (!isTeacher && !user.is_principal) {
              return Response.json({ error: 'forbidden' }, { status: 403 });
          }

          const [timetableResult, substitutionResult] = await Promise.all([
              db.selectFrom('timetable')
                  .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
                  .leftJoin('groups', 'groups.group_id', 'timetable.group_id')
                  .leftJoin('school_years as groupYear', 'groupYear.sy_id', 'groups.year_id')
                  .leftJoin('classes', 'classes.class_id', 'groups.class_id')
                  .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                  .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
                  .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
                  .select([
                      'timetable.lesson_id',
                      'groups.group_id',
                      'persons.last_name',
                      'groups.name as group_name',
                      'groups.num as group_num',
                      sql`(timetable.day + 1) % 7`.as('day'),
                      'timetable.hour',
                      'timetable.type',
                      'timetable.teacher_id',
                      'subjects.subject_id',
                      sql`subjects.label`.as('subject_name'),
                      sql`subjects.shortcut`.as('subject_shortcut'),
                      sql`building_rooms.name`.as('room'),
                      sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
                  ])
                  .where('timetable.room_id', '=', targetId)
                  .where('groupYear.current', '=', true)
                  .execute(),

              db.selectFrom('substitution')
                  .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
                  .leftJoin('groups', 'groups.group_id', 'substitution.group_id')
                  .leftJoin('classes', 'classes.class_id', 'groups.class_id')
                  .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                  .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
                  .select([
                      'groups.group_id',
                      'groups.name as group_name',
                      'groups.num as group_num',
                      'substitution.start_date',
                      'substitution.start_hour',
                      'substitution.end_date',
                      'substitution.end_hour',
                      'substitution.type',
                      'substitution.teacher_id',
                      sql`building_rooms.name`.as('room'),
                      sql`subjects.label`.as('subject_name'),
                      sql`subjects.shortcut`.as('subject_shortcut'),
                      sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
                  ])
                  .where('substitution.room_id', '=', targetId)
                  .where('substitution.start_date', '<=', time.clone().endOf('isoWeek').toDate())
                  .where('substitution.end_date', '>=', time.clone().startOf('isoWeek').toDate())
                  .execute()
          ]);

          const teacherIds = [
              ...timetableResult.map(t => t.teacher_id).filter((id): id is number => id !== null),
              ...substitutionResult.map(s => s.teacher_id).filter((id): id is number => id !== null)
          ];
          const teacherNameMap = await format_person_map_by_ids(teacherIds);

          const timetable = timetableResult.map(t => ({
              ...t,
              teacher: t.teacher_id ? teacherNameMap.get(t.teacher_id) : ''
          }));

          const substitution = substitutionResult.map(s => ({
              ...s,
              teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : ''
          }));

          return Response.json({ timetable, substitution });
      }

      const targetRoles = await db.selectFrom('users')
         .leftJoin('students', 'students.person_id', 'users.person_id')
         .leftJoin('teachers', 'teachers.person_id', 'users.person_id')
         .select([
             'students.person_id as student',
             'teachers.person_id as teacher'
         ])
         .where('users.person_id', '=', targetId)
         .executeTakeFirst();
      

      if (targetRoles?.student) {
          const groups = await db.selectFrom('student_groups')
              .innerJoin('groups', 'student_groups.group_id', 'groups.group_id')
              .innerJoin('school_years as sy', 'groups.year_id', 'sy.sy_id')
              .select([
                  'groups.group_id',
                  'groups.name',
                  'groups.num',
              ])
              .where('student_groups.student_id', '=', targetId)
              .where('sy.start', '<=', time.toDate())
              .where('sy.end', '>=', time.toDate())
              .execute()
          
          let groupNumbers: number[] = [];
          groups.forEach((group) => {
              groupNumbers.push(group.group_id)
          });
          if (!groupNumbers.length) {
              groupNumbers = [-1];
          }

          const [timetableResult, substitutionResult, absences] = await Promise.all([
              db.selectFrom('timetable')
                  .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
                  .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
                  .leftJoin('groups', 'groups.group_id', 'timetable.group_id')
                  .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
                  .leftJoin('classes', 'classes.class_id', 'groups.class_id')
                  .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                  .select([
                      'timetable.lesson_id',
                      'groups.group_id',
                      'groups.name as group_name',
                      'groups.num as group_num',
                      sql`(timetable.day + 1) % 7`.as('day'),
                      'timetable.hour',
                      'timetable.type',
                      'persons.last_name',
                      sql`building_rooms.name`.as('room'),
                      'subjects.subject_id',
                      sql`subjects.label`.as('subject_name'),
                      sql`subjects.shortcut`.as('subject_shortcut'),
                      'timetable.teacher_id as teacher_id',
                      sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
                  ])
                  .where('timetable.group_id', 'in', groupNumbers)
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
                .leftJoin('persons',  'substitution.teacher_id', 'persons.person_id')
                .leftJoin('events', 'substitution.event_id', 'events.event_id')
                .leftJoin('groups', 'groups.group_id', 'substitution.group_id')
                .leftJoin('classes', 'classes.class_id', 'groups.class_id')
                .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
                .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                .select([
                  'groups.group_id',
                  'groups.name as group_name',
                  'groups.num as group_num',
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'substitution.type',
                  'persons.last_name',
                  'events.event_name',
                  'events.event_description',
                  'building_rooms.name as room',
                  sql`subjects.label`.as('subject_name'),
                  sql`subjects.shortcut`.as('subject_shortcut'),
                  'substitution.teacher_id',
                  sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('substitution.group_id', 'in', groupNumbers),
                      eb('substitution.group_id', 'is', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').toDate()),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').toDate())
                  ])
                )
                .execute(),

              db.selectFrom('absence')
                .innerJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
                .select([
                  'classbook.date',
                  'classbook.day_hour as hour',
                  'absence.type'
                ])
                .where('absence.student_id', '=', targetId)
                // Use the same date logic as substitutions
                .where('classbook.date', '>=', time.clone().startOf('isoWeek').format('YYYY-MM-DD')) 
                .where('classbook.date', '<=', time.clone().endOf('isoWeek').format('YYYY-MM-DD'))
                .execute()
          ])

          const teacherIds = [
            ...timetableResult.map(t => t.teacher_id).filter((id): id is number => id !== null),
            ...substitutionResult.map(s => s.teacher_id).filter((id): id is number => id !== null)
          ];
          const teacherNameMap = await format_person_map_by_ids(teacherIds);

          const timetable = timetableResult.map(t => ({
            ...t,
            teacher: t.teacher_id ? teacherNameMap.get(t.teacher_id) : ''
          }));

          const substitution = substitutionResult.map(s => ({
            ...s,
            teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : ''
          }));

          return Response.json({timetable, substitution, absences});
      } else if (targetRoles?.teacher) {
        if (type == "person") {
          const [timetableResult, substitutionResult, workingModesResult] = await Promise.all([
              db.selectFrom('timetable')
                  .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
                  .leftJoin('groups', 'groups.group_id', 'timetable.group_id')
                  .leftJoin('persons', 'persons.person_id', 'timetable.teacher_id')
                  .leftJoin('classes', 'groups.class_id', 'classes.class_id')
                  .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
                  .leftJoin('school_years as syClass', 'syClass.sy_id', 'classes.year_id')
                  .leftJoin('school_years as syGroup', 'syGroup.sy_id', 'groups.year_id')
                  .select([
                    'timetable.lesson_id',
                    'groups.group_id',
                    'groups.name as group_name',
                    'groups.num as group_num',
                    sql`(timetable.day + 1) % 7`.as('day'),
                    'timetable.hour',
                    'timetable.type',
                    'timetable.group_id',
                    sql`building_rooms.name`.as('room'),
                    'subjects.subject_id',
                    'timetable.teacher_id as teacher_id',
                    sql`subjects.label`.as('subject_name'),
                    sql`subjects.shortcut`.as('subject_shortcut'),
                    sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, syClass.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
                  ])
                  .where((eb) =>
                    eb.and([
                      eb('timetable.teacher_id', '=', targetId),
                      eb('syGroup.start', '<=',  time.clone().toDate()),
                      eb('syGroup.end', '>=',    time.clone().toDate())
                    ])
                  )
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
                .leftJoin('groups', 'groups.group_id', 'substitution.group_id')
                .leftJoin('classes', 'groups.class_id', 'classes.class_id')
                .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                .leftJoin('persons',  'substitution.teacher_id', 'persons.person_id')
                .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
                .select([
                  'groups.group_id',
                  'groups.name as group_name',
                  'groups.num as group_num',
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'subjects.subject_id',
                  'substitution.teacher_id',
                  'building_rooms.name as room',
                  sql`subjects.label`.as('subject_name'),
                  sql`subjects.shortcut`.as('subject_shortcut'),
                  sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('substitution.teacher_id', '=', targetId),
                      eb('substitution.group_id', 'is', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').toDate()),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').toDate())
                  ])
                )
                .execute(),

              db.selectFrom('employee_vacation_requests')
                .select([
                  'start_date',
                  'end_date',
                  'type'
                ])
                .where('teacher_id', '=', targetId)
                .where('status', '=', 'approved')
                .where('start_date', '<=', time.clone().endOf('isoWeek').format('YYYY-MM-DD'))
                .where('end_date', '>=', time.clone().startOf('isoWeek').format('YYYY-MM-DD'))
                .execute()
          ])

          const teacherIds = [
            ...timetableResult.map(t => t.teacher_id).filter((id): id is number => id !== null),
            ...substitutionResult.map(s => s.teacher_id).filter((id): id is number => id !== null)
          ];
          const teacherNameMap = await format_person_map_by_ids(teacherIds);

          const timetable = timetableResult.map(t => ({
            ...t,
            teacher: t.teacher_id ? teacherNameMap.get(t.teacher_id) : ''
          }));

          const substitution = substitutionResult.map(s => ({
            ...s,
            teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : ''
          }));

          return Response.json({timetable, substitution, working_modes: workingModesResult});
        }
        else if (type == "class") {
          const [timetableResult, substitutionResult] = await Promise.all([
              db.selectFrom('timetable')
                  .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
                  .leftJoin('groups', 'groups.group_id', 'timetable.group_id')
                  .leftJoin('classes', 'classes.class_id', 'groups.class_id')
                  .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
                  .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                  .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
                  .select([
                    'timetable.lesson_id',
                    'groups.group_id',
                    'groups.name as group_name',
                    'groups.num as group_num',
                    sql`(timetable.day + 1) % 7`.as('day'),
                    'timetable.hour',
                    'timetable.type',
                    'persons.last_name',
                    sql`building_rooms.name`.as('room'),
                    'subjects.subject_id',
                    sql`subjects.label`.as('subject_name'),
                    sql`subjects.shortcut`.as('subject_shortcut'),
                    'timetable.teacher_id as teacher_id',
                    sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
                  ])
                  .where('groups.class_id', '=', targetId)
                  .where((eb) => eb.exists(
                      db.selectFrom('school_years as syGroup').select('syGroup.start')
                      .whereRef('syGroup.sy_id', '=', sql`groups.year_id`)
                      .where('syGroup.start', '<=', time.clone().toDate())
                      .where('syGroup.end', '>=', time.clone().toDate())
                   ))
                  .execute(),

              db.selectFrom('substitution')
                .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
                .leftJoin('groups', 'groups.group_id', 'substitution.group_id')
                .leftJoin('classes', 'classes.class_id', 'groups.class_id')
                .leftJoin('persons', 'substitution.teacher_id', 'persons.person_id')
                .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
                .select([
                  'groups.group_id',
                  'groups.name as group_name',
                  'groups.num as group_num',
                  'substitution.start_date',
                  'substitution.start_hour',
                  'substitution.end_date',
                  'substitution.end_hour',
                  'subjects.subject_id',
                  'persons.last_name',
                  'substitution.teacher_id',
                  'building_rooms.name as room',
                  sql`subjects.label`.as('subject_name'),
                  sql`subjects.shortcut`.as('subject_shortcut'),
                  sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
                ])
                .where((eb) =>
                  eb.and([
                    eb.or([
                      eb('groups.class_id', '=', targetId),
                      eb('substitution.group_id', '=', null)
                    ]),
                    eb('substitution.start_date', '<=', time.clone().endOf('isoWeek').toDate()),
                    eb('substitution.end_date', '>=', time.clone().startOf('isoWeek').toDate())
                  ])
                )
                .execute()
          ])

          const teacherIds = [
            ...timetableResult.map(t => t.teacher_id).filter((id): id is number => id !== null),
            ...substitutionResult.map(s => s.teacher_id).filter((id): id is number => id !== null)
          ];
          const teacherNameMap = await format_person_map_by_ids(teacherIds);

          const timetable = timetableResult.map(t => ({
            ...t,
            teacher: t.teacher_id ? teacherNameMap.get(t.teacher_id) : ''
          }));

          const substitution = substitutionResult.map(s => ({
            ...s,
            teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : ''
          }));

          return Response.json({timetable, substitution});
        } else if (type == "supervision") {
          const supervisionResult = await db.selectFrom('supervisions')
            .innerJoin('persons', 'persons.person_id', 'supervisions.teacher_id')
            .innerJoin('supervision_places', 'supervision_places.place_id', 'supervisions.place_id')
            .select([
              'supervisions.supervision_id',
              'supervisions.teacher_id',
              'supervision_places.name as room',
              sql`(supervisions.day + 1) % 7`.as('day'),
              'supervisions.hour',
              'supervisions.description as class_name',
              sql`'supervision'`.as('type'),
              sql`'Dozor'`.as('subject_name'),
              sql`'Dozor'`.as('subject_shortcut'),
            ])
            .where('supervisions.teacher_id', '=', targetId)
            .execute();

          const teacherIds = supervisionResult.map(s => s.teacher_id).filter((id): id is number => id !== null);
          const teacherNameMap = await format_person_map_by_ids(teacherIds);

          const timetable = supervisionResult.map(s => ({
            ...s,
            teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : ''
          }));

          return Response.json({ timetable, substitution: [] });
        }
      }
      
      // If no valid roles found or structure unsupported
      return Response.json({ timetable: [], substitution: [] });

    } catch (e) {
      console.error(e);
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
        default: 'person_id'
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
