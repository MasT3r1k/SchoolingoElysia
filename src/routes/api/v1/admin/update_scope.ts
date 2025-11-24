import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .post('/system/update_school', async ({ cookie, body }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.tokenId', 'tokens.userId', 'users.person', 'users.manager', 'users.principal'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    // === Check permissions ===
    if (auth.manager != -1 && auth.principal == false) return { error: 'no_permission' };

    // === Check school ===
    const school = await db.selectFrom('schools')
    .select([
        'schoolId'
    ])
    .executeTakeFirst();
    if (!school) return { error: 'invalid_school' };

    // === Get Body ===
    try {
        return { success: true }
    } catch(e) {
        return { success: false }
    }
  }, {
    body: t.Object({
        scopeId: t.Number(),
        name: t.String(),
        shortcut: t.String(),
        code: t.String(),
        years: t.Number(),
        students_per_class: t.Number(),
        number_of_classes: t.Number()
    })
   });

export default app;
