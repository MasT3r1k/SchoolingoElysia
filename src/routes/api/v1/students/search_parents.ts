import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { format_people_by_ids, format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const elysiaAp = new Elysia()
  .post('/parents/search', async({ body }) => {
    let queryBuilder = db.selectFrom('family_relations')
      .leftJoin('persons as source', 'family_relations.source_id', 'source.person_id')
      .leftJoin('persons as target', 'family_relations.target_id', 'target.person_id')
      .select([
        'source.person_id as source_id',
        'source.first_name as source_firstname',
        'source.last_name as source_lastname',
        'target.person_id as target_id',
        'target.first_name as target_firstname',
        'target.last_name as target_lastname',
      ])

    // Apply Filters
    if (body.search) {
      const search = `%${body.search}%`;
      queryBuilder = queryBuilder.where((eb) => eb.or([
        eb('source.first_name', 'like', search),
        eb('source.last_name', 'like', search),
        eb('target.first_name', 'like', search),
        eb('target.last_name', 'like', search),
      ]))
    }
    
    // Sort
    queryBuilder = queryBuilder
      .orderBy('target.last_name', 'asc')
      .orderBy('target.first_name', 'asc')

    // Count Total (using a subquery to handle HAVING clauses)
    const countResult = await db.selectFrom(queryBuilder.as('filtered_parents'))
      .select(sql<number>`count(*)`.as('total'))
      .executeTakeFirst();
    
    const total = Number(countResult?.total || 0);

    // Apply Pagination
    const results = await queryBuilder
      .limit(body.limit!)
      .offset(body.offset!)
      .execute();
    let children: Record<number, any[]> = {};

    const personIds = results.map(r => r.target_id).filter((id): id is number => id !== null);
    results.forEach((r) => {      
      // children[Number(r.target_id)].push(Number(r.source_id));

      if (!personIds.includes(r.source_id as number)) {
        personIds.push(r.source_id as number);
      }
    });
    const formattedNames = await format_person_map_by_ids(personIds);

    const data = results.map(r => ({
      ...r,
      source_full_name: r.source_id ? formattedNames.get(r.source_id) : `${r.source_firstname} ${r.source_lastname}`,
      target_full_name: r.target_id ? formattedNames.get(r.target_id) : `${r.target_firstname} ${r.target_lastname}`,
      // children: children[Number(r.target_id)]
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
    })
  }
);


export default elysiaAp;
