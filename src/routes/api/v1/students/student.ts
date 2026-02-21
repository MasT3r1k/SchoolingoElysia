import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_by_id } from '../../../../functions/format_person_by_id';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

/* ---------------- ENDPOINT ---------------- */

const elysiaApp = new Elysia()
  .get('/student/parent/search', async ({ query: { q } }) => {
    if (!q || q.length < 3) return [];
    
    return await db.selectFrom('persons')
      .select(['person_id', 'first_name', 'last_name', 'birthday'])
      .where(sql<boolean>`(
        first_name LIKE ${`%${q}%`} 
        OR last_name LIKE ${`%${q}%`} 
        OR concat(first_name, ' ', last_name) LIKE ${`%${q}%`}
        OR concat(last_name, ' ', first_name) LIKE ${`%${q}%`}
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

      const [studentResult, groups, parents] = await Promise.all([
        db.selectFrom('students')
          .leftJoin('persons', 'students.person_id', 'persons.person_id')
          .leftJoin('classes', 'students.class_id', 'classes.class_id')
          .leftJoin('insurance_companies', 'insurance_companies.insurance_id', 'persons.insurance_id')
          .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
          .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
          .leftJoin('addresses', 'persons.address_id', 'addresses.address_id')
          .leftJoin('cities', 'addresses.city_id', 'cities.city_id')
          .select([
            'persons.person_id',
            'persons.first_name',
            'persons.last_name',
            'persons.gender',
            'persons.birthday',
            'students.status',
            sql`students.start_study`.as('start_study'),
            sql`concat(
              classes.prefix,
              TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1,
              classes.suffix
            )`.as('class_name'),
            'insurance_companies.insurance_id',
            sql`insurance_companies.insurance`.as('insurance_name'),
            sql`insurance_companies.shortcut`.as('insurance_short'),
            sql<number>`TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1`.as('year'),
            'classes.scope_id',
            'classes.teacher_id',
            sql<string>`scopes.name`.as('field_of_study'),
            'addresses.address_id',
            'addresses.street',
            'addresses.house_number',
            'cities.city_id',
            'cities.city_name as city_name',
            'cities.postcode',
            sql<string>`(
              SELECT email 
              FROM emails 
              WHERE emails.person_id = persons.person_id 
              AND emails.is_verified = 1 
              LIMIT 1
            )`.as('email'),

            sql<string>`(
              SELECT number 
              FROM phone_numbers 
              WHERE phone_numbers.person_id = persons.person_id 
              AND phone_numbers.is_verified = 1 
              LIMIT 1
            )`.as('phone'),

            sql<number>`(
              SELECT ROUND(
                SUM(g.mark * gc.weight) / NULLIF(SUM(gc.weight), 0),
                2
              )
              FROM grades g
              LEFT JOIN grades_columns gc ON gc.column_id = g.column_id
              WHERE g.student_id = students.person_id
              AND gc.status = 'active'
              AND g.mark IS NOT NULL
            )`.as('average_grade'),

            sql<number>`(
              SELECT ROUND(
                CASE 
                  WHEN COUNT(DISTINCT c.classbook_id) = 0 THEN 0
                  ELSE (COUNT(a.student_id) * 100.0) / COUNT(DISTINCT c.classbook_id)
                END,
                2
              )
              FROM student_groups sg
              LEFT JOIN classbook c ON c.group_id = sg.group_id
              LEFT JOIN absence a 
                ON a.lesson_id = c.classbook_id 
                AND a.student_id = students.person_id
              WHERE sg.student_id = students.person_id
            )`.as('absence_rate')
          ])
          .where('persons.person_id', '=', id)
          .executeTakeFirstOrThrow(),

        db.selectFrom('student_groups')
          .innerJoin('groups', 'student_groups.group_id', 'groups.group_id')
          .innerJoin('school_years as sy', 'groups.year_id', 'sy.sy_id')
          .select([
            'groups.group_id',
            'groups.name',
            'groups.num',
          ])
          .where('student_groups.student_id', '=', id)
          .where(sql<boolean>`sy.start <= ${time.format("YYYY-MM-DD")}`)
          .where(sql<boolean>`sy.end >= ${time.format("YYYY-MM-DD")}`)
          .execute(),
        
        db.selectFrom('family_relations')
          .innerJoin('persons', 'family_relations.target_id', 'persons.person_id')
          .select([
            'persons.person_id as id',
            'persons.first_name',
            'persons.last_name',
            'family_relations.role as relationship',
            sql<string>`(
              SELECT email 
              FROM emails 
              WHERE emails.person_id = persons.person_id 
              LIMIT 1
            )`.as('email'),
            sql<string>`(
              SELECT number 
              FROM phone_numbers 
              WHERE phone_numbers.person_id = persons.person_id 
              LIMIT 1
            )`.as('phone')
          ])
          .where('family_relations.source_id', '=', id)
          .execute()
      ]);

      const groupIds = groups.length ? groups.map(g => g.group_id) : [-1];

      const [timetableResult, substitutionResult] = await Promise.all([
        db.selectFrom('timetable')
          .innerJoin('subjects', 'timetable.subject_id', 'subjects.subject_id')
          .leftJoin('persons', 'timetable.teacher_id', 'persons.person_id')
          .select([
            sql`(timetable.day + 1) % 7`.as('day'),
            'timetable.hour',
            'timetable.type',
            sql`subjects.label`.as('subject_name'),
            sql`subjects.shortcut`.as('subject_shortcut'),
            'persons.person_id as teacher_id'
          ])
          .where('timetable.group_id', 'in', groupIds)
          .execute(),

        db.selectFrom('substitution')
          .leftJoin('subjects', 'substitution.subject_id', 'subjects.subject_id')
          .leftJoin('persons', 'substitution.teacher_id', 'persons.person_id')
          .select([
            'substitution.start_date',
            'substitution.start_hour',
            'substitution.end_date',
            'substitution.end_hour',
            sql`subjects.label`.as('subject_name'),
            sql`subjects.shortcut`.as('subject_shortcut'),
            'persons.person_id as teacher_id'
          ])
          .where('substitution.group_id', 'in', groupIds)
          .where(sql<boolean>`substitution.start_date >= ${time.clone().startOf('isoWeek').format("YYYY-MM-DD")}`)
          .where(sql<boolean>`substitution.end_date <= ${time.clone().endOf('isoWeek').format("YYYY-MM-DD")}`)
          .execute()
      ]);

      const teacherIds = [
        ...timetableResult.map(t => t.teacher_id).filter((id): id is number => id !== null),
        ...substitutionResult.map(s => s.teacher_id).filter((id): id is number => id !== null)
      ];
      const teacherNameMap = await format_person_map_by_ids(teacherIds);

      const timetable = timetableResult.map(t => ({
        ...t,
        teacher: t.teacher_id ? teacherNameMap.get(t.teacher_id) : ''
      }));

      const substitution = substitutionResult.map(s => ({
        ...s,
        teacher: s.teacher_id ? teacherNameMap.get(s.teacher_id) : ''
      }));

      const result: any = {};

      if (show.includes('basic')) {
        Object.assign(result, studentResult);
        if (studentResult.person_id) {
          result.full_name = await format_person_by_id(studentResult.person_id);
        }
      }
      if (show.includes('groups')) result.groups = groups;
      if (show.includes('parents')) result.parents = parents;
      if (show.includes('timetable')) {
        result.timetable = timetable;
        result.substitution = substitution;
      }

      if (studentResult.teacher_id) {
        result.teacher_name = await format_person_by_id(studentResult.teacher_id);
      }

      return Response.json(result);

    } catch (e) {
      console.error(e);
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
              first_name: firstName,
              last_name: lastName,
              gender: 0
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
                person_id: newPersonId,
                email,
                type: 'personal',
                is_verified: false
              })
              .execute();
          }

          if (phone) {
            await trx.insertInto('phone_numbers')
              .values({
                person_id: newPersonId,
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
          .select('city_id')
          .where('city_name', '=', city)
          .where('postcode', '=', postcode || null)
          .executeTakeFirst();

        if (existingCity) {
          cityId = existingCity.city_id;
        } else {
          const newCity = await trx.insertInto('cities')
            .values({
              city_name: city,
              postcode: postcode || null,
              country_id: 1 // Default to Czech Republic for now, or could be passed
            })
            .executeTakeFirstOrThrow();
          cityId = Number(newCity.insertId);
        }

        // 2. Get person and their addressId
        const person = await trx.selectFrom('persons')
          .select('address_id')
          .where('person_id', '=', id)
          .executeTakeFirstOrThrow();

        if (person.address_id) {
          // Update existing address
          await trx.updateTable('addresses')
            .set({
              city_id: cityId,
              street,
              house_number: houseNumber
            })
            .where('address_id', '=', person.address_id)
            .execute();
        } else {
          // Create new address
          const newAddress = await trx.insertInto('addresses')
            .values({
              city_id: cityId,
              street,
              house_number: houseNumber
            })
            .executeTakeFirstOrThrow();
          const addressId = Number(newAddress.insertId);

          // Link to person
          await trx.updateTable('persons')
            .set({ address_id: addressId })
            .where('person_id', '=', id)
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
