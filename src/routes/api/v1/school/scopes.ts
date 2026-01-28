import { Elysia } from 'elysia';
import { db } from '../../../../../database'

const elysiaApp = new Elysia()
  .get('/scopes', async () => {
    const scopes = await 
        db.selectFrom("scopes")
        .select([
            'scopes.scopeId',
            'scopes.name as scopeName',
            'scopes.shortcut as scopeShort',
            'scopes.code as scopeCode',
            'scopes.years',
            'scopes.is_active'
        ])
        .execute()

    return Response.json(scopes);
  });

export default elysiaApp;
