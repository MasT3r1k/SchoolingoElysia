import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';

const app = new Elysia()
  .get(
    '/traineeship/company_info',
    async ({ query, cookie }) => {
      const token = cookie.token?.value as string;

      if (!token) {
          return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.user_id', 'users.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

      if (!auth) {
          return Response.json({ error: 'no_user', details: 'no_db' });
      }

      const { companyId } = query;

      if (!companyId) {
        return Response.json({ error: 'invalid_company_id' });
      }

      // Načti firmu
      const company = await db
        .selectFrom('traineeship_companies as c')
        .leftJoin('traineeship_company_rating as r', 'r.company_id', 'c.company_id')
        .leftJoin('addresses as a', 'a.address_id', 'c.address_office')
        .leftJoin('cities as ci', 'ci.city_id', 'a.city_id')
        .leftJoin('countries as co', 'co.country_id', 'ci.country_id')
        .leftJoin('traineeship_company_scopes as cs', 'cs.company_id', 'c.company_id')
        .leftJoin('scopes as s', 's.scope_id', 'cs.scope_id')
        .select((eb) => [
          'c.company_id',
          'c.name',
          'c.country_code',
          'c.ico',
          'c.dic',
          'c.web',
          'c.rp_first_name',
          'c.rp_last_name',
          'c.email',
          'c.phone',
          'c.status',
          'c.requested',
          'c.created',
          'c.contact',
          'c.description',
          'c.activity',
          'c.equipment',
          'a.street',
          'a.house_number',
          'ci.city_name',
          'ci.postcode',
          'co.code2',
          eb.fn.avg('r.rating').as('rating'),
          // Agregace oborů do JSON pole
          sql<string>`
            JSON_ARRAYAGG(
              DISTINCT JSON_OBJECT(
                'scope_id', s.scope_id,
                'scopeName', s.name,
                'scopeShortcut', s.shortcut,
                'status', IFNULL(cs.status, 0)
              )
            )
          `.as('scopes'),
        ])
        .groupBy('c.company_id')
        .orderBy('c.name')
        .where('c.company_id', '=', companyId)
        .limit(1)
        .executeTakeFirst();

            
        if (!company) {
            return Response.json({ error: 'invalid_company' });
        }

      // Načti instruktory
      const instructors = await db
        .selectFrom('traineeship_instructors')
        .select([
          'traineeship_instructors.instructor_id',
          'traineeship_instructors.firstname',
          'traineeship_instructors.lastname',
          'traineeship_instructors.email',
          'traineeship_instructors.phone',
          'traineeship_instructors.role',
          'traineeship_instructors.status',
          'traineeship_instructors.created',
          'traineeship_instructors.last_updated'
        ])
        .where('company_id', '=', companyId)
        .execute();

      return Response.json({
        ...company,
        instructors: instructors.map((instructor) => ({
          instructorId: instructor.instructor_id,
          name: `${instructor.firstname} ${instructor.lastname}`,
          firstname: instructor.firstname,
          lastname: instructor.lastname,
          email: instructor.email,
          phone: instructor.phone,
          role: instructor.role,
          status: instructor.status,
          created: instructor.created,
          last_updated: instructor.last_updated
        }))
      });
    },
    {
      query: t.Object({
        companyId: t.Number(),
      }),
    },
  );

export default app;
