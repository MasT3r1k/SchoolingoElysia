import { app } from "../../../index";
import Elysia, { t } from "elysia";
import { ip } from "elysia-ip";
import { rateLimit } from "elysia-rate-limit";
import { db } from "../../../database";
import moment from "moment";

const elysiaApp = new Elysia()
  .post('/remove-passkey', async ({ cookie, body }: any) => {
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

    const passkey = await db.selectFrom("users_credentials")
        .select([
            "users_credentials.id",
            "users_credentials.device_name",
            "users_credentials.user_id"
        ])
        .where("users_credentials.id", "=", body.keyId)
        .where("users_credentials.user_id", "=", user.user_id)
        .limit(1)
        .executeTakeFirst()

    if (!passkey) return Response.json({ deleted: false, error: 'no_passkey' });

    try {
        db.deleteFrom("users_credentials")
        .where("users_credentials.id", "=", body.keyId)
        .where("users_credentials.user_id", "=", user.user_id)
        .limit(1)
        .execute();
        return Response.json({ deleted: true, id: body.keyId });
    } catch(e) {
        return Response.json({ deleted: false, error: 'unknown' });
    }

  }, {
    body: t.Object({
        keyId: t.Number()
    })
  })


export default elysiaApp;
