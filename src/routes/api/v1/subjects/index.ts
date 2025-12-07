import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';
import { format_person_by_id } from '../../../../functions/format_person_by_id';

const elysiaApp = new Elysia({ prefix: '/subjects' })
  .use(rateLimit({
    scoping: "scoped",
    max: 20,
    duration: 1000,
    injectServer: () => app.server
  }))
  // GET subjects for current user (student or teacher)
  .get('/', async ({ cookie }) => {
    const token = cookie.token.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'no_user', details: 'no_cookie' }), { status: 401 });
    }

    const user = await db.selectFrom("tokens")
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        sql`users.userId`.as('userId'),
        sql`users.person`.as('personId')
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!user) {
      return new Response(JSON.stringify({ error: 'no_user', details: 'no_db' }), { status: 401 });
    }

    // Determine user role from students/teachers tables
    const perms = await db.selectFrom("tokens")
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .leftJoin('students', 'students.personId', 'users.person')
      .leftJoin('teachers', 'teachers.personId', 'users.person')
      .select([
        sql`students.personId`.as('student'),
        sql`teachers.personId`.as('teacher')
      ])
      .where('tokens.token', '=', token)
      .limit(1)
      .executeTakeFirst();

    const isTeacher = perms?.teacher !== null;

    if (isTeacher) {
      // Teacher view - subjects they can teach
      const teacherSubjects = await db.selectFrom('teachers_subject')
        .leftJoin('subjects', 'subjects.subjectId', 'teachers_subject.subject_id')
        .select([
          'subjects.subjectId',
          sql`subjects.label`.as('label'),
          sql`subjects.shortcut`.as('shortcut')
        ])
        .where('teachers_subject.teacher_id', '=', user.personId as number)
        .orderBy(sql`subjects.label`, 'asc')
        .execute();

      // Get teaching hours from timetable for each subject
      const subjectDetails = await Promise.all(teacherSubjects.map(async (subject) => {
        // Count lessons per week for this subject by this teacher
        const lessonsQuery = await db.selectFrom('timetable')
          .leftJoin('groups', 'groups.groupId', 'timetable.groupId')
          .leftJoin('classes', 'classes.classId', 'groups.class')
          .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
          .select([
            'classes.classId',
            sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className'),
            sql`COUNT(*)`.as('lessonCount')
          ])
          .where('timetable.teacher', '=', user.personId as number)
          .where('timetable.subject', '=', subject.subjectId as number)
          .groupBy(['classes.classId', 'classes.prefix', 'classes.suffix', 'school_years.start'])
          .execute();

        const totalHours = lessonsQuery.reduce((sum, l) => sum + Number(l.lessonCount), 0);
        const classes = lessonsQuery.map(l => ({
          classId: l.classId,
          className: l.className,
          hoursPerWeek: Number(l.lessonCount)
        }));

        return {
          subjectId: subject.subjectId,
          label: subject.label,
          shortcut: subject.shortcut,
          totalHoursPerWeek: totalHours,
          classes
        };
      }));

      return { role: 'teacher', subjects: subjectDetails };
    } else {
      // Student view - subjects for their class
      const studentClass = await db.selectFrom('students')
        .leftJoin('classes', 'classes.classId', 'students.class')
        .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
        .select([
          'classes.classId',
          'classes.scopeId',
          sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className'),
          sql`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE())`.as('classIndex')
        ])
        .where('students.personId', '=', user.personId as number)
        .executeTakeFirst();

      if (!studentClass) {
        return { role: 'student', subjects: [], className: null };
      }

      // Get subjects for this scope/year
      const subjects = await db.selectFrom('scopes_subjects')
        .leftJoin('subjects', 'subjects.subjectId', 'scopes_subjects.subject_id')
        .select([
          'subjects.subjectId',
          sql`subjects.label`.as('label'),
          sql`subjects.shortcut`.as('shortcut'),
          'scopes_subjects.hours_per_week',
          'scopes_subjects.is_mandatory',
          'scopes_subjects.color'
        ])
        .where('scopes_subjects.scope_id', '=', studentClass.scopeId as number)
        .where('scopes_subjects.year', '=', studentClass.classIndex as number)
        .where('scopes_subjects.hours_per_week', '>=', 1)
        .orderBy(sql`subjects.label`, 'asc')
        .execute();

      // Get teachers for each subject from timetable
      const subjectsWithTeachers = await Promise.all(subjects.map(async (subject) => {
        const teachersQuery = await db.selectFrom('timetable')
          .leftJoin('groups', 'groups.groupId', 'timetable.groupId')
          .select([
            'timetable.teacher'
          ])
          .where('groups.class', '=', studentClass.classId as number)
          .where('timetable.subject', '=', subject.subjectId as number)
          .groupBy('timetable.teacher')
          .execute();

        const teacherNames = await Promise.all(
          teachersQuery.map(t => format_person_by_id(t.teacher))
        );

        return {
          subjectId: subject.subjectId,
          label: subject.label,
          shortcut: subject.shortcut,
          hours_per_week: subject.hours_per_week,
          is_mandatory: subject.is_mandatory,
          color: subject.color,
          teachers: teacherNames
        };
      }));

      return { 
        role: 'student', 
        subjects: subjectsWithTeachers, 
        className: studentClass.className 
      };
    }
  });

export default elysiaApp;
