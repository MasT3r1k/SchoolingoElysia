import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/cookies', async ({ cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select([
        'tokens.user_id',
        'users.person_id',
        'users.cookies'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    return { success: true, cookies: auth?.cookies ?? 0 };
  })

  .post('/cookies', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const { cookies } = body;
    if (cookies == undefined) return { error: 'no_cookies' };
    
    try {
        const updateCookie = await db.updateTable('users')
        .set({ cookies })
        .where('users.user_id', '=', auth.user_id)
        .executeTakeFirst();

        return { success: true };
    } catch(e) {
        return { success: false }
    }
  }, {
    body: t.Object({
      cookies: t.Optional(t.Number())
    })
  });

export default app;
