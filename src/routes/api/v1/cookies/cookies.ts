import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/cookies', async ({ cookie, body }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    const { cookies } = body;
    if (cookies == undefined) return { error: 'no_cookies' };
    
    try {
        const updateCookie = await db.updateTable('users')
        .set({
            cookies
        })
        .where('users.userId', '=', auth.userId)
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
