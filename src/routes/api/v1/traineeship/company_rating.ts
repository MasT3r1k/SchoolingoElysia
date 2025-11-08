import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';

const app = new Elysia()
  .get(
    '/traineeship/company_rating',
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

        const company = await db
        .selectFrom('traineeship_companies as c')
        .leftJoin('traineeship_company_rating as r', 'r.companyId', 'c.companyId')
        .select((eb) => [
          'c.companyId',
          eb.fn.avg('r.rating').as('rating'),
        ])
        .where('c.companyId', '=', companyId)
        .limit(1)
        .executeTakeFirst();

            
        if (!company) {
            return Response.json({ error: 'invalid_company' });
        }

        const reviews = await db
        .selectFrom('traineeship_company_rating')
        .leftJoin('persons', 'persons.personId', 'traineeship_company_rating.studentId')
        .select([
            'traineeship_company_rating.reviewId',
            'traineeship_company_rating.experience',
            'traineeship_company_rating.rating',
            'traineeship_company_rating.is_anon',
            'traineeship_company_rating.would_recommend',
            'traineeship_company_rating.created_at',
            'persons.firstName',
            'persons.lastName',
        ])
        .where('traineeship_company_rating.companyId', '=', companyId)
        .execute()



      return Response.json({
        ...company,
        reviews: reviews.map((review) => ({
            reviewId: review.reviewId,
            experience: review.experience,
            rating: review.rating,
            recommend: review.would_recommend,
            student: review.is_anon ? null : review.firstName + ' ' + review.lastName,
            created_at: review.created_at
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
