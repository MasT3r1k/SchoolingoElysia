import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';

const app = new Elysia()
  .post(
    '/traineeship/company_update',
    async ({ body, cookie }) => {
        const token = cookie.token?.value as string;

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

        const teacher = await db
        .selectFrom('teachers')
        .select(['personId'])
        .where('personId', '=', auth.person)
        .limit(1)
        .execute();

        if (!teacher.length) {
            return Response.json({ error: 'no_permission' });
        }

        const { companyId } = body;

        if (!companyId) {
            return Response.json({ error: 'invalid_company_id' });
        }

        // Načti firmu
        const company = await db
        .selectFrom('traineeship_companies')
        .select(['companyId'])
        .where('companyId', '=', companyId)
        .limit(1)
        .executeTakeFirst();

        if (!company) {
            return Response.json({ error: 'invalid_company' });
        }

        const { types, values } = body;

        try {
            if (!types || !values || !types.length || !values.length) {
                return Response.json({ error: 'invalid_data' });
            }

            let valid_types: string[] = [];
            for(let type of types) {
                if ([
                    'activity',
                    'equipment',
                    'description',
                    'name',
                    'rp_firstName',
                    'rp_lastName',
                    'email',
                    'phone'
                ].includes(type)) {
                    valid_types.push(type);
                }
            }

            if (!valid_types.length) {
                return Response.json({ error: 'invalid_type' });
            }

            let update_data: any = {};
            for (let i = 0;i<types.length;i++) {
                if (!valid_types.includes(types[i])) continue;
                update_data[types[i]] = values[i];
            }

            const update_company = await db
            .updateTable("traineeship_companies")
            .set(update_data)
            .where('companyId', '=', companyId)
            .limit(1)
            .execute()

            return Response.json(
                {
                    status: true,
                    message: 'updated_company',
                    companyId,
                    types,
                    values
                }
            );
        } catch(e) {
            return Response.json({
                status: false,
                error: 'failed_update_company',
                companyId,
                types,
                values
            });
        }
    },
    {
      body: t.Object({
        companyId: t.Number(),
        types: t.Optional(t.ArrayString()),
        values: t.Optional(t.ArrayString())
      }),
    },
  );

export default app;
