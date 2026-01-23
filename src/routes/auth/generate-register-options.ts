import { generateRegistrationOptions } from "@simplewebauthn/server";
import Elysia from "elysia";
import { ip } from "elysia-ip";
import { rateLimit } from "elysia-rate-limit";
import moment from "moment";
import { app } from "../../../index";
import { db } from "../../../database";

const elysiaApp = new Elysia()
  .get('/generate-register-options', async ({ cookie }: any) => {
    const token = cookie.token.value;
    if (!token) return Response.json({ error: 'no_user', details: 'no_cookie' });

    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.userId', 'tokens.userId')
      .innerJoin("passwords", "passwords.passwordId", "users.password")
      .select(['users.userId', 'users.username'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!user) return Response.json({ error: 'no_user', details: 'no_db' });

    const credentials = await db.selectFrom("users_credentials")
      .where('userId', '=', user.userId)
      .select(['credential_id', 'transports'])
      .execute();

    const options = await generateRegistrationOptions({
      rpName: 'Schoolingo',
      rpID: 'localhost',
      userName: user.username,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: credentials.map((cred) => ({
        id: Buffer.from(cred.credential_id).toString('base64'),
        type: 'public-key',
        transports: JSON.parse(cred.transports) || []
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    // uložit challenge do databáze
    await db.insertInto("webauthn_challenges").values({
      userId: user.userId,
      challenge: options.challenge,
      expiresAt: moment().add(5, 'minutes').toDate(),
    }).execute();

    return Response.json(options);
  })

export default elysiaApp;
