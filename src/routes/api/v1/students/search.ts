import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const elysiaAp = new Elysia()
  .post('/students/search', async({ body }) => {
    let queryBuilder = db.selectFrom('students')
      .leftJoin('persons', 'students.person_id', 'persons.person_id')
      .leftJoin('classes', 'students.class_id', 'classes.class_id')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
      .select([
        'persons.person_id',
        'persons.first_name',
        'persons.last_name',
        sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
        sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('year'),
      ])

    // Apply Filters
    if (body.search) {
      const search = `%${body.search}%`;
      queryBuilder = queryBuilder.where((eb) => eb.or([
        eb('persons.first_name', 'like', search),
        eb('persons.last_name', 'like', search),
      ]))
    }

    if (body.status && body.status !== 'all') {
      let dbStatus = body.status;
      queryBuilder = queryBuilder.where('students.status', '=', dbStatus);
    }

    if (body.classId) {
       queryBuilder = queryBuilder.where('classes.class_id', '=', body.classId);
    }

    if (body.scopeId) {
      queryBuilder = queryBuilder.where('classes.scope_id', '=', body.scopeId);
    }
    
    // Sort
    queryBuilder = queryBuilder
      .orderBy('persons.last_name', 'asc')
      .orderBy('persons.first_name', 'asc')

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

    const personIds = results.map(r => r.person_id).filter((id): id is number => id !== null);
    const formattedNames = await format_person_map_by_ids(personIds);

    const data = results.map(r => ({
      ...r,
      full_name: r.person_id ? formattedNames.get(r.person_id) : `${r.first_name} ${r.last_name}`
    }));

    return Response.json({
      data,
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
