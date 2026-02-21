import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .post('/documents/assignfiles', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .innerJoin("passwords", "passwords.password_id", 'users.password_id')
        .select([
            'users.user_id',
            'users.username',
            'users.2fa',
            'users.2fa_secret',
            'passwords.password'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst()

    if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
    }

    try {

        for(const file_id of body.file_ids) {
            db.insertInto('documents')
            .values({
                parent_id: body.parent_id,
                type: 'file',
                file_id
            })
            .executeTakeFirst()
        }

        return { success: true };
    } catch (e) {
      return { error: 'failed_get_files' };
    }
  }, {
    body: t.Object({
        file_ids: t.Array(t.Number()),
        parent_id: t.Nullable(t.Number())
    })
  });

export default elysiaApp;
