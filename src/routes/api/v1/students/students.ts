import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';

const titlesBefore = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID')
  .select([
      'pd.person as person',
      sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_before')
  ])
  .where('d.isBefore', '=', true)
  .groupBy('pd.person')
  .as('tb')

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
      CASE WHEN tb.titles_before IS NULL OR tb.titles_before = '' THEN ''
      ELSE CONCAT(tb.titles_before, ' ')
      END,
      ''
      ),
      persons.firstName, ' ', persons.lastName,
      COALESCE(
      CASE WHEN ta.titles_after IS NULL OR ta.titles_after = '' THEN ''
      ELSE CONCAT(' ', ta.titles_after)
      END,
      ''
      )
  )
  `.as('fullName')

const elysiaAp = new Elysia()
  .use(rateLimit({
    scoping: "scoped",
    max: 1,
    duration: 1000,
    injectServer: () => app.server
  }))
  .get('/students', async({ query }) => {
    const result = await db.selectFrom('students')
      .leftJoin('persons', 'students.personId', 'persons.personId')
      .orderBy('persons.lastName', 'asc')
      .orderBy('persons.firstName', 'asc')
      .leftJoin('classes', 'students.class', 'classes.classId')
      .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
      .leftJoin(
          titlesBefore,
          'tb.person',
          'persons.personId'
      )
      .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
      .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
      .select([
          'persons.personId',
          'persons.firstName',
          'persons.lastName',
          fullName,
          // Get primary email via subquery
          sql`(SELECT email FROM emails WHERE emails.personId = persons.personId AND emails.is_verified = 1 LIMIT 1)`.as('email'),
          // Get primary phone via subquery
          sql`(SELECT number FROM phone_numbers WHERE phone_numbers.personId = persons.personId AND phone_numbers.is_verified = 1 LIMIT 1)`.as('phone'),
          sql`DATE_FORMAT(persons.birthday, '%d. %m. %Y')`.as('dateOfBirth'),
          'persons.birthday',
          'students.status',
          sql`DATE_FORMAT(students.startStudy, '%d. %m. %Y')`.as('startStudy'),
          sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className'),
          sql`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('year'),
          'classes.scopeId',
          sql`scopes.name`.as('fieldOfStudy'),
          // Calculate weighted average grade
          sql`(
            SELECT ROUND(SUM(g.mark * gc.weight) / NULLIF(SUM(gc.weight), 0), 2)
            FROM grades g
            LEFT JOIN grades_columns gc ON gc.gcId = g.columnId
            WHERE g.studentId = students.personId
            AND gc.status = 'active'
            AND g.mark IS NOT NULL
          )`.as('averageGrade'),
          // Calculate absence rate - simplified version
          sql`(
            SELECT ROUND(
              CASE 
                WHEN COUNT(DISTINCT c.cbId) = 0 THEN 0
                ELSE (COUNT(a.student) * 100.0) / COUNT(DISTINCT c.cbId)
              END, 
            2)
            FROM student_groups sg
            LEFT JOIN classbook c ON c.groupId = sg.groupId
            LEFT JOIN absence a ON a.lesson = c.cbId AND a.student = students.personId
            WHERE sg.student = students.personId
          )`.as('absenceRate')
      ])
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();
    return Response.json(result);

  }, {
    query: t.Object({
			limit: t.Optional(t.Number({
        minimum: 1,
        maximum: 100,
        default: 50
      })),
			offset: t.Optional(t.Number({
        minimum: 0,
        default: 0
      })),
      type: t.Optional(t.Array(
        t.String()
      ))
		})
  });


export default elysiaAp;
