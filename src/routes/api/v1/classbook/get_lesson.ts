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
  .use(rateLimit({
    scoping: "scoped",
    max: 10,
    duration: 1000,
    injectServer: () => app.server
  }))
  .get('/classbook/lesson', async ({ cookie, query }) => {
    // === AUTH ===
    const token = cookie.token.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.userId', 'tokens.userId')
      .innerJoin("passwords", "passwords.passwordId", "users.password")
      .select([
        'users.userId',
        'users.username',
        'users.role',
        'users.person',
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
      'timetable.subject'
    ])
    .where('timetable.day', '=', moment(date).isoWeekday() - 1)
    .where('timetable.hour', '=', hour + 1)
    .where('timetable.groupId', '=', groupId)
    .executeTakeFirst();

    if (!subject) {
      return { error: 'invalid_subject' };
    }

    const subjectId = subject.subject;

    // === NAČTENÍ NEBO VYTVOŘENÍ ZÁPISU ===
    const isExistClassbook = await db.selectFrom('classbook')
      .leftJoin('subjects', 'subjects.subjectId', 'classbook.subject')
      .select([
        'classbook.cbId as classbookId'
      ])
      .where('classbook.date', '=', moment(date).format('YYYY-MM-DD'))
      .where('classbook.dayHour', '=', hour)
      .where('classbook.groupId', '=', groupId)
      .executeTakeFirst();

    if (!isExistClassbook) {
      await db.insertInto('classbook')
      .values({
        date: moment(date).format('YYYY-MM-DD'),
        dayHour: hour,
        groupId,
        subject: subjectId
      })
      .execute();
    }

    const classbook = await db.selectFrom('classbook')
      .leftJoin('subjects', 'subjects.subjectId', 'classbook.subject')
      .leftJoin('groups', 'groups.groupId', 'classbook.groupId')
      .leftJoin('classes', 'groups.class', 'classes.classId')
      .leftJoin('school_years as syClass', 'syClass.syId', 'classes.yearId')

      .select([
        'classbook.cbId as classbookId',
        'classbook.date',
        'classbook.dayHour',
        'classbook.groupId',
        'classbook.internalNote',
        'classbook.note',
        'classbook.topic',
        'subjects.subjectId',
        'subjects.label as subjectName',
        'classbook.room',
        sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, syClass.start, CURDATE()) + 1, classes.suffix)`.as('className')
      ])
      .where('classbook.date', '=', moment(date).format('YYYY-MM-DD'))
      .where('classbook.dayHour', '=', hour)
      .where('classbook.groupId', '=', groupId)
      .executeTakeFirst();

    if (!classbook) return { error: 'invalid_classbook' };

    // === Získání seznamu studentů ===
    const studentsDB = await db.selectFrom('student_groups')
      .leftJoin('persons', 'persons.personId', 'student_groups.student')
      .select([
        'student_groups.student',
        'persons.firstName',
        'persons.lastName'
      ])
      .where('student_groups.groupId', '=', groupId)
      .execute();

    const studentAbsence = await db.selectFrom('absence')
    .leftJoin('classbook', 'classbook.cbId', 'absence.lesson')
    .select([
      'absence.student',
      'classbook.dayHour',
      'absence.type',
      'absence.minutes',
      'absence.reason',
      'absence.note'
    ])
    .where('classbook.date', '=', classbook.date)
    .where('absence.student', 'in', studentsDB.map((student) => student.student))
    .execute();

    const studentTotalAbsence = await db
      .selectFrom('absence')
      .leftJoin('classbook', 'classbook.cbId', 'absence.lesson')
      .select([
        'absence.student',
        db.fn.count('classbook.dayHour').as('total_hours')
      ])
      .where('classbook.groupId', '=', classbook.groupId)
      .where('classbook.subject', '=', classbook.subjectId)
      .where('absence.student', 'in', studentsDB.map((student) => student.student))
      .groupBy('absence.student')
      .execute();

    const studentFullNames = await format_people_by_ids(studentsDB.map((s) => s.student));

    const students = studentsDB
    .map((student, index) => {
      const absForStudent = studentAbsence.filter(a => a.student === student.student);

      // Převést na array s indexem dle dayHour
      const absenceIndexed: any[] = [];

      absForStudent.forEach((abs: any) => {
        absenceIndexed[abs.dayHour] = abs;  // index = denní hodina
      });

      return {
        student_id: student.student,
        first_name: student.firstName || '',
        last_name: student.lastName || '',
        full_name: studentFullNames[index] || '',
        total_absence: studentTotalAbsence.find(s => s.student == student.student)?.total_hours || 0,
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
    const lessonNumber = await get_classbook_lesson_number(classbook.classbookId);
    let lessonTotal = 0;
    if (moment(classbook.date).isSameOrBefore(school_year.midterm)) {
      lessonTotal = await get_total_lessons(moment(school_year.start), moment(school_year.midterm), classbook.groupId, classbook.subjectId!);
    } else {
      lessonTotal = await get_total_lessons(moment(school_year.midterm), moment(school_year.end), classbook.groupId, classbook.subjectId!);
    }

    // === Služba třídy ===
    const class_serviceDB = await db.selectFrom('class_service')
    .leftJoin('student_groups', 'student_groups.student', 'class_service.student')
    .select([
      'class_service.student'
    ])
    .where('class_service.start', '<=', date)
    .where('class_service.end', '>=', date)
    .where('student_groups.groupId', '=', groupId)
    .execute();

    const classService = await format_people_by_ids(class_serviceDB.map((student) => (student.student)));

    return { classbook, students, lessonNumber, lessonTotal, classService }
  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      date: t.Optional(t.Date()),
      hour: t.Optional(t.Number())
    })
  });

export default elysiaApp;
