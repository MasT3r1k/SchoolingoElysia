import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';

const app = new Elysia()
  .get(
    '/traineeship/company_info',
    async ({ query, cookie }) => {
      const token = cookie.token.value;

      if (!token) {
          return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.userId', 'users.userId')
      .select(['tokens.userId', 'users.person'])
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
        .leftJoin('traineeship_company_rating as r', 'r.companyId', 'c.companyId')
        .leftJoin('addresses as a', 'a.addressId', 'c.addressOffice')
        .leftJoin('cities as ci', 'ci.cityId', 'a.cityId')
        .leftJoin('countries as co', 'co.countryId', 'ci.countryId')
        .leftJoin('traineeship_company_scopes as cs', 'cs.companyId', 'c.companyId')
        .leftJoin('scopes as s', 's.scopeId', 'cs.scopeId')
        .select((eb) => [
          'c.companyId',
          'c.name',
          'c.countryCode',
          'c.ico',
          'c.dic',
          'c.web',
          'c.rp_firstName',
          'c.rp_lastName',
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
          'a.houseNumber',
          'ci.cityName',
          'ci.postcode',
          'co.code2',
          eb.fn.avg('r.rating').as('rating'),
          // Agregace oborů do JSON pole
          sql<string>`
            JSON_ARRAYAGG(
              DISTINCT JSON_OBJECT(
                'scopeId', s.scopeId,
                'scopeName', s.name,
                'scopeShortcut', s.shortcut,
                'status', IFNULL(cs.status, 0)
              )
            )
          `.as('scopes'),
        ])
        .groupBy('c.companyId')
        .orderBy('c.name')
        .where('c.companyId', '=', companyId)
        .limit(1)
        .executeTakeFirst();

            
        if (!company) {
            return Response.json({ error: 'invalid_company' });
        }

      // Načti instruktory
      const instructors = await db
        .selectFrom('traineeship_instructors')
        .leftJoin('persons', 'persons.personId', 'traineeship_instructors.personId')
        .select([
          'persons.personId',
          'firstName',
          'lastName'
        ])
        .where('companyId', '=', companyId)
        .execute();

      // Načti osoby instruktorů

      return Response.json({
        ...company,
        instructors: instructors.map((instructor) => ({
          instructorId: instructor.personId,
          name: `${instructor.firstName} ${instructor.lastName}`
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
