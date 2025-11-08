import { Elysia } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';

const app = new Elysia()
  .get('/traineeship/scopes', async ({ cookie }) => {
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

    const scopes = await db
    .selectFrom('scopes')
    .select([
      'scopes.scopeId',
      'scopes.name',
      'scopes.shortcut',
      'scopes.code'
    ])
    .execute()

    return Response.json(scopes)
  });

export default app;