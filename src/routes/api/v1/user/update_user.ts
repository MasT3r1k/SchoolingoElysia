import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';
import { error } from 'console';

const app = new Elysia()
    .post('/user/update', async ({ cookie, body }: any) => {
      const token = cookie.token.value;
      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .select([
            'users.userId',
            'users.username',
            'users.2fa',
            'users.2fa_activated',
            'users.2fa_secret',
            'users.fastlogin'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst()

      if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
      }


      const { method } = body;
      if (!method || method == "") return Response.json({ error: 'no_method' });

        switch(method) {
            case "UPDATE_THEME":
                const { theme } = body;
                if (theme == undefined || parseInt(theme) < 0 || isNaN(theme)) {
                    return Response.json({ error: 'no_theme' });
                }

                try {
                    await db.updateTable("users")
                    .set({ theme })
                    .where('userId', '=', user.userId)
                    .execute();
    
                    return Response.json({ status: true });
                } catch(e) {
                    return Response.json({ error: 'db_error' });
                }

            
            case "UPDATE_LANGUAGE":
                const { language } = body;
                if (!language || language == "") {
                    return Response.json({ error: 'no_language' });
                }

                await db.updateTable("users")
                .set({ locale: language })
                .where('userId', '=', user.userId)
                .execute();

                return Response.json({ status: true });
            

            default:
                return Response.json({ error: 'no_method' });
        }
    }, {
        body: t.Object({
            method: t.Optional(t.String()),
            theme: t.Optional(t.Number()),
            language: t.Optional(t.String())
        }),
    })

export default app;
