import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_by_id } from '../../../../functions/format_person_by_id';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const elysiaApp = new Elysia({ prefix: '/subjects' })
  // GET subjects for current user (student or teacher)
  .get('/', async ({ cookie }: any) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' }, { status: 401 });
    }

    const user = await db.selectFrom("tokens")
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select([
        'users.user_id',
        'users.person_id as person_id'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!user) {
      return Response.json({ error: 'no_user', details: 'no_db' }, { status: 401 });
    }

    // Determine user role from students/teachers tables
    const perms = await db.selectFrom("tokens")
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .leftJoin('students', 'students.person_id', 'users.person_id')
      .leftJoin('teachers', 'teachers.person_id', 'users.person_id')
      .select([
        'students.person_id as student_id',
        'teachers.person_id as teacher_id'
      ])
      .where('tokens.token', '=', token)
      .limit(1)
      .executeTakeFirst();

    const isTeacher = perms?.teacher_id !== null;

    if (isTeacher) {
      // Teacher view - subjects they can teach
      const teacherSubjects = await db.selectFrom('teachers_subject')
        .leftJoin('subjects', 'subjects.subject_id', 'teachers_subject.subject_id')
        .select([
          'subjects.subject_id',
          'subjects.label',
          'subjects.shortcut'
        ])
        .where('teachers_subject.teacher_id', '=', user.person_id as number)
        .orderBy('subjects.label', 'asc')
        .execute();

      // Get teaching hours from timetable for each subject
      const subjectDetails = await Promise.all(teacherSubjects.map(async (subject) => {
        // Count lessons per week for this subject by this teacher
        const lessonsQuery = await db.selectFrom('timetable')
          .leftJoin('groups', 'groups.group_id', 'timetable.group_id')
          .leftJoin('classes', 'classes.class_id', 'groups.class_id')
          .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
          .select([
            'classes.class_id',
            sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
            sql`COUNT(*)`.as('lesson_count')
          ])
          .where('timetable.teacher_id', '=', user.person_id as number)
          .where('timetable.subject_id', '=', subject.subject_id as number)
          .groupBy(['classes.class_id', 'classes.prefix', 'classes.suffix', 'school_years.start'])
          .execute();

        const totalHours = lessonsQuery.reduce((sum, l) => sum + Number(l.lesson_count), 0);
        const classes = lessonsQuery.map(l => ({
          class_id: l.class_id,
          class_name: l.class_name,
          hours_per_week: Number(l.lesson_count)
        }));

        return {
          subject_id: subject.subject_id,
          label: subject.label,
          shortcut: subject.shortcut,
          total_hours_per_week: totalHours,
          classes
        };
      }));

      return { role: 'teacher', subjects: subjectDetails };
    } else {
      // Student view - subjects for their class
      const studentClass = await db.selectFrom('students')
        .leftJoin('classes', 'classes.class_id', 'students.class_id')
        .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
        .select([
          'classes.class_id',
          'classes.scope_id',
          sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
          sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE())`.as('class_index')
        ])
        .where('students.person_id', '=', user.person_id as number)
        .executeTakeFirst();

      if (!studentClass) {
        return { role: 'student', subjects: [], class_name: null };
      }

      // Get subjects for this scope/year
      const subjects = await db.selectFrom('scopes_subjects')
        .leftJoin('subjects', 'subjects.subject_id', 'scopes_subjects.subject_id')
        .select([
          'subjects.subject_id',
          'subjects.label',
          'subjects.shortcut',
          'scopes_subjects.hours_per_week',
          'scopes_subjects.is_mandatory',
          'scopes_subjects.color'
        ])
        .where('scopes_subjects.scope_id', '=', studentClass.scope_id as number)
        .where('scopes_subjects.year', '=', studentClass.class_index as number)
        .where('scopes_subjects.hours_per_week', '>=', 1)
        .orderBy('subjects.label', 'asc')
        .execute();

      // Get teachers for each subject from timetable
      const subjectsWithTeachers = await Promise.all(subjects.map(async (subject) => {
        const teachersQuery = await db.selectFrom('timetable')
          .leftJoin('groups', 'groups.group_id', 'timetable.group_id')
          .select([
            'timetable.teacher_id'
          ])
          .where('groups.class_id', '=', studentClass.class_id as number)
          .where('timetable.subject_id', '=', subject.subject_id as number)
          .groupBy('timetable.teacher_id')
          .execute();

        const teacherIds = teachersQuery.map(t => t.teacher_id).filter((id): id is number => id !== null);
        let teacherNames: string[] = [];
        if (teacherIds.length > 0) {
            const nameMap = await format_person_map_by_ids(teacherIds);
            teacherNames = teacherIds.map(id => nameMap.get(id) || '');
        }

        return {
          subject_id: subject.subject_id,
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
        class_name: studentClass.class_name 
      };
    }
  });

export default elysiaApp;
