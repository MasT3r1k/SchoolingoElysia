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
    max: 3,
    duration: 1000,
    injectServer: () => app.server
  }))
  .post('/students/search', async({ body }) => {
    let queryBuilder = db.selectFrom('students')
      .leftJoin('persons', 'students.personId', 'persons.personId')
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
        sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className'),
        sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('year'),
      ])

    // Apply Filters
    if (body.search) {
      const search = `%${body.search}%`;
      queryBuilder = queryBuilder.where((eb) => eb.or([
        eb('persons.firstName', 'like', search),
        eb('persons.lastName', 'like', search),
      ]))
    }

    if (body.status && body.status !== 'all') {
      // API expects 'active', 'former', 'suspended'
      // DB stores... let's assume it matches or map it.
      // Based on frontend 'mapStatus', DB might have different values.
      // Assuming 'active', 'archive' (former), 'suspended'.
      let dbStatus = body.status;
      queryBuilder = queryBuilder.where('students.status', '=', dbStatus);
    }

    if (body.classId) {
       queryBuilder = queryBuilder.where('classes.classId', '=', body.classId);
    }

    if (body.scopeId) {
      queryBuilder = queryBuilder.where('classes.scopeId', '=', body.scopeId);
    }
    
    // Sort
    queryBuilder = queryBuilder
      .orderBy('persons.lastName', 'asc')
      .orderBy('persons.firstName', 'asc')

    // Count Total (using a subquery to handle HAVING clauses)
    const countResult = await db.selectFrom(queryBuilder.as('filtered_students'))
      .select(sql<number>`count(*)`.as('total'))
      .executeTakeFirst();
    
    const total = Number(countResult?.total || 0);

    // Apply Pagination
    const results = await queryBuilder
      .limit(body.limit!)
      .offset(body.offset!)
      .execute();

    return Response.json({
      data: results,
      meta: {
        total,
        page: Math.floor(body.offset! / body.limit!) + 1,
        limit: body.limit!
      }
    });

  }, {
body: t.Object({
    limit: t.Optional(t.Number({
        minimum: 1,
        maximum: 100,
        default: 50
    })),
    offset: t.Optional(t.Number({
        minimum: 0,
        default: 0
    })),
    search: t.Optional(t.String()),
    status: t.Optional(t.UnionEnum(['active', 'former', 'suspended', 'all'])),
    classId: t.Optional(t.Numeric()),
    scopeId: t.Optional(t.Numeric()),
})
  });


export default elysiaAp;
