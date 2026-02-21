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
        .select(({ fn }) => [fn.count('c.company_id').as('total')]);

      let companyBuilder = db
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
          'c.status',
          'c.web',
          'c.contact',
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
                'scope_name', s.name,
                'scope_shortcut', s.shortcut,
                'status', IFNULL(cs.status, 0)
              )
            )
          `.as('scopes'),
        ])
        .groupBy('c.company_id')
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
