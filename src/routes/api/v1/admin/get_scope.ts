import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/system/scope', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.tokenId', 'tokens.userId', 'users.person', 'users.manager', 'users.principal'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };
    if (auth.manager != -1 && auth.principal == false) return { error: 'no_permission' };

    if (query.scope_id == undefined) return { error: 'invalid_query' };

    const scopes_subjects = await db.selectFrom('scopes_subjects')
    .select([
        'scopes_subjects.ss_id',
        'scopes_subjects.subject_id',
        'scopes_subjects.year',
        'scopes_subjects.hours_per_week'
    ])
    .where('scopes_subjects.scope_id', '=', query.scope_id)
    .execute();

    return scopes_subjects;
  }, {
    query: t.Object({
        scope_id: t.Optional(t.Number())
    })
  });

export default app;
