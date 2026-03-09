import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/marks/midterm', async ({ cookie, query }: any) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    let student_id = auth.person_id;
    if (query.student_id !== undefined) {
      student_id = query.student_id;
    }

    const student = await db
      .selectFrom('students')
      .leftJoin('classes', 'classes.class_id', 'students.class_id')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .select([
        'students.person_id',
        'classes.scope_id',
        'students.start_study',
        'school_years.start as class_start'
      ])
      .where('students.person_id', '=', student_id)
      .executeTakeFirst();

    if (!student) return { error: 'no_permission' };

    // Calculate current grade of the student
    const now = new Date();
    const currentGrade = student.class_start 
      ? now.getFullYear() - new Date(student.class_start).getFullYear() + (now.getMonth() >= 7 ? 1 : 0)
      : 1;

    const scopes_subjects = await db.selectFrom('scopes_subjects')
      .innerJoin('subjects', 'subjects.subject_id', 'scopes_subjects.subject_id')
      .select([
        'subjects.subject_id',
        'subjects.label as subject_name',
        'subjects.shortcut as subject_short',
        'scopes_subjects.is_mandatory'
      ])
      .where('scopes_subjects.scope_id', '=', student.scope_id)
      .where('scopes_subjects.year', '<=', currentGrade)
      .where('scopes_subjects.hours_per_week', '>', 0)
      .groupBy('subjects.subject_id')
      .orderBy('subjects.label', 'asc')
      .execute();

    const semester_grades = await db.selectFrom('semester_grades')
      .select([
        'semester_grades.subject_id',
        'semester_grades.semester',
        'semester_grades.grade',
        'semester_grades.verbal_assessment',
        'semester_grades.year'
      ])
      .where('semester_grades.student_id', '=', student_id)
      .execute();

    const education_measures = await db.selectFrom('education_measures')
      .select(['issued_at', 'type', 'reason'])
      .where('student_id', '=', student_id)
      .where('type', '=', 'reduced_behavior')
      .execute();

    const absences = await db.selectFrom('absence')
      .innerJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
      .select([
        'classbook.date',
        'classbook.day_hour',
        'classbook.subject_id',
        'absence.type',
        'absence.reason',
        'absence.minutes'
      ])
      .where('absence.student_id', '=', student_id)
      .execute();

    let report_cards: any[] = [];
    try {
      report_cards = await db.selectFrom('report_cards')
        .select(['year', 'semester', 'issued_at'])
        .where('student_id', '=', student_id)
        .execute();
    } catch (e) {
      // Table might not exist yet
    }

    const minYearRecord = await db.selectFrom('semester_grades')
      .select((eb) => eb.fn.min<number>('year').as('min_year'))
      .where('student_id', '=', student_id)
      .executeTakeFirst();

    return { 
      subjects: scopes_subjects, 
      marks: semester_grades,
      education_measures: education_measures,
      absences: absences,
      report_cards: report_cards,
      start_study: student.start_study,
      class_start: student.class_start,
      min_year: minYearRecord?.min_year
    }

  }, {
    query: t.Object({
      student_id: t.Optional(t.Number())
    })
  });

export default app;
