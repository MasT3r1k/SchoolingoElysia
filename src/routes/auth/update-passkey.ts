import { app } from "../../../index";
import Elysia, { t } from "elysia";
import { ip } from "elysia-ip";
import { rateLimit } from "elysia-rate-limit";
import { db } from "../../../database";
import moment from "moment";

const elysiaApp = new Elysia()
  .post('/update-passkey', async ({ cookie, body }: any) => {
    const token = cookie.token?.value as string;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .innerJoin("passwords", "passwords.passwordId", "users.password")
        .select([
            'users.userId',
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
            "users_credentials.userId"
        ])
        .where("users_credentials.id", "=", body.keyId)
        .where("users_credentials.userId", "=", user.userId)
        .limit(1)
        .executeTakeFirst()

    if (!passkey) return Response.json({ updated: false, error: 'no_passkey' });

    try {
        db.updateTable("users_credentials")
        .set("users_credentials.device_name", body.name)
        .where("users_credentials.id", "=", body.keyId)
        .where("users_credentials.userId", "=", user.userId)
        .limit(1)
        .execute();
        return Response.json({ updated: true, id: body.keyId, newName: body.name });
    } catch(e) {
        return Response.json({ updated: false, error: 'unknown' });
    }

  }, {
    body: t.Object({
        keyId: t.Number(),
        name: t.String()
    })
  })


export default elysiaApp;
