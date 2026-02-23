import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const elysiaAp = new Elysia()
  .post('/parents/search', async({ body }) => {
    let parentsQuery = db.selectFrom('family_relations')
      .leftJoin('persons as source', 'family_relations.source_id', 'source.person_id')
      .leftJoin('persons as target', 'family_relations.target_id', 'target.person_id')
      .select([
        'target.person_id as target_id',
        'target.last_name as target_lastname',
        'target.first_name as target_firstname'
      ])
      .groupBy([
        'target.person_id',
        'target.last_name',
        'target.first_name'
      ]);

    // --- NOVÉ: Vyloučení rodičů, kteří už jsou k tomuto studentovi přiřazeni ---
    if ('student_id' in body) {
      parentsQuery = parentsQuery.where(({ not, exists, selectFrom }) => 
        not(
          exists(
            selectFrom('family_relations as existing_rel')
              .select('existing_rel.target_id')
              .whereRef('existing_rel.target_id', '=', 'target.person_id')
              .where('existing_rel.source_id', '=', Number(body.student_id))
          )
        )
      );
    }
    // ---------------------------------------------------------------------------

    if (body.search) {
      const search = `%${body.search}%`;
      parentsQuery = parentsQuery.where((eb) => eb.or([
        eb('source.first_name', 'like', search),
        eb('source.last_name', 'like', search),
        eb('target.first_name', 'like', search),
        eb('target.last_name', 'like', search),
        eb(sql<string>`CONCAT(source.first_name, ' ', source.last_name)`, 'like', search),
        eb(sql<string>`CONCAT(target.first_name, ' ', target.last_name)`, 'like', search),
        eb(sql<string>`CONCAT(source.last_name, ' ', source.first_name)`, 'like', search),
        eb(sql<string>`CONCAT(target.last_name, ' ', target.first_name)`, 'like', search),
      ]));
    }

    const countResult = await db.selectFrom(parentsQuery.as('filtered_parents'))
      .select(sql<number>`count(*)`.as('total'))
      .executeTakeFirst();
    const total = Number(countResult?.total || 0);

    const paginatedParents = await parentsQuery
      .orderBy('target.last_name', 'asc')
      .orderBy('target.first_name', 'asc')
      .limit(body.limit!)
      .offset(body.offset!)
      .execute();

    const parentIdsToFetch = paginatedParents
      .map(p => p.target_id)
      .filter((id): id is number => id !== null);

    if (parentIdsToFetch.length === 0) {
      return Response.json({
        data: [],
        meta: { total, page: Math.floor(body.offset! / body.limit!) + 1, limit: body.limit! }
      });
    }

    const results = await db.selectFrom('family_relations')
      .leftJoin('persons as source', 'family_relations.source_id', 'source.person_id')
      .leftJoin('persons as target', 'family_relations.target_id', 'target.person_id')
      .leftJoin('students', 'students.person_id', 'source.person_id')
      .leftJoin('classes', 'classes.class_id', 'students.class_id')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .select([
        'source.person_id as source_id',
        'source.first_name as source_firstname',
        'source.last_name as source_lastname',
        'target.person_id as target_id',
        'target.first_name as target_firstname',
        'target.last_name as target_lastname',
        sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className')
      ])
      .where('target.person_id', 'in', parentIdsToFetch)
      .orderBy('target.last_name', 'asc')
      .orderBy('target.first_name', 'asc')
      .execute();

    // --- KROK 3: Formátování a seskupení (javascript) ---
    const personIds = new Set<number>();
    results.forEach((r) => {
      if (r.target_id) personIds.add(r.target_id);
      if (r.source_id) personIds.add(r.source_id);
    });

    const formattedNames = await format_person_map_by_ids(Array.from(personIds));
    const parentMap = new Map<number, any>();

    paginatedParents.forEach(p => {
      if (p.target_id) {
        parentMap.set(p.target_id, {
          parent_id: p.target_id,
          parent_full_name: formattedNames.get(p.target_id) || `${p.target_firstname} ${p.target_lastname}`.trim(),
          parent_firstname: p.target_firstname,
          parent_lastname: p.target_lastname,
          children: []
        });
      }
    });

    results.forEach((r) => {
      const parentId = r.target_id as number;
      
      if (r.source_id && parentMap.has(parentId)) {
        parentMap.get(parentId).children.push({
          child_id: r.source_id,
          child_full_name: formattedNames.get(r.source_id) || `${r.source_firstname} ${r.source_lastname}`.trim(),
          child_firstname: r.source_firstname,
          child_lastname: r.source_lastname,
          child_classname: r.className
        });
      }
    });

    const data = Array.from(parentMap.values());

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
      student_id: t.Optional(t.Number({
        minimum: 0
      }))
    })
  }
);


export default elysiaAp;
