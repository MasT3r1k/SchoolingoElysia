/**
 * Traineeship Settings API Endpoints
 * Manage traineeship configuration and companies
 */
import { Elysia, t } from 'elysia';
import { db } from '@database';

const app = new Elysia()
    // Get traineeship config
    .get('/config', async ({ cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const config = await db
            .selectFrom('traineeship_config')
            .selectAll()
            .executeTakeFirst();

        return Response.json({ config });
    })

    // Update traineeship config (admin only)
    .put('/config', async ({ body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const { isActivated, manager, defaultIgnoreDays, allowMap } = body;

        await db
            .updateTable('traineeship_config')
            .set({
                is_activated: isActivated ?? undefined,
                manager_id: manager ?? undefined,
                default_ignore_days: defaultIgnoreDays ?? undefined,
                allow_map: allowMap ?? undefined
            })
            .execute();

        return Response.json({ success: true });
    }, {
        body: t.Object({
            isActivated: t.Optional(t.Boolean()),
            manager: t.Optional(t.Number()),
            defaultIgnoreDays: t.Optional(t.String()),
            allowMap: t.Optional(t.Boolean())
        })
    })

    // Get traineeship companies
    .get('/companies', async ({ cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const companies = await db
            .selectFrom('traineeship_companies')
            .selectAll()
            .orderBy('name', 'asc')
            .execute();

        return Response.json({ companies });
    })

    // Get single company
    .get('/companies/:id', async ({ params, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const companyId = parseInt(params.id);

        const company = await db
            .selectFrom('traineeship_companies')
            .selectAll()
            .where('company_id', '=', companyId)
            .executeTakeFirst();

        if (!company) {
            return Response.json({ error: 'not_found' }, { status: 404 });
        }

        // Get company scopes
        const scopes = await db
            .selectFrom('traineeship_company_scopes')
            .leftJoin('scopes', 'scopes.scope_id', 'traineeship_company_scopes.scope_id')
            .select(['scopes.scope_id', 'scopes.name'])
            .where('traineeship_company_scopes.company_id', '=', companyId)
            .execute();

        // Get company instructors
        const instructors = await db
            .selectFrom('traineeship_instructors')
            .selectAll()
            .where('company_id', '=', companyId)
            .execute();

        // Get ratings
        const ratings = await db
            .selectFrom('traineeship_company_rating')
            .selectAll()
            .where('company_id', '=', companyId)
            .orderBy('created_at', 'desc')
            .limit(10)
            .execute();

        return Response.json({ company, scopes, instructors, ratings });
    }, {
        params: t.Object({ id: t.String() })
    })

    // Create company (admin only)
    .post('/companies', async ({ body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const { name, phone, email, website, note } = body;

        const result = await db
            .insertInto('traineeship_companies')
            .values({
                name,
                address_office: 0,
                address_trainee: 0,
                country_code: 'CZ',
                ico: '',
                dic: '',
                vat_id: '',
                web: website || null,
                phone: phone || null,
                email: email || null,
                description: note || null,
                contact: null,
                rp_first_name: null,
                rp_last_name: null,
                activity: null,
                equipment: null,
                status: 'approved'
            })
            .execute();

        return Response.json({ company_id: Number(result[0].insertId), success: true });
    }, {
        body: t.Object({
            name: t.String(),
            address: t.Optional(t.String()),
            city: t.Optional(t.String()),
            phone: t.Optional(t.String()),
            email: t.Optional(t.String()),
            website: t.Optional(t.String()),
            note: t.Optional(t.String()),
            maxStudents: t.Optional(t.Number())
        })
    })

    // Update company
    .put('/companies/:id', async ({ params, body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const companyId = parseInt(params.id);

        await db
            .updateTable('traineeship_companies')
            .set(body as any)
            .where('company_id', '=', companyId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            name: t.Optional(t.String()),
            address: t.Optional(t.String()),
            city: t.Optional(t.String()),
            phone: t.Optional(t.String()),
            email: t.Optional(t.String()),
            website: t.Optional(t.String()),
            note: t.Optional(t.String()),
            maxStudents: t.Optional(t.Number()),
            isActivated: t.Optional(t.Boolean())
        })
    })

    // Delete company
    .delete('/companies/:id', async ({ params, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('traineeship_companies')
            .where('company_id', '=', parseInt(params.id))
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() })
    });

export default app;
