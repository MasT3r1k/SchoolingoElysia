import { Elysia, t } from 'elysia';
import { db } from "../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../..';

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
      .select([
          fullName,
          'students.status',
          sql`DATE_FORMAT(students.startStudy, '%d. %m. %Y')`.as('startStudy'),
          sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
      ])
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();
    return Response.json(result);

  }, {
    query: t.Object({
			limit: t.Optional(t.Number({
        minimum: 1,
        maximum: 20,
        default: 10
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
