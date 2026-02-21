/**
 * Traineeship Settings API Endpoints
 * Manage traineeship configuration and companies
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

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
                isActivated: isActivated ?? undefined,
                manager: manager ?? undefined,
                defaultIgnoreDays: defaultIgnoreDays ?? undefined,
                allowMap: allowMap ?? undefined
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
            .leftJoin('scopes', 'scopes.scope', 'traineeship_company_scopes.scope')
            .select(['scopes.scope', 'scopes.name'])
            .where('traineeship_company_scopes.company', '=', companyId)
            .execute();

        // Get company instructors
        const instructors = await db
            .selectFrom('traineeship_instructors')
            .selectAll()
            .where('company', '=', companyId)
            .execute();

        // Get ratings
        const ratings = await db
            .selectFrom('traineeship_company_rating')
            .selectAll()
            .where('company', '=', companyId)
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

        const { name, address, city, phone, email, website, note, maxStudents } = body;

        const result = await db
            .insertInto('traineeship_companies')
            .values({
                name,
                address: address || null,
                city: city || null,
                phone: phone || null,
                email: email || null,
                website: website || null,
                note: note || null,
                max_students: maxStudents || 5,
                isActivated: true
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
