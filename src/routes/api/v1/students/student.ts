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
  .get('/student/parent/search', async ({ query: { q } }) => {
    if (!q || q.length < 3) return [];
    
    return await db.selectFrom('persons')
      .select(['personId', 'firstName', 'lastName', 'birthday'])
      .where(sql<boolean>`(
        firstName LIKE ${`%${q}%`} 
        OR lastName LIKE ${`%${q}%`} 
        OR concat(firstName, ' ', lastName) LIKE ${`%${q}%`}
        OR concat(lastName, ' ', firstName) LIKE ${`%${q}%`}
      )`)
      .limit(10)
      .execute();
  }, {
    query: t.Object({
      q: t.String()
    })
  })
  .get('/student/:id', async ({ params: { id }, query }) => {
    try {
      const time = moment(query.time);
      const show = query.type.split(',');

      const [student, groups, parents] = await Promise.all([
        db.selectFrom('students')
          .leftJoin('persons', 'students.personId', 'persons.personId')
          .leftJoin('classes', 'students.class', 'classes.classId')
          .leftJoin('insurance_companies', 'insurance_companies.insuranceId', 'persons.insuranceId')
          .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
          .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
          .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
          .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
          .leftJoin('addresses', 'persons.address', 'addresses.addressId')
          .leftJoin('cities', 'addresses.cityId', 'cities.cityId')
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
            'addresses.addressId',
            'addresses.street',
            'addresses.houseNumber',
            'cities.cityId',
            'cities.cityName as city',
            'cities.postcode',
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
          .where(sql<boolean>`sy.start <= ${time.format("YYYY-MM-DD")}`)
          .where(sql<boolean>`sy.end >= ${time.format("YYYY-MM-DD")}`)
          .execute(),
        
        db.selectFrom('family_relations')
          .innerJoin('persons', 'family_relations.target', 'persons.personId')
          .select([
            'persons.personId as id',
            'persons.firstName',
            'persons.lastName',
            'family_relations.role as relationship',
            sql<string>`(
              SELECT email 
              FROM emails 
              WHERE emails.personId = persons.personId 
              LIMIT 1
            )`.as('email'),
            sql<string>`(
              SELECT number 
              FROM phone_numbers 
              WHERE phone_numbers.personId = persons.personId 
              LIMIT 1
            )`.as('phone')
          ])
          .where('family_relations.source', '=', id)
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
          .where(sql<boolean>`substitution.start_date >= ${time.clone().startOf('isoWeek').format("YYYY-MM-DD")}`)
          .where(sql<boolean>`substitution.end_date <= ${time.clone().endOf('isoWeek').format("YYYY-MM-DD")}`)
          .execute()
      ]);

      const result: any = {};

      if (show.includes('basic')) Object.assign(result, student);
      if (show.includes('groups')) result.groups = groups;
      if (show.includes('parents')) result.parents = parents;
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
      type: t.String({ default: 'basic,groups,timetable,parents' }),
      time: t.String({ default: moment().format("YYYY-MM-DD") })
    })
  })
  .post('/student/:id/parent', async ({ params: { id }, body }) => {
    // @ts-ignore
    const { mode, role, personId, firstName, lastName, email, phone } = body;

    try {
      if (mode === 'existing') {
        if (!personId) throw new Error('Person ID is required for existing mode');
        
        await db.insertInto('family_relations')
          .values({
            source: id,
            target: personId,
            // @ts-ignore
            role: role
          })
          .execute();

        return { success: true };

      } else if (mode === 'new') {
        if (!firstName || !lastName) throw new Error('First name and last name are required');

        const result = await db.transaction().execute(async (trx) => {
          const newPerson = await trx.insertInto('persons')
            .values({
              firstName,
              lastName,
              gender: 1, // Default or need input? Assuming 1 (male) or 2 (female) or 0
              GDPR: false
            })
            .executeTakeFirstOrThrow();
          
          const newPersonId = Number(newPerson.insertId);

          await trx.insertInto('family_relations')
            .values({
              source: id,
              target: newPersonId,
              // @ts-ignore
              role: role
            })
            .execute();

          if (email) {
            await trx.insertInto('emails')
              .values({
                personId: newPersonId,
                email,
                type: 'personal',
                is_verified: false
              })
              .execute();
          }

          if (phone) {
            await trx.insertInto('phone_numbers')
              .values({
                personId: newPersonId,
                number: phone,
                is_verified: false,
                code: 420 // Default czech prefix
              })
              .execute();
          }

          return { success: true, personId: newPersonId };
        });

        return result;
      }

      throw new Error('Invalid mode');

    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to add parent', details: e }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      mode: t.Union([t.Literal('existing'), t.Literal('new')]),
      role: t.String(),
      personId: t.Optional(t.Number()),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String())
    })
  })
  .patch('/student/:id/address', async ({ params: { id }, body }) => {
    const { street, houseNumber, city, postcode } = body;

    try {
      await db.transaction().execute(async (trx) => {
        // 1. Find or create city
        let cityId: number;
        const existingCity = await trx.selectFrom('cities')
          .select('cityId')
          .where('cityName', '=', city)
          .where('postcode', '=', postcode || null)
          .executeTakeFirst();

        if (existingCity) {
          cityId = existingCity.cityId;
        } else {
          const newCity = await trx.insertInto('cities')
            .values({
              cityName: city,
              postcode: postcode || null,
              countryId: 1 // Default to Czech Republic for now, or could be passed
            })
            .executeTakeFirstOrThrow();
          cityId = Number(newCity.insertId);
        }

        // 2. Get person and their addressId
        const person = await trx.selectFrom('persons')
          .select('address')
          .where('personId', '=', id)
          .executeTakeFirstOrThrow();

        if (person.address) {
          // Update existing address
          await trx.updateTable('addresses')
            .set({
              cityId,
              street,
              houseNumber
            })
            .where('addressId', '=', person.address)
            .execute();
        } else {
          // Create new address
          const newAddress = await trx.insertInto('addresses')
            .values({
              cityId,
              street,
              houseNumber
            })
            .executeTakeFirstOrThrow();
          const addressId = Number(newAddress.insertId);

          // Link to person
          await trx.updateTable('persons')
            .set({ address: addressId })
            .where('personId', '=', id)
            .execute();
        }
      });

      return { success: true };
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'Failed to update address', details: e }), { status: 500 });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      street: t.String(),
      houseNumber: t.String(),
      city: t.String(),
      postcode: t.Optional(t.String())
    })
  });

export default elysiaApp;
