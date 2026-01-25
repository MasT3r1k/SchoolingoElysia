import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';

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

const elysiaApp = new Elysia()
  .get('/students', async({ query }) => {
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
        'persons.gender',
        'students.status',
        fullName,
        sql<string>`(SELECT email FROM emails WHERE emails.personId = persons.personId AND emails.is_verified = 1 LIMIT 1)`.as('email'),
        sql<string>`(SELECT number FROM phone_numbers WHERE phone_numbers.personId = persons.personId AND phone_numbers.is_verified = 1 LIMIT 1)`.as('phone'),
        'persons.birthday',
        sql<string>`students.startStudy`.as('startStudy'),
        sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className'),
        sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('year'),
        'classes.scopeId',
        sql<string>`scopes.name`.as('fieldOfStudy'),
        sql<string>`(
            SELECT ROUND(SUM(g.mark * gc.weight) / NULLIF(SUM(gc.weight), 0), 2)
            FROM grades g
            LEFT JOIN grades_columns gc ON gc.gcId = g.columnId
            WHERE g.studentId = students.personId
            AND gc.status = 'active'
            AND g.mark IS NOT NULL
        )`.as('averageGrade'),
        sql<string>`(
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

    // Apply Filters
    if (query.search) {
      const search = `%${query.search}%`;
      queryBuilder = queryBuilder.where((eb) => eb.or([
        eb('persons.firstName', 'like', search),
        eb('persons.lastName', 'like', search),
      ]))
    }

    if (query.status && query.status !== 'all') {
      let dbStatus = query.status;
      queryBuilder = queryBuilder.where('students.status', '=', dbStatus);
    }

    if (query.classId) {
       queryBuilder = queryBuilder.where('classes.classId', '=', query.classId);
    }

    if (query.scopeId) {
      queryBuilder = queryBuilder.where('classes.scopeId', '=', query.scopeId);
    }
    
    // Average Grade & Absence (Having clauses)
    if (query.avgGradeMin !== undefined) {
      queryBuilder = queryBuilder.having(sql`CAST(averageGrade AS DECIMAL(4,2))`, '>=', query.avgGradeMin)
    }
    if (query.avgGradeMax !== undefined) {
      queryBuilder = queryBuilder.having(sql`CAST(averageGrade AS DECIMAL(4,2))`, '<=', query.avgGradeMax)
    }
    
    if (query.absenceMin !== undefined) {
      queryBuilder = queryBuilder.having(sql`CAST(absenceRate AS DECIMAL(5,2))`, '>=', query.absenceMin)
    }
    if (query.absenceMax !== undefined) {
      queryBuilder = queryBuilder.having(sql`CAST(absenceRate AS DECIMAL(5,2))`, '<=', query.absenceMax)
    }

    if (query.missingInfo) {
      // TODO edit to count total emails and phones
      // Using HAVING for subqueries email/phone
      queryBuilder = queryBuilder.having((eb) => eb.or([
        eb('email', 'is', null),
        eb('phone', 'is', null)
      ]))
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
      .limit(query.limit!)
      .offset(query.offset!)
      .execute();

    return Response.json({
      data: results,
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
