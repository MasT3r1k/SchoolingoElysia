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

      const { type, id: targetId } = body;
      const time = moment(body.time);
      const dateStr = time.toDate();

      // 1. Získání ID školního roku pro daný termín (Základní kotva konzistence)
      const currentYear = await db.selectFrom('school_years')
        .select('sy_id')
        .where('start', '<=', dateStr)
        .where('end', '>=', dateStr)
        .executeTakeFirst();

      if (!currentYear) {
        return Response.json({ timetable: [], substitution: [], message: 'Školní rok nenalezen' });
      }

      const sy_id = currentYear.sy_id;

      // --- Kontrola oprávnění ---
      if (user.person_id !== targetId && type !== 'room') {
        const isPrincipal = user.is_principal;
        if (!isPrincipal) {
          const isTeacher = await db.selectFrom('teachers')
            .select(['person_id'])
            .where('person_id', '=', user.person_id)
            .executeTakeFirst();
          
          if (!isTeacher) {
            const isParent = await db.selectFrom('family_relations')
              .select(['source_id'])
              .where('source_id', '=', targetId)
              .where('target_id', '=', user.person_id)
              .executeTakeFirst();
            
            if (!isParent) {
              return Response.json({ error: 'forbidden', details: 'You are not allowed to view this timetable' }, { status: 403 });
            }
          }
        }
      }

      // SQL fragment pro lock_room - bere v potaz pouze výuku ve stejném školním roce
      const lockRoomSql = sql`CASE 
        WHEN timetable.hour = (
          SELECT MAX(t2.hour) 
          FROM timetable t2 
          INNER JOIN groups g2 ON g2.group_id = t2.group_id
          WHERE t2.room_id = timetable.room_id 
          AND t2.day = timetable.day
          AND g2.year_id = ${sy_id}
        ) THEN true ELSE false 
      END`.as('lock_room');

      // --- SPOLEČNÉ FORMÁTOVÁNÍ VÝSLEDKŮ ---
      const processResults = async (timetableRes: any[], substitutionRes: any[]) => {
        const teacherIds = [
          ...timetableRes.map(t => t.teacher_id), 
          ...substitutionRes.map(s => s.teacher_id)
        ].filter((id): id is number => id !== null);
        
        const teacherNameMap = await format_person_map_by_ids(teacherIds);
        
        return {
          timetable: timetableRes.map(t => ({ 
            ...t, 
            teacher: t.teacher_id ? teacherNameMap.get(t.teacher_id) : '', 
            lock_room: !!t.lock_room 
          })),
          substitution: substitutionRes.map(s => ({ 
            ...s, 
            teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : '' 
          }))
        };
      };

      // --- ROZCESTNÍK TYPŮ ---

      if (type === 'room') {
        // Kontrola pro místnost (pouze učitel/ředitel)
        if (!user.is_principal) {
           const isTeacher = await db.selectFrom('teachers')
            .where('person_id', '=', user.person_id)
            .executeTakeFirst();
           if(!isTeacher) return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const [timetableResult, substitutionResult] = await Promise.all([
          db.selectFrom('timetable')
            .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
            .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
            .leftJoin('classes', 'classes.class_id', 'groups.class_id')
            .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
            .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
            .select([
              'timetable.lesson_id', 'groups.group_id', 'persons.last_name', 'groups.name as group_name', 'groups.num as group_num',
              sql`(timetable.day + 1) % 7`.as('day'), 'timetable.hour', 'timetable.type', 'timetable.teacher_id',
              'subjects.subject_id', sql`subjects.label`.as('subject_name'), sql`subjects.shortcut`.as('subject_shortcut'),
              sql`building_rooms.name`.as('room'),
              sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
              lockRoomSql
            ])
            .where('timetable.room_id', '=', targetId)
            .where('groups.year_id', '=', sy_id)
            .execute(),

          db.selectFrom('substitution')
            .innerJoin('groups', 'groups.group_id', 'substitution.group_id')
            .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
            .leftJoin('classes', 'classes.class_id', 'groups.class_id')
            .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
            .select([
              'groups.group_id', 'groups.name as group_name', 'groups.num as group_num', 'substitution.start_date', 'substitution.start_hour',
              'substitution.end_date', 'substitution.end_hour', 'substitution.type', 'substitution.teacher_id',
              'building_rooms.name as room', sql`subjects.label`.as('subject_name'), sql`subjects.shortcut`.as('subject_shortcut'),
              sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
            ])
            .where('substitution.room_id', '=', targetId)
            .where('groups.year_id', '=', sy_id)
            .where('substitution.start_date', '<=', time.endOf('isoWeek').toDate())
            .where('substitution.end_date', '>=', time.startOf('isoWeek').toDate())
            .execute()
        ]);

        return Response.json(await processResults(timetableResult, substitutionResult));
      }

      // Zjištění rolí cílové osoby
      const targetRoles = await db.selectFrom('users')
        .leftJoin('students', 'students.person_id', 'users.person_id')
        .leftJoin('teachers', 'teachers.person_id', 'users.person_id')
        .select(['students.person_id as is_student', 'teachers.person_id as is_teacher'])
        .where('users.person_id', '=', targetId)
        .executeTakeFirst();

      if (targetRoles?.is_student) {
        const groups = await db.selectFrom('student_groups')
          .innerJoin('groups', 'student_groups.group_id', 'groups.group_id')
          .select(['groups.group_id'])
          .where('student_groups.student_id', '=', targetId)
          .where('groups.year_id', '=', sy_id)
          .execute();
        
        let groupNumbers = groups.length ? groups.map(g => g.group_id) : [-1];

        const [timetableResult, substitutionResult, absences] = await Promise.all([
          db.selectFrom('timetable')
            .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
            .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
            .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
            .leftJoin('classes', 'classes.class_id', 'groups.class_id')
            .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')
            .select([
              'timetable.lesson_id', 'groups.group_id', 'groups.name as group_name', 'groups.num as group_num',
              sql`(timetable.day + 1) % 7`.as('day'), 'timetable.hour', 'timetable.type', 'persons.last_name',
              'building_rooms.name as room', 'subjects.subject_id', sql`subjects.label`.as('subject_name'),
              sql`subjects.shortcut`.as('subject_shortcut'), 'timetable.teacher_id',
              sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
              lockRoomSql
            ])
            .where('timetable.group_id', 'in', groupNumbers)
            .execute(),

          db.selectFrom('substitution')
            .innerJoin('groups', 'groups.group_id', 'substitution.group_id')
            .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
            .leftJoin('persons', 'substitution.teacher_id', 'persons.person_id')
            .leftJoin('events', 'substitution.event_id', 'events.event_id')
            .leftJoin('classes', 'classes.class_id', 'groups.class_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
            .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')
            .select([
              'groups.group_id', 'groups.name as group_name', 'groups.num as group_num', 'substitution.start_date', 'substitution.start_hour',
              'substitution.end_date', 'substitution.end_hour', 'substitution.type', 'persons.last_name', 'events.event_name',
              'events.event_description', 'building_rooms.name as room', sql`subjects.label`.as('subject_name'),
              sql`subjects.shortcut`.as('subject_shortcut'), 'substitution.teacher_id',
              sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
            ])
            .where('substitution.group_id', 'in', groupNumbers)
            .where('substitution.start_date', '<=', time.endOf('isoWeek').toDate())
            .where('substitution.end_date', '>=', time.startOf('isoWeek').toDate())
            .execute(),

          db.selectFrom('absence')
            .innerJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
            .select(['classbook.date', 'classbook.day_hour as hour', 'absence.type'])
            .where('absence.student_id', '=', targetId)
            .where('classbook.date', '>=', time.startOf('isoWeek').format('YYYY-MM-DD')) 
            .where('classbook.date', '<=', time.endOf('isoWeek').format('YYYY-MM-DD'))
            .execute()
        ]);

        const processed = await processResults(timetableResult, substitutionResult);
        return Response.json({ ...processed, absences });

      } else if (targetRoles?.is_teacher) {
        
        if (type === "person") {
          const [timetableResult, substitutionResult, workingModesResult] = await Promise.all([
            db.selectFrom('timetable')
              .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
              .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
              .leftJoin('classes', 'groups.class_id', 'classes.class_id')
              .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
              .leftJoin('school_years as sy', 'sy.sy_id', 'groups.year_id')
              .select([
                'timetable.lesson_id', 'groups.group_id', 'groups.name as group_name', 'groups.num as group_num',
                sql`(timetable.day + 1) % 7`.as('day'), 'timetable.hour', 'timetable.type',
                'building_rooms.name as room', 'subjects.subject_id', 'timetable.teacher_id',
                sql`subjects.label`.as('subject_name'), sql`subjects.shortcut`.as('subject_shortcut'),
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
                lockRoomSql
              ])
              .where('timetable.teacher_id', '=', targetId)
              .where('groups.year_id', '=', sy_id)
              .execute(),

            db.selectFrom('substitution')
              .leftJoin('groups', 'groups.group_id', 'substitution.group_id')
              .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
              .leftJoin('classes', 'groups.class_id', 'classes.class_id')
              .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
              .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
              .select([
                'groups.group_id', 'groups.name as group_name', 'groups.num as group_num', 'substitution.start_date', 'substitution.start_hour',
                'substitution.end_date', 'substitution.end_hour', 'subjects.subject_id', 'substitution.teacher_id',
                'building_rooms.name as room', sql`subjects.label`.as('subject_name'), sql`subjects.shortcut`.as('subject_shortcut'),
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
              ])
              .where((eb) => eb.and([
                eb.or([eb('substitution.teacher_id', '=', targetId), eb('substitution.group_id', 'is', null)]),
                eb('substitution.start_date', '<=', time.endOf('isoWeek').toDate()),
                eb('substitution.end_date', '>=', time.startOf('isoWeek').toDate())
              ]))
              .execute(),

            db.selectFrom('employee_vacation_requests').select(['start_date', 'end_date', 'type'])
              .where('teacher_id', '=', targetId).where('status', '=', 'approved')
              .where('start_date', '<=', time.endOf('isoWeek').format('YYYY-MM-DD'))
              .where('end_date', '>=', time.startOf('isoWeek').format('YYYY-MM-DD')).execute()
          ]);

          const processed = await processResults(timetableResult, substitutionResult);
          return Response.json({ ...processed, working_modes: workingModesResult });

        } else if (type === "class") {
          const [timetableResult, substitutionResult] = await Promise.all([
            db.selectFrom('timetable')
              .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
              .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
              .leftJoin('classes', 'classes.class_id', 'groups.class_id')
              .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
              .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')
              .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
              .select([
                'timetable.lesson_id', 'groups.group_id', 'groups.name as group_name', 'groups.num as group_num',
                sql`(timetable.day + 1) % 7`.as('day'), 'timetable.hour', 'timetable.type', 'persons.last_name',
                'building_rooms.name as room', 'subjects.subject_id', sql`subjects.label`.as('subject_name'),
                sql`subjects.shortcut`.as('subject_shortcut'), 'timetable.teacher_id',
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
                lockRoomSql
              ])
              .where('groups.class_id', '=', targetId)
              .where('groups.year_id', '=', sy_id)
              .execute(),

            db.selectFrom('substitution')
              .innerJoin('groups', 'groups.group_id', 'substitution.group_id')
              .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
              .leftJoin('classes', 'classes.class_id', 'groups.class_id')
              .leftJoin('persons', 'substitution.teacher_id', 'persons.person_id')
              .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')
              .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
              .select([
                'groups.group_id', 'groups.name as group_name', 'groups.num as group_num', 'substitution.start_date', 'substitution.start_hour',
                'substitution.end_date', 'substitution.end_hour', 'subjects.subject_id', 'persons.last_name', 'substitution.teacher_id',
                'building_rooms.name as room', sql`subjects.label`.as('subject_name'), sql`subjects.shortcut`.as('subject_shortcut'),
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
              ])
              .where('groups.class_id', '=', targetId)
              .where('substitution.start_date', '<=', time.endOf('isoWeek').toDate())
              .where('substitution.end_date', '>=', time.startOf('isoWeek').toDate())
              .execute()
          ]);

          return Response.json(await processResults(timetableResult, substitutionResult));

        } else if (type === "supervision") {
          const supervisionResult = await db.selectFrom('supervisions')
            .innerJoin('supervision_places', 'supervision_places.place_id', 'supervisions.place_id')
            .select([
              'supervisions.supervision_id', 'supervisions.teacher_id', 'supervision_places.name as room',
              sql`(supervisions.day + 1) % 7`.as('day'), 'supervisions.hour', 'supervisions.description as class_name',
              sql`'supervision'`.as('type'), sql`'Dozor'`.as('subject_name'), sql`'Dozor'`.as('subject_shortcut'),
            ])
            .where('supervisions.teacher_id', '=', targetId)
            .execute();

          const teacherIds = supervisionResult.map(s => s.teacher_id).filter((id): id is number => id !== null);
          const teacherNameMap = await format_person_map_by_ids(teacherIds);

          const timetable = supervisionResult.map(s => ({ ...s, teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : '', lock_room: false }));
          return Response.json({ timetable, substitution: [] });
        }
      }
      
      return Response.json({ timetable: [], substitution: [] });

    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: "Internal error", e }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }, {
    body: t.Object({
      type: t.String(),
      id: t.Number({ minimum: 1 }),
      time: t.Date()
    })
  });

export default elysiaApp;