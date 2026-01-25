import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_by_id } from '../../../../functions/format_person_by_id';

/* ---------------- TITLES ---------------- */

const titlesBefore = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID')
  .select([
    'pd.person as person',
    sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_before')
  ])
  .where('d.isBefore', '=', true)
  .groupBy('pd.person')
  .as('tb');

const titlesAfter = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID') 
  .select([
    'pd.person as person',
    sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_after')
  ])
  .where('d.isBefore', '=', false)
  .groupBy('pd.person')
  .as('ta');

const fullName = sql`
  concat(
    COALESCE(
      CASE 
        WHEN tb.titles_before IS NULL OR tb.titles_before = '' THEN ''
        ELSE CONCAT(tb.titles_before, ' ')
      END,
    ''),
    persons.firstName, ' ', persons.lastName,
    COALESCE(
      CASE 
        WHEN ta.titles_after IS NULL OR ta.titles_after = '' THEN ''
        ELSE CONCAT(' ', ta.titles_after)
      END,
    '')
  )
`;

/* ---------------- ENDPOINT ---------------- */

const elysiaApp = new Elysia()
  .get('/student/:id', async ({ params: { id }, query }) => {
    try {
      const time = moment(query.time);
      const show = query.type.split(',');

      const [student, groups] = await Promise.all([
        db.selectFrom('students')
          .leftJoin('persons', 'students.personId', 'persons.personId')
          .leftJoin('classes', 'students.class', 'classes.classId')
          .leftJoin('insurance_companies', 'insurance_companies.insuranceId', 'persons.insuranceId')
          .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
          .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
          .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
          .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
          .select([
            'persons.personId',
            'persons.firstName',
            'persons.lastName',
            'persons.gender',
            'persons.birthday',
            fullName.as('fullName'),
            'students.status',
            sql`students.startStudy`.as('startStudy'),
            sql`concat(
              classes.prefix,
              TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1,
              classes.suffix
            )`.as('className'),
            'insurance_companies.insuranceId',
            sql`insurance_companies.insurance`.as('insuranceName'),
            sql`insurance_companies.shortcut`.as('insuranceShort'),
            sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('year'),
            'classes.scopeId',
            'classes.teacher',
            sql<string>`scopes.name`.as('fieldOfStudy'),
            sql<string>`(
              SELECT email 
              FROM emails 
              WHERE emails.personId = persons.personId 
              AND emails.is_verified = 1 
              LIMIT 1
            )`.as('email'),

            sql<string>`(
              SELECT number 
              FROM phone_numbers 
              WHERE phone_numbers.personId = persons.personId 
              AND phone_numbers.is_verified = 1 
              LIMIT 1
            )`.as('phone'),

            sql<number>`(
              SELECT ROUND(
                SUM(g.mark * gc.weight) / NULLIF(SUM(gc.weight), 0),
                2
              )
              FROM grades g
              LEFT JOIN grades_columns gc ON gc.gcId = g.columnId
              WHERE g.studentId = students.personId
              AND gc.status = 'active'
              AND g.mark IS NOT NULL
            )`.as('averageGrade'),

            sql<number>`(
              SELECT ROUND(
                CASE 
                  WHEN COUNT(DISTINCT c.cbId) = 0 THEN 0
                  ELSE (COUNT(a.student) * 100.0) / COUNT(DISTINCT c.cbId)
                END,
                2
              )
              FROM student_groups sg
              LEFT JOIN classbook c ON c.groupId = sg.groupId
              LEFT JOIN absence a 
                ON a.lesson = c.cbId 
                AND a.student = students.personId
              WHERE sg.student = students.personId
            )`.as('absenceRate')
          ])
          .where('persons.personId', '=', id)
          .executeTakeFirstOrThrow(),

        db.selectFrom('student_groups')
          .innerJoin('groups', 'student_groups.groupId', 'groups.groupId')
          .innerJoin('school_years as sy', 'groups.year', 'sy.syId')
          .select([
            'groups.groupId',
            'groups.name',
            'groups.num',
          ])
          .where('student_groups.student', '=', id)
          .where('sy.start', '<=', time.format("YYYY-MM-DD"))
          .where('sy.end', '>=', time.format("YYYY-MM-DD"))
          .execute()
      ]);

      const groupIds = groups.length ? groups.map(g => g.groupId) : [-1];

      const [timetable, substitution] = await Promise.all([
        db.selectFrom('timetable')
          .innerJoin('subjects', 'timetable.subject', 'subjects.subjectId')
          .leftJoin('persons', 'timetable.teacher', 'persons.personId')
          .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
          .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
          .select([
            sql`(timetable.day + 1) % 7`.as('day'),
            'timetable.hour',
            'timetable.type',
            sql`subjects.label`.as('subjectName'),
            sql`subjects.shortcut`.as('subjectShortcut'),
            fullName.as('teacher')
          ])
          .where('timetable.groupId', 'in', groupIds)
          .execute(),

        db.selectFrom('substitution')
          .leftJoin('subjects', 'substitution.subjectId', 'subjects.subjectId')
          .leftJoin('persons', 'substitution.teacherId', 'persons.personId')
          .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
          .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
          .select([
            'substitution.start_date',
            'substitution.start_hour',
            'substitution.end_date',
            'substitution.end_hour',
            sql`subjects.label`.as('subjectName'),
            sql`subjects.shortcut`.as('subjectShortcut'),
            fullName.as('teacher')
          ])
          .where('substitution.groupId', 'in', groupIds)
          .where('substitution.start_date', '>=', time.clone().startOf('isoWeek').format("YYYY-MM-DD"))
          .where('substitution.end_date', '<=', time.clone().endOf('isoWeek').format("YYYY-MM-DD"))
          .execute()
      ]);

      const result: any = {};

      if (show.includes('basic')) Object.assign(result, student);
      if (show.includes('groups')) result.groups = groups;
      if (show.includes('timetable')) {
        result.timetable = timetable;
        result.substitution = substitution;
      }

      result.teacherName = await format_person_by_id(student.teacher!);

      return Response.json(result);

    } catch (e) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    query: t.Object({
      type: t.String({ default: 'basic,groups,timetable' }),
      time: t.String({ default: moment().format("YYYY-MM-DD") })
    })
  });

export default elysiaApp;
