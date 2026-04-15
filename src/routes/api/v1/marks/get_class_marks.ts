import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';

const app = new Elysia()
  .get('/marks/class', async ({ cookie, query }: any) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.school_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const classId = Number(query.classId);
    if (!classId) return { error: 'missing_params' };

    // Get class info
    const classInfo = await db.selectFrom('classes')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .select([
        'classes.class_id',
        'classes.scope_id',
        'school_years.start as class_start',
        sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
      ])
      .where('classes.class_id', '=', classId)
      .executeTakeFirst();

    if (!classInfo) return { error: 'class_not_found' };

    // Calculate current grade
    const now = new Date();
    const currentYearInSchool = classInfo.class_start 
      ? now.getFullYear() - new Date(classInfo.class_start).getFullYear() + (now.getMonth() >= 7 ? 1 : 0)
      : 1;

    // Get subjects for this class (via scope)
    const subjects = await db.selectFrom('scopes_subjects')
      .innerJoin('subjects', 'subjects.subject_id', 'scopes_subjects.subject_id')
      .select([
        'subjects.subject_id',
        'subjects.label as subject_name',
        'subjects.shortcut as subject_short'
      ])
      .where('scopes_subjects.scope_id', '=', classInfo.scope_id)
      .where('scopes_subjects.year', '<=', currentYearInSchool)
      .where('scopes_subjects.hours_per_week', '>', 0)
      .groupBy('subjects.subject_id')
      .orderBy('subjects.label', 'asc')
      .execute();

    // Get students in class
    const students = await db.selectFrom('students')
      .innerJoin('persons', 'persons.person_id', 'students.person_id')
      .select([
        'persons.person_id',
        'persons.first_name',
        'persons.last_name',
        sql<number>`(
          SELECT COUNT(*) + 1
          FROM students s2
          INNER JOIN persons p2 ON s2.person_id = p2.person_id
          WHERE s2.class_id = students.class_id
          AND s2.status = 'active'
          AND (
            p2.last_name < persons.last_name
            OR (p2.last_name = persons.last_name AND p2.first_name < persons.first_name)
            OR (p2.last_name = persons.last_name AND p2.first_name = persons.first_name AND p2.person_id < persons.person_id)
          )
        )`.as('class_order')
      ])
      .where('students.class_id', '=', classId)
      .where('students.status', '=', 'active')
      .orderBy('persons.last_name', 'asc')
      .orderBy('persons.first_name', 'asc')
      .execute();

    const studentIds = students.map(s => s.person_id);

    // Get grades for all students and subjects in this class
    const grades = await db.selectFrom('semester_grades')
      .select([
        'student_id',
        'subject_id',
        'grade',
        'semester'
      ])
      .where('student_id', 'in', studentIds.length > 0 ? studentIds : [-1])
      .execute();

    // Combine data
    const data = students.map(student => {
      const studentGrades: Record<string, any> = {
        person_id: student.person_id,
        first_name: student.first_name,
        last_name: student.last_name,
        full_name: `${student.last_name} ${student.first_name}`,
        class_order: student.class_order,
        class_name: classInfo.class_name
      };

      // Map subject grades to the student object
      subjects.forEach(subject => {
          // Using subject_id as part of the key to keep it unique
          // We can also use subject_short if we want nicer keys
          const gradeEntry = grades.find(g => g.student_id === student.person_id && g.subject_id === subject.subject_id);
          studentGrades[`subject_${subject.subject_id}`] = gradeEntry ? gradeEntry.grade : '';
      });

      return studentGrades;
    });

    return {
      success: true,
      subjects,
      data
    };

  }, {
    query: t.Object({
      classId: t.Numeric(),
      year: t.Optional(t.Numeric())
    })
  });

export default app;
