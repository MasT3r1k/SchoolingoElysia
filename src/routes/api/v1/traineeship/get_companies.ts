import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get(
    '/traineeship/companies',
    async ({ cookie, query }) => {
      const token = cookie.token?.value as string;
      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      // Výpočet celkového počtu firem (bez ohledu na limit/offset)
      const countResult = await db
        .selectFrom('traineeship_companies as c')
        .select(({ fn }) => [fn.count('c.companyId').as('total')])
        .executeTakeFirst();

      const companyBuilder = db
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
          'c.status',
          'c.web',
          'c.contact',
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
        .orderBy('c.name');

      // Limit (pokud > 0)
      if (query?.limit && query.limit > 0) {
        companyBuilder.limit(query.limit);
      }

      // Offset (pokud existuje)
      if (query?.offset) {
        companyBuilder.offset(query.offset);
      }

      const companies = await companyBuilder.execute();

      return Response.json({
        rows: countResult?.total ?? 0,
        data: companies,
      });
    },
    {
      query: t.Optional(
        t.Object({
          limit: t.Number({ default: 20 }),
          offset: t.Number({ default: 0 }),
        }),
      ),
    },
  );

export default app;
