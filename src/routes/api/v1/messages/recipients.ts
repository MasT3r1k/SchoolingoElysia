import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person } from '../../../../functions/format_person';

// Typ pro jednotlivou osobu (učitel, rodič, dítě)
export interface PersonReference {
  id: number;
  name: string;
  degree: string | null;
}

// Typ pro příjemce zprávy
export interface Recipient {
  id: number;
  name: string;
  degree: string | null;
  role: 'student' | 'teacher' | 'parent' | 'user';
  class?: string; // jen pro studenty
  classTeacher?: PersonReference[]; // jen pro studenty
  parents?: PersonReference[];      // jen pro studenty
  children?: PersonReference[];     // jen pro rodiče
}

// Typ pro výsledek API
export type RecipientsResponse = Recipient[];

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

      let q = db
        .selectFrom('users')
        .innerJoin('persons', 'persons.personId', 'users.person')
        .leftJoin('students', 'students.personId', 'persons.personId')
        .leftJoin('teachers', 'teachers.personId', 'persons.personId')
        .leftJoin('classes', 'classes.classId', 'students.class')
        .leftJoin('school_years', 'school_years.syId', 'classes.yearId')

        // třídní učitel
        .leftJoin('teachers as class_teachers', 'class_teachers.personId', 'classes.teacher')
        .leftJoin('persons as class_teacher_persons', 'class_teacher_persons.personId', 'class_teachers.personId')

        // rodiče
        .leftJoin('family_relations', 'family_relations.target', 'students.personId')
        .leftJoin('persons as parent_persons', 'parent_persons.personId', 'family_relations.source')

        // děti (pro rodiče)
        .leftJoin('family_relations as parent_links', 'parent_links.source', 'persons.personId')
        .leftJoin('students as children_students', 'children_students.personId', 'parent_links.target')
        .leftJoin('persons as children_persons', 'children_persons.personId', 'children_students.personId')

        .select([
          sql`persons.personId`.as('id'),
          sql`concat(persons.firstName, ' ', persons.lastName)`.as('name'),

          // Tituly aktuální osoby
          sql`(
              SELECT GROUP_CONCAT(DISTINCT d.degree SEPARATOR ' ')
              FROM persons_degree d
              WHERE d.person = persons.personId
            )`.as('degree'),

          sql`CASE 
                WHEN teachers.personId IS NOT NULL THEN 'teacher'
                WHEN students.personId IS NOT NULL THEN 'student'
                ELSE 'user'
              END`.as('role'),

          sql`CASE 
                WHEN students.personId IS NOT NULL THEN CONCAT(classes.prefix, (TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1), classes.suffix)
                ELSE NULL
              END`.as('class'),

          // Třídní učitel (JSON objekt, vynechá NULL)
          sql`JSON_ARRAYAGG(
                CASE 
                  WHEN class_teacher_persons.personId IS NOT NULL THEN 
                    JSON_OBJECT(
                      'id', class_teacher_persons.personId,
                      'degree', (
                        SELECT GROUP_CONCAT(DISTINCT d.degree SEPARATOR ' ')
                        FROM persons_degree d
                        WHERE d.person = class_teacher_persons.personId
                      ),
                      'name', CONCAT(class_teacher_persons.firstName, ' ', class_teacher_persons.lastName)
                    )
                  ELSE NULL
                END
              )`.as('class_teacher'),

          // Rodiče (JSON pole, vynechá NULL)
          sql`JSON_ARRAYAGG(
                CASE 
                  WHEN parent_persons.personId IS NOT NULL THEN 
                    JSON_OBJECT(
                      'id', parent_persons.personId,
                      'degree', (
                        SELECT GROUP_CONCAT(DISTINCT d.degree SEPARATOR ' ')
                        FROM persons_degree d
                        WHERE d.person = parent_persons.personId
                      ),
                      'name', CONCAT(parent_persons.firstName, ' ', parent_persons.lastName)
                    )
                  ELSE NULL
                END
              )`.as('parents'),

          // Děti (JSON pole, vynechá NULL)
          sql`JSON_ARRAYAGG(
                CASE 
                  WHEN children_persons.personId IS NOT NULL THEN 
                    JSON_OBJECT(
                      'id', children_persons.personId,
                      'degree', (
                        SELECT GROUP_CONCAT(DISTINCT d.degree SEPARATOR ' ')
                        FROM persons_degree d
                        WHERE d.person = children_persons.personId
                      ),
                      'name', CONCAT(children_persons.firstName, ' ', children_persons.lastName)
                    )
                  ELSE NULL
                END
              )`.as('children'),
        ])
        .where('users.school', '=', current.school)
        .groupBy('persons.personId')
        .orderBy('persons.lastName', 'asc')
        .orderBy('persons.firstName', 'asc')
        .limit(query.limit!)
        .offset(query.offset!);

      // ✳️ Dynamický filtr podle role přihlášeného uživatele
      q = q.where((eb) => {
        switch (current.role) {
          case 'student':
            return eb('teachers.personId', 'is not', null);
          case 'teacher':
            return eb.or([
              eb('students.personId', 'is not', null),
              eb.and([
                eb('teachers.personId', 'is not', null),
                eb('users.person', '!=', current.person),
              ]),
            ]);
          case 'parent':
            return eb('teachers.personId', 'is not', null);
          default:
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

      const rows: RecipientsResponse = await q.execute() as RecipientsResponse;

      // ✳️ Úprava výstupu podle role
      const result = await Promise.all(
        rows.map(async (r) => {
          const clean = async (v: string | null) => {
            if (!v) return [];
            try {
              const arr = JSON.parse(v);
              return Array.isArray(arr)
                ? await Promise.all(
                    arr
                      .filter((x) => x && x.id !== null && x.name !== null)
                      .map(async (x) => ({
                        id: x.id,
                        name: await format_person(x.name, x.degree ? x.degree.split(" ") : [])
                      }))
                  )
                : [];
            } catch {
              return [];
            }
          };

          const base = {
            id: r.id,
            name: await format_person(r.name, r.degree ? r.degree.split(" ") : [])
          };

          if (r.role === 'teacher') {
            return {
              ...base,
              role: 'teacher',
            };
          } else if (r.role === 'student') {
            return {
              ...base,
              role: 'student',
              class: r.class ?? '',
              classTeacher: await clean(r.class_teacher),
              parents: await clean(r.parents),
            };
          } else if (r.role === 'parent') {
            return {
              ...base,
              role: 'parent',
              children: await clean(r.children),
            };
          } else {
            return {
              ...base,
              role: 'user',
            };
          }
        })
      );


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

