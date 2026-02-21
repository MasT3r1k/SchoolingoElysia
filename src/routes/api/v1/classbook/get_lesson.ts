import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';
import { get_classbook_lesson_number } from '../../../../functions/get_classbook_lesson_number';
import { get_total_lessons } from '../../../../functions/get_total_lessons';

const elysiaApp = new Elysia()
  .get('/classbook/lesson', async ({ cookie, query }) => {
    // === AUTH ===
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.user_id', 'tokens.user_id')
      .innerJoin("passwords", "passwords.password_id", 'users.password_id')
      .select([
        'users.user_id',
        'users.username',
        'users.role',
        'users.person_id',
        'users.2fa',
        'users.2fa_secret',
        'passwords.password'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!user) return { error: 'no_user', details: 'no_db' };
    if (user.role != "teacher") return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { date, hour, groupId } = query;
    if (date == undefined || hour == undefined || groupId == undefined) return { error: 'bad_query' };

    // === NAČÍST PŘEDMĚT ===
    const subject = await db.selectFrom('timetable')
    .select([
      'timetable.subject_id'
    ])
    .where('timetable.day', '=', moment(date).isoWeekday() - 1)
    .where('timetable.hour', '=', hour + 1)
    .where('timetable.group_id', '=', groupId)
    .executeTakeFirst();

    if (!subject) {
      return { error: 'invalid_subject' };
    }

    const subjectId = subject.subject_id;

    // === NAČTENÍ NEBO VYTVOŘENÍ ZÁPISU ===
    const isExistClassbook = await db.selectFrom('classbook')
      .leftJoin('subjects', 'subjects.subject_id', 'classbook.subject_id')
      .select([
        'classbook.classbook_id as classbook_id'
      ])
      .where('classbook.date', '=', moment(date).format('YYYY-MM-DD'))
      .where('classbook.day_hour', '=', hour)
      .where('classbook.group_id', '=', groupId)
      .executeTakeFirst();

    if (!isExistClassbook) {
      await db.insertInto('classbook')
      .values({
        date: moment(date).format('YYYY-MM-DD'),
        day_hour: hour,
        group_id: groupId,
        subject_id: subjectId
      })
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
      .where('classbook.date', '=', moment(date).format('YYYY-MM-DD'))
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

    const studentFullNames = await format_people_by_ids(studentsDB.map((s) => s.student_id));

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
        full_name: studentFullNames[index] || '',
        total_absence: studentTotalAbsence.find(s => s.student_id == student.student_id)?.total_hours || 0,
        absence: absenceIndexed
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
    .where('class_service.start', '<=', date)
    .where('class_service.end', '>=', date)
    .where('student_groups.group_id', '=', groupId)
    .execute();

    const classService = await format_people_by_ids(class_serviceDB.map((student) => (student.student_id)));

    return { classbook, students, lessonNumber, lessonTotal, classService }
  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      date: t.Optional(t.Date()),
      hour: t.Optional(t.Number())
    })
  });

export default elysiaApp;
