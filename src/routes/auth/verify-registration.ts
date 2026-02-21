import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { app } from "../../../index";
import { VerifiedRegistrationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { ip } from "elysia-ip";
import moment from "moment";
import { db } from "../../../database";

const elysiaApp = new Elysia()
    .post('/verify-registration', async ({ body, cookie }: any) => {
    const token = cookie.token?.value as string;
    if (!token) return Response.json({ error: 'no_user', details: 'no_cookie' });

    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.user_id', 'tokens.user_id')
      .innerJoin("passwords", "passwords.password_id", 'users.password_id')
      .select(['users.user_id', 'users.username'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!user) return Response.json({ error: 'no_user', details: 'no_db' });

    const expectedOrigin = 'http://localhost:4200'; // frontend origin
    const expectedRPID = 'localhost';

    const attestationResponse = body;

    // Získání dat z DB/session (např. challenge, user atd.)
    const expectedChallenge = await db.selectFrom("webauthn_challenges")
    .select(["challenge"])
    .where("user_id", '=', user.user_id)
    .orderBy("created_at", "desc")
    .limit(1)
    .executeTakeFirst();

    if (!expectedChallenge) return;

    let verification: VerifiedRegistrationResponse;

    try {
      verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge: expectedChallenge.challenge,
        expectedOrigin,
        expectedRPID,
        requireUserVerification: true
      });
    } catch (error) {
      console.error('❌ verifyRegistrationResponse failed', error);
      return Response.json({ verified: false, error: 'verification_failed' });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const {
        credential: {
          id: credentialID,
          publicKey: credentialPublicKey,
          counter,
        },
        credentialDeviceType,
        credentialBackedUp,
      } = registrationInfo;

      await db.insertInto('users_credentials').values({
        user_id: user.user_id,
        credential_id: credentialID,
        public_key: Buffer.from(credentialPublicKey).toString('base64'),
        counter,
        device_name: "",
        transports: JSON.stringify(body.transports || []),
        last_used: null,
        device_type: credentialDeviceType,
        backed_up: credentialBackedUp,
      })
      .execute();

      return Response.json({ verified: true });
    }

    return Response.json({ verified: false });
  })

export default elysiaApp;