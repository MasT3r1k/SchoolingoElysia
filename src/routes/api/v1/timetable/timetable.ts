import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const elysiaApp = new Elysia()
  .post('/timetable', async ({ body, cookie }: any) => {
    try {
      const user = await getAuthUser(cookie?.token?.value as string, cookie);
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
      const hasViewPerm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.TIMETABLE_VIEW);
      
      if (!hasViewPerm && user.person_id !== targetId && type !== 'room') {
        if (type == 'class') {
          const classDB = await db.selectFrom('classes')
          .select([
            'classes.teacher_id'
          ])
          .where('classes.class_id', '=', targetId)
          .executeTakeFirst();
          if (classDB && classDB?.teacher_id !== user.person_id) {
            return Response.json({ error: 'forbidden', details: 'You are not allowed to view this timetable' }, { status: 403 });
          } 
        } else {
          // Check if parent of the student
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
      
      // Additional check for room: only teachers/admins can view room timetable if they don't have global view
      if (type === 'room' && !hasViewPerm) {
          const isTeacher = await db.selectFrom('teachers')
            .select(['person_id'])
            .where('person_id', '=', user.person_id)
            .executeTakeFirst();
          if (!isTeacher) return Response.json({ error: 'forbidden' }, { status: 403 });
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
          ...timetableRes.map(t => t.teacher2_id),
          ...substitutionRes.map(s => s.teacher_id),
          ...substitutionRes.map(s => s.teacher2_id)
        ].filter((id): id is number => id !== null && id !== undefined);
        
        const teacherNameMap = await format_person_map_by_ids(teacherIds);
        
        const uniqueTeacherIds = [...new Set(teacherIds)];
        const lastNameMap = new Map<number, string>();
        if (uniqueTeacherIds.length > 0) {
          const persons = await db.selectFrom('persons')
            .select(['person_id', 'last_name'])
            .where('person_id', 'in', uniqueTeacherIds)
            .execute();
          persons.forEach(p => lastNameMap.set(p.person_id, p.last_name));
        }
        
        return {
          timetable: timetableRes.map(t => { 
            let teacherStr = t.teacher_id ? teacherNameMap.get(t.teacher_id) : '';
            let lastNameStr = t.teacher_id ? lastNameMap.get(t.teacher_id) : '';
            if (t.teacher2_id) {
               const t2Name = teacherNameMap.get(t.teacher2_id);
               if (t2Name) teacherStr += (teacherStr ? ' / ' : '') + t2Name;
               const t2LastName = lastNameMap.get(t.teacher2_id);
               if (t2LastName) lastNameStr += (lastNameStr ? ' / ' : '') + t2LastName;
            }
            return {
              ...t, 
              teacher: teacherStr, 
              last_name: t.last_name !== undefined ? lastNameStr : undefined,
              lock_room: !!t.lock_room 
            }
          }),
          substitution: substitutionRes.map(s => {
            let teacherStr = s.teacher_id ? teacherNameMap.get(s.teacher_id) : '';
            let lastNameStr = s.teacher_id ? lastNameMap.get(s.teacher_id) : '';
            if (s.teacher2_id) {
               const t2Name = teacherNameMap.get(s.teacher2_id);
               if (t2Name) teacherStr += (teacherStr ? ' / ' : '') + t2Name;
               const t2LastName = lastNameMap.get(s.teacher2_id);
               if (t2LastName) lastNameStr += (lastNameStr ? ' / ' : '') + t2LastName;
            }
            return {
               ...s, 
               teacher: teacherStr,
               last_name: s.last_name !== undefined ? lastNameStr : undefined
            }
          })
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
            .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
            .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
            .select([
              'timetable.lesson_id', 'groups.group_id', 'persons.last_name', 'groups.name as group_name', 'groups.num as group_num',
              sql`(timetable.day + 1) % 7`.as('day'), 'timetable.hour', 'timetable.type', 'timetable.teacher_id', 'timetable.teacher2_id',
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
              'substitution.end_date', 'substitution.end_hour', 'substitution.type', 'substitution.teacher_id', 'substitution.teacher2_id',
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

      if (type === 'class') {
        const [timetableResult, substitutionResult] = await Promise.all([
          db.selectFrom('timetable')
            .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
            .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
            .leftJoin('classes', 'classes.class_id', 'groups.class_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
            .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
            .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
            .select([
              'timetable.lesson_id', 'groups.group_id', 'groups.name as group_name', 'groups.num as group_num',
              sql`(timetable.day + 1) % 7`.as('day'), 'timetable.hour', 'timetable.type', 'persons.last_name',
              'building_rooms.name as room', 'subjects.subject_id', sql`subjects.label`.as('subject_name'),
              sql`subjects.shortcut`.as('subject_shortcut'), 'timetable.teacher_id', 'timetable.teacher2_id',
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
            .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'substitution.room_id')
            .select([
              'groups.group_id', 'groups.name as group_name', 'groups.num as group_num', 'substitution.start_date', 'substitution.start_hour',
              'substitution.end_date', 'substitution.end_hour', 'subjects.subject_id', 'persons.last_name', 'substitution.teacher_id', 'substitution.teacher2_id',
              'building_rooms.name as room', sql`subjects.label`.as('subject_name'), sql`subjects.shortcut`.as('subject_shortcut'),
              sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
            ])
            .where('groups.class_id', '=', targetId)
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

        const [timetableResult, substitutionResult, absences, exemptions] = await Promise.all([
          db.selectFrom('timetable')
            .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
            .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
            .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
            .leftJoin('classes', 'classes.class_id', 'groups.class_id')
            .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
            .select([
              'timetable.lesson_id', 'groups.group_id', 'groups.name as group_name', 'groups.num as group_num',
              sql`(timetable.day + 1) % 7`.as('day'), 'timetable.hour', 'timetable.type', 'persons.last_name',
              'building_rooms.name as room', 'subjects.subject_id', sql`subjects.label`.as('subject_name'),
              sql`subjects.shortcut`.as('subject_shortcut'), 'timetable.teacher_id', 'timetable.teacher2_id',
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
            .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
            .select([
              'groups.group_id', 'groups.name as group_name', 'groups.num as group_num', 'substitution.start_date', 'substitution.start_hour',
              'substitution.end_date', 'substitution.end_hour', 'substitution.type', 'persons.last_name', 'events.event_name',
              'events.event_description', 'building_rooms.name as room', sql`subjects.label`.as('subject_name'),
              sql`subjects.shortcut`.as('subject_shortcut'), 'substitution.teacher_id', 'substitution.teacher2_id',
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
            .execute(),

          db.selectFrom('student_subject_exemptions')
            .select(['subject_id', 'valid_from', 'valid_to', 'note'])
            .where('student_id', '=', targetId)
            .where((eb) => eb.and([
                eb.or([eb('valid_to', 'is', null), eb('valid_to', '>=', time.startOf('isoWeek').format('YYYY-MM-DD'))]),
                eb('valid_from', '<=', time.endOf('isoWeek').format('YYYY-MM-DD'))
            ]))
            .execute()
        ]);

        const processed = await processResults(timetableResult, substitutionResult);
        return Response.json({ ...processed, absences, exemptions });

      } else if (targetRoles?.is_teacher) {
        
        if (type === "person") {
          const [timetableResult, substitutionResult, workingModesResult] = await Promise.all([
            db.selectFrom('timetable')
              .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
              .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
              .leftJoin('classes', 'groups.class_id', 'classes.class_id')
              .leftJoin('building_rooms', 'building_rooms.room_id', 'timetable.room_id')
              .leftJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
              .select([
                'timetable.lesson_id', 'groups.group_id', 'groups.name as group_name', 'groups.num as group_num',
                sql`(timetable.day + 1) % 7`.as('day'), 'timetable.hour', 'timetable.type',
                'building_rooms.name as room', 'subjects.subject_id', 'timetable.teacher_id', 'timetable.teacher2_id',
                sql`subjects.label`.as('subject_name'), sql`subjects.shortcut`.as('subject_shortcut'),
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
                lockRoomSql
              ])
              .where((eb) => eb.or([
                eb('timetable.teacher_id', '=', targetId),
                eb('timetable.teacher2_id', '=', targetId)
              ]))
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
                'substitution.end_date', 'substitution.end_hour', 'subjects.subject_id', 'substitution.teacher_id', 'substitution.teacher2_id',
                'building_rooms.name as room', sql`subjects.label`.as('subject_name'), sql`subjects.shortcut`.as('subject_shortcut'),
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
              ])
              .where((eb) => eb.and([
                eb.or([eb('substitution.teacher_id', '=', targetId), eb('substitution.teacher2_id', '=', targetId), eb('substitution.group_id', 'is', null)]),
                eb('substitution.start_date', '<=', time.endOf('isoWeek').toDate()),
                eb('substitution.end_date', '>=', time.startOf('isoWeek').toDate())
              ]))
              .execute(),

            db.selectFrom('employee_vacation_requests').select(['start_date', 'end_date', 'type'])
              .where('teacher_id', '=', targetId).where('status', '=', 'approved')
              .where('start_date', '<=', time.endOf('isoWeek').format('YYYY-MM-DD'))
              .where('end_date', '>=', time.startOf('isoWeek').format('YYYY-MM-DD')).execute(),
          ]);

          const classbooksResult = await db.selectFrom('classbook')
              .select(['date', 'day_hour', 'group_id', 'subject_id', 'topic'])
              .where('date', '>=', time.startOf('isoWeek').format('YYYY-MM-DD'))
              .where('date', '<=', time.endOf('isoWeek').format('YYYY-MM-DD'))
              .where((eb) => eb.or([
                eb('teacher_id', '=', targetId),
                eb('group_id', 'in', timetableResult.length ? timetableResult.map((t: any) => t.group_id) : [-1])
              ]))
              .execute();

          const processed = await processResults(timetableResult, substitutionResult);
          return Response.json({ ...processed, working_modes: workingModesResult, classbooks: classbooksResult });

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