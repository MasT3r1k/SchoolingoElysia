import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get(
    '/messages/recipients',
    async ({ cookie, query }) => {
      const token = cookie.token.value;
      if (!token)
        return Response.json({ error: 'no_user', details: 'no_cookie' });

      const current = await db
        .selectFrom('tokens')
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .innerJoin('persons', 'persons.personId', 'users.person')
        .leftJoin('students', 'students.personId', 'persons.personId')
        .leftJoin('teachers', 'teachers.personId', 'persons.personId')
        .select([
          'users.person',
          'users.school',
          sql`CASE 
                WHEN students.personId IS NOT NULL THEN 'student'
                WHEN teachers.personId IS NOT NULL THEN 'teacher'
                ELSE 'user'
              END`.as('role'),
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .executeTakeFirst();

      if (!current)
        return Response.json({ error: 'no_user', details: 'no_db' });

      // Základní dotaz – všichni lidé ve stejné škole
      let q = db
        .selectFrom('users')
        .innerJoin('persons', 'persons.personId', 'users.person')
        .leftJoin('students', 'students.personId', 'persons.personId')
        .leftJoin('teachers', 'teachers.personId', 'persons.personId')
        .leftJoin('classes', 'classes.classId', 'students.class')
        .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
        .select([
          sql`persons.personId`.as('id'),
          sql`concat(persons.firstName, ' ', persons.lastName)`.as('name'),
          sql`CASE 
                WHEN teachers.personId IS NOT NULL THEN 'teacher'
                WHEN students.personId IS NOT NULL THEN 'student'
                ELSE 'user'
              END`.as('role'),
          sql`CASE 
                WHEN students.personId IS NOT NULL THEN CONCAT(classes.prefix, (TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1), classes.suffix)
                ELSE NULL
              END`.as('class'),
        ])
        .where('users.school', '=', current.school)
        .orderBy('persons.lastName', 'asc')
        .orderBy('persons.firstName', 'asc')
        .limit(query.limit!)
        .offset(query.offset!);

      // ✳️ Dynamický filtr podle role přihlášeného uživatele
      q = q.where((eb) => {
        switch (current.role) {
          case 'student':
            // studenti vidí pouze učitele
            return eb('teachers.personId', 'is not', null);
          case 'teacher':
            // učitelé vidí žáky a jiné učitele
            return eb.or([
              eb('students.personId', 'is not', null),
              eb.and([
                eb('teachers.personId', 'is not', null),
                // ale ne sebe
                eb('users.person', '!=', current.person),
              ]),
            ]);
          case 'parent':
            // rodiče vidí jen učitele
            return eb('teachers.personId', 'is not', null);
          default:
            // jiní uživatelé zatím nevidí nikoho
            return eb.val(false);
        }
      });

      // ✳️ Vyhledávání
      if (query.q && query.q.trim() !== '') {
        const like = `%${query.q}%`;
        q = q.where((eb) =>
          eb.or([
            eb('persons.firstName', 'like', like),
            eb('persons.lastName', 'like', like),
          ])
        );
      }

      const rows = await q.execute();

      // ✳️ Úprava výstupu podle role
      const result = rows.map((r) => {
        if (r.role === 'teacher') {
          return {
            id: r.id,
            name: r.name,
            role: 'teacher',
          };
        } else if (r.role === 'student') {
          return {
            id: r.id,
            name: r.name,
            role: 'student',
            class: r.class ?? '',
          };
        } else {
          return {
            id: r.id,
            name: r.name,
            role: 'user',
          };
        }
      });

      return Response.json(result);
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        limit: t.Optional(
          t.Number({ minimum: 1, maximum: 100, default: 50 })
        ),
        offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
      }),
    }
  );

export default app;
