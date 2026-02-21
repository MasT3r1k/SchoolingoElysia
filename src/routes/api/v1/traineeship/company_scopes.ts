import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';


const app = new Elysia()
  .post(
    '/traineeship/company_scopes',
    async ({ body, cookie }) => {
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

        const { companyId, scopes } = body;

        if (!companyId || isNaN(companyId)) {
            return Response.json({ error: 'invalid_company_id' }); // Nevalidní companyId
        }

        if (!Array.isArray(scopes)) {
            return Response.json({ error: 'invalid_scopes' }); // scopes je prázdné
        }

        const teacher = await db
        .selectFrom('teachers')
        .select(['person_id'])
        .where('person_id', '=', auth.person_id)
        .limit(1)
        .execute();

        if (!teacher.length) {
            return Response.json({ error: 'no_permission' });
        }

        // 1. Kontrola existence firmy
        const companyExists = await db
            .selectFrom('traineeship_companies')
            .select(({ fn }) => fn.count<number>('company_id').as('count'))
            .where('company_id', '=', companyId)
            .executeTakeFirst();

        if (!companyExists || companyExists.count === 0) {
            return Response.json({ error: 'invalid_company' }); // firma neexistuje
        }

        // 2. Načíst aktivní scopes
        const currentScopes = await db
            .selectFrom('traineeship_company_scopes')
            .select(['scope_id'])
            .where('company_id', '=', companyId)
            .where('status', '=', true)
            .execute();

        const currentScopeIds = currentScopes.map(s => s.scope_id);
        const newScopeIds: number[] = scopes;

        const toDeactivate = currentScopeIds.filter(s => !newScopeIds.includes(s));
        const toAdd = newScopeIds.filter(s => !currentScopeIds.includes(s));

        // 3. Deaktivace scope
        if (toDeactivate.length > 0) {
            await db
            .updateTable('traineeship_company_scopes')
            .set({ status: false })
            .where('company_id', '=', companyId)
            .where('scope_id', 'in', toDeactivate)
            .execute();
        }

        // 4. Přidání / aktivace scope
        for (const scopeId of toAdd) {
            const existing = await db
            .selectFrom('traineeship_company_scopes')
            .select(['tscs_id'])
            .where('company_id', '=', companyId)
            .where('scope_id', '=', scopeId)
            .executeTakeFirst();

            if (existing) {
            await db
                .updateTable('traineeship_company_scopes')
                .set({ status: true })
                .where('tscs_id', '=', existing.tscs_id)
                .execute();
            } else {
            await db
                .insertInto('traineeship_company_scopes')
                .values({
                company_id: companyId,
                scope_id: scopeId,
                status: true
                })
                .execute();
            }
        }

        return Response.json({
            status: 'success',
            companyId,
            scopes: newScopeIds
        });
    },
    {
      body: t.Object({
        companyId: t.Number(),
        scopes: t.Array(t.Number())
      })
    }
  );

export default app;
