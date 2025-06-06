import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import Elysia, { t } from "elysia";
import { ip } from "elysia-ip";
import { rateLimit } from "elysia-rate-limit";
import moment from "moment";
import { app } from "../../..";
import { db } from "../../../database";
import { authenticateUser } from "./auth";

const elysiaApp = new Elysia()
  .use(ip())
  .use(rateLimit({
    scoping: "scoped",
    max: 5,
    duration: 5 * 60 * 1000,
    injectServer: () => app.server
  }))

  .post('/verify-authentication', async({ body: { response, challenge }, cookie, store, request }: any) => {
    // Získej uložené credential pro uživatele (podle potřeby)
    const credential = await db.selectFrom('users_credentials')
      .selectAll()
      .where('users_credentials.credential_id', '=', response.id)
      .limit(1) // nebo podle id credentialu z body
      .executeTakeFirst();

    if (!credential) return Response.json({ error: 'no_credential' });

    try {
      // Tohle je klíčová funkce k ověření odpovědi klienta
      const verification = await verifyAuthenticationResponse({
        response, // celé tělo z klienta s credential data
        expectedChallenge: challenge, /* challenge, který jsi klientovi poslal */
        expectedOrigin: 'http://localhost:4200', // nebo tvůj frontend origin
        expectedRPID: 'localhost',
        credential: {
          publicKey: Buffer.from(credential.public_key.toString(), 'base64'),
          id: credential.credential_id,
          counter: credential.counter,
          transports: JSON.parse(credential.transports) || []
        },
        requireUserVerification: true
      });

      if (verification.verified) {
        // Update counter v DB
        await db.updateTable('users_credentials')
          .set({
            counter: verification.authenticationInfo.newCounter,
            last_used: moment().toDate()
          })
          .where('id', '=', credential.id)
          .execute();


        const { ip } = store;

        // Log user history
        db.insertInto("login_history")
        .values({
            userId: credential.userId,
            success: true,
            type: 'passkey',
            ip,
            userAgent: request.headers.get("user-agent") || null
        })
        .execute()

        const res = await authenticateUser(
          credential.userId,
          cookie,
          request.headers.get('user-agent'),
          ip
        );

        if (res.status) {
          return Response.json({
            username: res.username,
            expires: res.expires,
            verified: true
          });
        } else {
          return Response.json({ verified: false });
        }
      } else {
        return Response.json({ verified: false });
      }
    } catch (e) {
      console.error('verifyAuthenticationResponse error:', e);
      return Response.json({ verified: false, error: e });
    }
  }, {
    body: t.Optional(t.Object({
      response: t.Any(),
      challenge: t.String()
    }))
  })

export default elysiaApp