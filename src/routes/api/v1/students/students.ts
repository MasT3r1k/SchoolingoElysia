import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const elysiaApp = new Elysia()
  .get('/students', async({ query, school }: any) => {
    let queryBuilder = db.selectFrom('students')
      .leftJoin('users', 'users.person_id', 'students.person_id')
      .leftJoin('classes', 'students.class_id', 'classes.class_id')
      .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
      .where((eb) => eb.or([
        eb('users.school_id', '=', school.school_id),
        eb('scopes.school_id', '=', school.school_id)
      ]))
      .leftJoin('persons', 'students.person_id', 'persons.person_id')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .select([
        'users.user_id',
        'persons.person_id',
        'persons.first_name',
        'persons.last_name',
        'persons.gender',
        'students.status',
        sql<string>`(SELECT email FROM emails WHERE emails.person_id = persons.person_id AND emails.is_verified = 1 LIMIT 1)`.as('email'),
        sql<string>`(SELECT number FROM phone_numbers WHERE phone_numbers.person_id = persons.person_id AND phone_numbers.is_verified = 1 LIMIT 1)`.as('phone'),
        'persons.birthday',
        sql<string>`students.start_study`.as('start_study'),
        sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
        sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('year'),
        'classes.scope_id',
        sql<string>`scopes.name`.as('field_of_study'),
        sql<string>`(
            SELECT ROUND(SUM(g.mark * gc.weight) / NULLIF(SUM(gc.weight), 0), 2)
            FROM grades g
            LEFT JOIN grades_columns gc ON gc.column_id = g.column_id
            WHERE g.student_id = students.person_id
            AND gc.status = 'active'
            AND g.mark IS NOT NULL
        )`.as('average_grade'),
        sql<string>`(
            SELECT ROUND(
            CASE 
                WHEN COUNT(DISTINCT c.classbook_id) = 0 THEN 0
                ELSE (COUNT(a.student_id) * 100.0) / COUNT(DISTINCT c.classbook_id)
            END, 
            2)
            FROM student_groups sg
            LEFT JOIN classbook c ON c.group_id = sg.group_id
            LEFT JOIN absence a ON a.lesson_id = c.classbook_id AND a.student_id = students.person_id
            WHERE sg.student_id = students.person_id
        )`.as('absence_rate'),
        sql<string>`(
            SELECT ROUND(
            CASE 
                WHEN COUNT(DISTINCT c.classbook_id) = 0 THEN 0
                ELSE (COUNT(CASE WHEN a.type != 2 THEN a.student_id END) * 100.0) / COUNT(DISTINCT c.classbook_id)
            END, 
            2)
            FROM student_groups sg
            LEFT JOIN classbook c ON c.group_id = sg.group_id
            LEFT JOIN absence a ON a.lesson_id = c.classbook_id AND a.student_id = students.person_id
            WHERE sg.student_id = students.person_id
        )`.as('absence_rate_excused'),
        sql<string>`(
            SELECT ROUND(
            CASE 
                WHEN COUNT(DISTINCT c.classbook_id) = 0 THEN 0
                ELSE (COUNT(CASE WHEN a.type = 2 THEN a.student_id END) * 100.0) / COUNT(DISTINCT c.classbook_id)
            END, 
            2)
            FROM student_groups sg
            LEFT JOIN classbook c ON c.group_id = sg.group_id
            LEFT JOIN absence a ON a.lesson_id = c.classbook_id AND a.student_id = students.person_id
            WHERE sg.student_id = students.person_id
        )`.as('absence_rate_unexcused')
      ])

    // Apply Filters
    if (query.search) {
      const search = `%${query.search}%`;
      queryBuilder = queryBuilder.where((eb) => eb.or([
        eb('persons.first_name', 'like', search),
        eb('persons.last_name', 'like', search),
      ]))
    }

    if (query.status && query.status !== 'all') {
      let dbStatus = query.status;
      queryBuilder = queryBuilder.where('students.status', '=', dbStatus);
    }

    if (query.classId) {
       queryBuilder = queryBuilder.where('classes.class_id', '=', query.classId);
    }

    if (query.scope_id) {
      queryBuilder = queryBuilder.where('classes.scope_id', '=', query.scope_id);
    }
    
    // Average Grade & Absence (Having clauses)
    if (query.avgGradeMin !== undefined) {
      queryBuilder = queryBuilder.having(sql`CAST(average_grade AS DECIMAL(4,2))`, '>=', query.avgGradeMin)
    }
    if (query.avgGradeMax !== undefined) {
      queryBuilder = queryBuilder.having(sql`CAST(average_grade AS DECIMAL(4,2))`, '<=', query.avgGradeMax)
    }
    
    if (query.absenceMin !== undefined) {
      queryBuilder = queryBuilder.having(sql`CAST(absence_rate AS DECIMAL(5,2))`, '>=', query.absenceMin)
    }
    if (query.absenceMax !== undefined) {
      queryBuilder = queryBuilder.having(sql`CAST(absence_rate AS DECIMAL(5,2))`, '<=', query.absenceMax)
    }

    if (query.missingInfo) {
      // TODO edit to count total emails and phones
      // Using HAVING for subqueries email/phone
      queryBuilder = queryBuilder.having((eb) => eb.or([
        eb(sql`email`, 'is', null),
        eb(sql`phone`, 'is', null)
      ]))
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
      .limit(query.limit!)
      .offset(query.offset!)
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
        page: Math.floor(query.offset! / query.limit!) + 1,
        limit: query.limit!
      }
    });

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
      type: t.Optional(t.Array(t.String())),
      search: t.Optional(t.String()),
      status: t.Optional(t.UnionEnum(['active', 'former', 'suspended', 'all'])),
      classId: t.Optional(t.Numeric()),
      scopeId: t.Optional(t.Numeric()),
      avgGradeMin: t.Optional(t.Number()),
      avgGradeMax: t.Optional(t.Number()),
      absenceMin: t.Optional(t.Number()),
      absenceMax: t.Optional(t.Number()),
      missingInfo: t.Optional(t.BooleanString())
		})
  });


export default elysiaApp;
