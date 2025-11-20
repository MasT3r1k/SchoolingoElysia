import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';

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
        'users.person',
        'users.2fa',
        'users.2fa_secret',
        'passwords.password'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!user) return { error: 'no_user', details: 'no_db' };

    // === TEACHER PERMISSION ===
    const perm = await db.selectFrom('teachers')
      .select(['teachers.personId'])
      .where('personId', '=', user.person)
      .executeTakeFirst();

    if (!perm) return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { date, hour, groupId } = query;
    if (!date || !hour || !groupId) return { error: 'bad_query' };

    // === NAČTENÍ NEBO VYTVOŘENÍ ZÁPISU ===
    let classbook = await db.selectFrom('classbook')
      .leftJoin('subjects', 'subjects.subjectId', 'classbook.subject')
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
        'classbook.room'
      ])
      .where('classbook.date', '=', moment(date).format('YYYY-MM-DD'))
      .where('classbook.dayHour', '=', hour)
      .where('classbook.groupId', '=', groupId)
      .executeTakeFirst();

      console.log(classbook)

    // === AUTOMATICKÉ VYTVOŘENÍ ZÁPISU ===
    if (!classbook) {
      const inserted = await db
        .insertInto('classbook')
        .values({
          date: moment(date).format('YYYY-MM-DD'),
          dayHour: hour,
          groupId,
          subject: null,
          topic: '',
          note: '',
          internalNote: '',
          room: null
        })
        .returning([
          'cbId as classbookId',
          'date',
          'dayHour',
          'groupId',
          'topic',
          'note',
          'internalNote',
          'room'
        ])
        .executeTakeFirst();

      classbook = { ...inserted, classbookId: Number(inserted!.classbookId), subjectId: null, subjectName: null };
    }

    if (!classbook) return;

    // === Služba třídy ===
    const classService = await db.selectFrom('class_service')
      .innerJoin('students', 'students.personId', 'class_service.student')
      .select([
        'class_service.csId',
        'class_service.student',
        'class_service.start',
        'class_service.end',
        'students.class'
      ])
      .where('students.class', '=', groupId)
      .where('class_service.start', '<=', date)
      .where('class_service.end', '>=', date)
      .execute();

    // === SEZNAM STUDENTŮ ===
    const students = await db.selectFrom('students')
      .leftJoin('student_groups', 'student_groups.student', 'students.personId')
      .select([
        'students.personId',
        'students.class'
      ])
      .where('student_groups.groupId', '=', groupId)
      .orderBy('students.personId')
      .execute();

    // === ABSENCE ===
    const absences = await db.selectFrom('absence')
      .select([
        'absence.student',
        'absence.type',
        'absence.minutes',
        'absence.reason',
        'absence.note'
      ])
      .where('absence.lesson', '=', classbook.classbookId)
      .execute();

    // === MINULÁ HODINA ===
    const previousLesson = await db.selectFrom('classbook')
      .leftJoin('subjects', 'subjects.subjectId', 'classbook.subject')
      .select([
        'classbook.cbId as classbookId',
        'classbook.date',
        'classbook.dayHour',
        'classbook.topic',
        'classbook.note',
        'subjects.label as subjectName'
      ])
      .where('classbook.groupId', '=', groupId)
      .where('classbook.date', '<=', moment(date).format('YYYY-MM-DD'))
      .where(sql`(classbook.date < ${date} OR classbook.dayHour < ${hour})`)
      .orderBy('classbook.date', 'desc')
      .orderBy('classbook.dayHour', 'desc')
      .limit(1)
      .executeTakeFirst();

    // === VŠECHNY HODINY DNE ===
    const fullDay = await db.selectFrom('classbook')
      .leftJoin('subjects', 'subjects.subjectId', 'classbook.subject')
      .select([
        'classbook.cbId',
        'classbook.dayHour',
        'subjects.label as subjectName',
        'classbook.topic'
      ])
      .where('classbook.date', '=', moment(date).format('YYYY-MM-DD'))
      .where('classbook.groupId', '=', groupId)
      .orderBy('classbook.dayHour')
      .execute();

    // === AUTO-POZNÁMKA UČITELE – doplňuješ později ===
    const autoTeacherNote = `Auto-generated: ${students.length} studentů, absence: ${absences.length}`;

    return {
      classbook,
      subject: {
        id: classbook.subjectId,
        name: classbook.subjectName
      },
      classService,
      students,
      absences,
      previousLesson,
      fullDay,
      autoTeacherNote
    };
  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      date: t.Optional(t.Date()),
      hour: t.Optional(t.Number())
    })
  });

export default elysiaApp;
