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

      const { limit, offset, name, status } = query ?? {};

      let countQuery = db
        .selectFrom('traineeship_companies as c')
        .select(({ fn }) => [fn.count('c.companyId').as('total')]);

      let companyBuilder = db
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

      if (name) {
        countQuery = countQuery.where('c.name', 'like', `%${name.trim()}%`);
        companyBuilder = companyBuilder.where('c.name', 'like', `%${name.trim()}%`);
      }

      if (status) {
        // @ts-ignore
        countQuery = countQuery.where('c.status', '=', status);
        // @ts-ignore
        companyBuilder = companyBuilder.where('c.status', '=', status);
      }

      const countResult = await countQuery.executeTakeFirst();

      // Limit (pokud > 0)
      if (limit && limit > 0) {
        companyBuilder = companyBuilder.limit(limit);
      }

      // Offset (pokud existuje)
      if (offset) {
        companyBuilder = companyBuilder.offset(offset);
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
          limit: t.Optional(t.Numeric({ default: 20 })),
          offset: t.Optional(t.Numeric({ default: 0 })),
          name: t.Optional(t.String()),
          status: t.Optional(t.Union([
            t.Literal('approved'),
            t.Literal('acceptable'),
            t.Literal('request'),
            t.Literal('deleted')
          ]))
        }),
      ),
    },
  );

export default app;
