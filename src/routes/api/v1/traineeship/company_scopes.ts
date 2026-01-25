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
        .leftJoin('users', 'tokens.userId', 'users.userId')
        .select(['tokens.userId', 'users.person'])
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
        .select(['personId'])
        .where('personId', '=', auth.person)
        .limit(1)
        .execute();

        if (!teacher.length) {
            return Response.json({ error: 'no_permission' });
        }

        // 1. Kontrola existence firmy
        const companyExists = await db
            .selectFrom('traineeship_companies')
            .select(({ fn }) => fn.count<number>('companyId').as('count'))
            .where('companyId', '=', companyId)
            .executeTakeFirst();

        if (!companyExists || companyExists.count === 0) {
            return Response.json({ error: 'invalid_company' }); // firma neexistuje
        }

        // 2. Načíst aktivní scopes
        const currentScopes = await db
            .selectFrom('traineeship_company_scopes')
            .select(['scopeId'])
            .where('companyId', '=', companyId)
            .where('status', '=', true)
            .execute();

        const currentScopeIds = currentScopes.map(s => s.scopeId);
        const newScopeIds: number[] = scopes;

        const toDeactivate = currentScopeIds.filter(s => !newScopeIds.includes(s));
        const toAdd = newScopeIds.filter(s => !currentScopeIds.includes(s));

        // 3. Deaktivace scope
        if (toDeactivate.length > 0) {
            await db
            .updateTable('traineeship_company_scopes')
            .set({ status: false })
            .where('companyId', '=', companyId)
            .where('scopeId', 'in', toDeactivate)
            .execute();
        }

        // 4. Přidání / aktivace scope
        for (const scopeId of toAdd) {
            const existing = await db
            .selectFrom('traineeship_company_scopes')
            .select(['tscsId'])
            .where('companyId', '=', companyId)
            .where('scopeId', '=', scopeId)
            .executeTakeFirst();

            if (existing) {
            await db
                .updateTable('traineeship_company_scopes')
                .set({ status: true })
                .where('tscsId', '=', existing.tscsId)
                .execute();
            } else {
            await db
                .insertInto('traineeship_company_scopes')
                .values({
                companyId,
                scopeId,
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
