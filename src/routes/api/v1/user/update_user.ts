import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';
import { error } from 'console';

const app = new Elysia()
    .post('/user/update', async ({ cookie, body }: any) => {
      const token = cookie.token?.value as string;
      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .select([
            'users.user_id',
            'users.person_id',
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
                    .where('user_id', '=', user.user_id)
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
                .where('user_id', '=', user.user_id)
                .execute();

                return Response.json({ status: true });
            
            case "UPDATE_AVATAR":
                const { avatar } = body;
                if (!avatar) {
                    return Response.json({ error: 'no_avatar' });
                }

                try {
                    const avatarStr = JSON.stringify(avatar);
                    await db.updateTable("users")
                    .set({ avatar: avatarStr })
                    .where('user_id', '=', user.user_id)
                    .execute();

                    // Also update persons table for consistency
                    if (user.person_id) {
                        await db.updateTable("persons")
                        .set({ avatar: avatarStr })
                        .where('person_id', '=', user.person_id)
                        .execute();
                    }

                    // Remove existing entry to move it to top
                    await db.deleteFrom("avatar_history")
                    .where('user_id', '=', user.user_id)
                    .where('avatar', '=', avatarStr)
                    .execute();

                    await db.insertInto("avatar_history")
                    .values({
                        user_id: user.user_id,
                        avatar: avatarStr
                    })
                    .execute();

                    return Response.json({ status: true });
                } catch(e) {
                    console.error(e);
                    return Response.json({ error: 'db_error' });
                }

            default:
                return Response.json({ error: 'no_method' });
        }
    }, {
        body: t.Object({
            method: t.Optional(t.String()),
            theme: t.Optional(t.Number()),
            language: t.Optional(t.String()),
            avatar: t.Optional(t.Any())
        }),
    })

export default app;
