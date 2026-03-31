import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { get_classbook_lesson_number } from '../../../../functions/get_classbook_lesson_number';
import { get_total_lessons } from '../../../../functions/get_total_lessons';

import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const elysiaApp = new Elysia()
  .get('/classbook/lesson', async ({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.CLASSBOOK_VIEW);
    if (!perm) return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { date, hour, groupId } = query;
    if (date == undefined || hour == undefined || groupId == undefined) return { error: 'bad_query' };
    const dateMoment = moment(date);

    // === NAČÍST PŘEDMĚT ===
    const subject = await db.selectFrom('timetable')
    .select([
      'timetable.subject_id',
      'timetable.teacher_id'
    ])
    .where('timetable.day', '=', dateMoment.isoWeekday() - 1)
    .where('timetable.hour', '=', hour + 1)
    .where('timetable.group_id', '=', groupId)
    .executeTakeFirst();

    if (!subject) {
      return { error: 'invalid_subject' };
    }

    const { subject_id: subjectId, teacher_id } = subject;

    // === NAČTENÍ NEBO VYTVOŘENÍ ZÁPISU ===
    const isExistClassbook = await db.selectFrom('classbook')
      .leftJoin('subjects', 'subjects.subject_id', 'classbook.subject_id')
      .select([
        'classbook.classbook_id as classbook_id'
      ])
      .where('classbook.date', '=', dateMoment.format('YYYY-MM-DD'))
      .where('classbook.day_hour', '=', hour)
      .where('classbook.group_id', '=', groupId)
      .executeTakeFirst();

    if (!isExistClassbook) {
      await db.insertInto('classbook')
      .values({
        date: dateMoment.format('YYYY-MM-DD'),
        day_hour: hour,
        group_id: groupId,
        subject_id: subjectId,
        teacher_id: teacher_id
      })
      .execute();
    } else {
      await db.updateTable('classbook')
        .set({ teacher_id: teacher_id })
        .where('classbook_id', '=', isExistClassbook.classbook_id)
        .where('teacher_id', 'is', null)
        .execute();
    }

    const classbook = await db.selectFrom('classbook')
      .leftJoin('subjects', 'subjects.subject_id', 'classbook.subject_id')
      .leftJoin('groups', 'groups.group_id', 'classbook.group_id')
      .leftJoin('classes', 'groups.class_id', 'classes.class_id')
      .leftJoin('school_years as syClass', 'syClass.sy_id', 'classes.year_id')

      .select([
        'classbook.classbook_id',
        'classbook.date',
        'classbook.day_hour',
        'classbook.group_id',
        'classbook.internal_note',
        'classbook.note',
        'classbook.topic',
        'subjects.subject_id',
        'subjects.label as subject_name',
        'classbook.room_id',
        sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, syClass.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
      ])
      .where('classbook.date', '=', dateMoment.format('YYYY-MM-DD'))
      .where('classbook.day_hour', '=', hour)
      .where('classbook.group_id', '=', groupId)
      .executeTakeFirst();

    if (!classbook) return { error: 'invalid_classbook' };

    // === Získání seznamu studentů ===
    const studentsDB = await db.selectFrom('student_groups')
      .leftJoin('persons', 'persons.person_id', 'student_groups.student_id')
      .select([
        'student_groups.student_id',
        'persons.first_name',
        'persons.last_name'
      ])
      .where('student_groups.group_id', '=', groupId)
      .execute();

    const studentAbsence = await db.selectFrom('absence')
    .leftJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
    .select([
      'absence.student_id',
      'classbook.day_hour',
      'absence.type',
      'absence.minutes',
      'absence.reason',
      'absence.note'
    ])
    .where('classbook.date', '=', classbook.date)
    .where('absence.student_id', 'in', studentsDB.map((student) => student.student_id))
    .execute();

    const studentExemptions = await db.selectFrom('student_subject_exemptions')
      .select(['student_id', 'note'])
      .where('student_id', 'in', studentsDB.map((s) => s.student_id))
      .where('subject_id', '=', subjectId)
      .where((eb) => eb.and([
          eb.or([eb('valid_to', 'is', null), eb('valid_to', '>=', classbook.date as Date)]),
          eb('valid_from', '<=', classbook.date as Date)
      ]))
      .execute();

    const studentTotalAbsence = await db
      .selectFrom('absence')
      .leftJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
      .select([
        'absence.student_id',
        db.fn.count('classbook.day_hour').as('total_hours')
      ])
      .where('classbook.group_id', '=', classbook.group_id)
      .where('classbook.subject_id', '=', classbook.subject_id)
      .where('absence.student_id', 'in', studentsDB.map((student) => student.student_id))
      .groupBy('absence.student_id')
      .execute();

    const studentFullNames = await format_person_map_by_ids(studentsDB.map((s) => s.student_id));

    const students = studentsDB
    .map((student, index) => {
      const absForStudent = studentAbsence.filter(a => a.student_id === student.student_id);

      // Převést na array s indexem dle dayHour
      const absenceIndexed: any[] = [];

      absForStudent.forEach((abs: any) => {
        absenceIndexed[abs.day_hour] = abs;  // index = denní hodina
      });

      return {
        student_id: student.student_id,
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        full_name: studentFullNames.get(student.student_id) || '',
        total_absence: studentTotalAbsence.find(s => s.student_id == student.student_id)?.total_hours || 0,
        absence: absenceIndexed,
        exemption: studentExemptions.find(e => e.student_id === student.student_id) || null
      };
    })
    .sort((a, b) => {
      const ln = a.last_name.localeCompare(b.last_name, 'cs');
      if (ln !== 0) return ln;
      return a.first_name.localeCompare(b.first_name, 'cs');
    });

    // === Získání školního roku ===
    const school_year = await db.selectFrom('school_years')
    .select([
      'school_years.start',
      'school_years.midterm',
      'school_years.end'
    ])
    .where('start', '<=', classbook.date as Date)
    .where('end', '>=', classbook.date as Date)
    .executeTakeFirst();

    if (!school_year) return { error: 'invalid_year' };

    // === Automatický výpočet čísla hodiny ===
    const lessonNumber = await get_classbook_lesson_number((classbook as any).classbook_id);
    let lessonTotal = 0;
    if (moment(classbook.date).isSameOrBefore(school_year.midterm)) {
      lessonTotal = await get_total_lessons(moment(school_year.start), moment(school_year.midterm), classbook.group_id, classbook.subject_id!);
    } else {
      lessonTotal = await get_total_lessons(moment(school_year.midterm), moment(school_year.end), classbook.group_id, classbook.subject_id!);
    }

    // === Služba třídy ===
    const class_serviceDB = await db.selectFrom('class_service')
    .leftJoin('student_groups', 'student_groups.student_id', 'class_service.student_id')
    .select([
      'class_service.student_id'
    ])
    .where('class_service.start', '<=', dateMoment.format('YYYY-MM-DD'))
    .where('class_service.end', '>=', dateMoment.format('YYYY-MM-DD'))
    .where('student_groups.group_id', '=', groupId)
    .execute();

    console.log(class_serviceDB)

    const classService = await format_person_map_by_ids(class_serviceDB.map((student) => (student.student_id)));

    // === VÝPOČET MAXIMÁLNÍHO POČTU HODIN TŘÍDY ===
    const classIdQuery = await db.selectFrom('groups').select('class_id').where('group_id', '=', groupId).executeTakeFirst();
    let classMaxHours = 0;
    if (classIdQuery && classIdQuery.class_id) {
       const classMaxHoursQuery = await db.selectFrom('timetable')
         .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
         .select(['timetable.hour'])
         .where('groups.class_id', '=', classIdQuery.class_id)
         .where('timetable.day', '=', dateMoment.isoWeekday() - 1)
         .where((eb) => eb.or([
            eb('timetable.type', '=', 0),
            eb('timetable.type', '=', dateMoment.isoWeek() % 2 === 0 ? 2 : 1)
         ]))
         .orderBy('timetable.hour', 'desc')
         .executeTakeFirst();

       const substitutionMaxHoursQuery = await db.selectFrom('substitution')
         .innerJoin('groups', 'groups.group_id', 'substitution.group_id')
         .select(['substitution.end_hour'])
         .where('groups.class_id', '=', classIdQuery.class_id)
         .where('substitution.start_date', '<=', dateMoment.toDate())
         .where('substitution.end_date', '>=', dateMoment.toDate())
         .orderBy('substitution.end_hour', 'desc')
         .executeTakeFirst();
         
       classMaxHours = Math.max(
         classMaxHoursQuery?.hour || 0,
         substitutionMaxHoursQuery?.end_hour || 0
       );
    }

    // === VÝPOČET MINULÉ HODINY ===
    const allTimetable = await db.selectFrom('timetable')
         .select(['day', 'hour', 'type', 'subject_id'])
         .where('group_id', '=', classbook.group_id)
         .execute();

    const allSubstitutions = await db.selectFrom('substitution')
         .select(['start_date', 'start_hour', 'end_date', 'end_hour', 'subject_id', 'type'])
         .where('group_id', '=', classbook.group_id)
         .where('start_date', '<=', dateMoment.toDate())
         .where('start_date', '>=', school_year.start as Date)
         .execute();

    let prevLessonDateStr: string | null = null;
    let prevLessonHour: number | null = null;
    
    let checkDay = dateMoment.clone();
    let currentCheckHour = hour; // this matches timetable hour for the lesson just *before* the current one natively

    const prevLimit = moment(school_year.start);

    outer: while (checkDay.isSameOrAfter(prevLimit, 'day')) {
        const isoWeekday = checkDay.isoWeekday() - 1; // 0=Mon, 4=Fri
        const isOddWeek = checkDay.isoWeek() % 2 !== 0;

        for (let h = currentCheckHour; h >= 1; h--) {
            let isOurSubject = false;
            let cancelled = false;

            const tt = allTimetable.find(t => t.day === isoWeekday && t.hour === h);
            if (tt) {
                if (tt.type === 0 || (tt.type === 1 && isOddWeek) || (tt.type === 2 && !isOddWeek)) {
                    if (tt.subject_id === subjectId) {
                        isOurSubject = true;
                    }
                }
            }

            const checkDayStart = checkDay.clone().startOf('day');
            const thisDaySubstr = allSubstitutions.find(sub => {
                const subStart = moment(sub.start_date).startOf('day');
                const subEnd = moment(sub.end_date).startOf('day');
                if (checkDayStart.isSameOrAfter(subStart) && checkDayStart.isSameOrBefore(subEnd)) {
                    if (h >= sub.start_hour && h <= sub.end_hour) return true;
                }
                return false;
            });

            if (thisDaySubstr) {
                if (thisDaySubstr.type === 'canceled') {
                    cancelled = true; 
                    isOurSubject = false;
                } else if (thisDaySubstr.subject_id !== null) {
                    if (thisDaySubstr.subject_id === subjectId) {
                        isOurSubject = true;
                        cancelled = false;
                    } else {
                        isOurSubject = false;
                    }
                }
            }

            if (isOurSubject && !cancelled) {
                prevLessonDateStr = checkDay.format('YYYY-MM-DD');
                prevLessonHour = h - 1;
                break outer;
            }
        }
        
        checkDay.subtract(1, 'day');
        if (checkDay.isoWeekday() > 5) {
             checkDay.isoWeekday(5);
        }
        currentCheckHour = 15;
    }

    let previousLessonData: any = null;

    if (prevLessonDateStr !== null && prevLessonHour !== null) {
        const prevClassbook = await db.selectFrom('classbook')
            .select(['topic', 'note', 'internal_note', 'classbook_id'])
            .where('group_id', '=', classbook.group_id)
            .where('subject_id', '=', subjectId)
            .where('date', '=', prevLessonDateStr)
            .where('day_hour', '=', prevLessonHour)
            .executeTakeFirst();
            
        previousLessonData = {
            date: prevLessonDateStr,
            hour: prevLessonHour,
            recorded: prevClassbook && (prevClassbook.topic || prevClassbook.note) ? true : false,
            topic: prevClassbook?.topic || null,
            note: prevClassbook?.note || null,
            internal_note: prevClassbook?.internal_note || null
        };
    }

    return { classbook, students, lessonNumber, lessonTotal, classService, classMaxHours, previousLesson: previousLessonData }
  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      date: t.Optional(t.Date()),
      hour: t.Optional(t.Number())
    })
  });

export default elysiaApp;
