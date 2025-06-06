import { Elysia, t } from 'elysia';
import { db } from '../../../database'
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../index';
import moment from 'moment';
import { ip } from 'elysia-ip';
import * as OTPAuth from "otpauth";
import bcrypt from 'bcryptjs';

const elysiaApp = new Elysia()
  .use(ip())
  .use(rateLimit({
    scoping: "scoped",
    max: 10,
    duration: 5 * 60 * 1000,
    injectServer: () => app.server
  }))
  .post('/changepassword', async ({ body, store, request, cookie }: any) => {
    const token = cookie.token.value;
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

    const { oldpassword, password, TFA } = body;
    let err = [];
    if (!oldpassword || oldpassword == "") {
      err.push('Missing old password');
    }

    if (!password || password == "") {
      err.push('Missing new password');
    }

    if (oldpassword == password) {
        err.push('Old and new passwords are same');
    }

    if (err.length) {
      return Response.json({ error: err });
    }

    try {
      // Check password
      const isPasswordValid = bcrypt.compareSync(
        oldpassword,
        user.password
      );

      if (!isPasswordValid) {
        return Response.json({ error: ["Invalid old password"] });
      }

      if (user['2fa'] && user['2fa_secret']) {
        if (!TFA) {
          return Response.json({ error: ["Missing 2FA"] });
        }

        let isApproved2FA = false;

        // Validate 2FA
        const [backupCodes] = await Promise.all([
          db.selectFrom("users_backup_codes")
          .select("users_backup_codes.used")
          .where("users_backup_codes.userId", '=', user.userId)
          .where("users_backup_codes.code", '=', TFA)
          .where("users_backup_codes.used", '=', false)
          .execute()
        ])

        if (backupCodes.length) {
          db.updateTable("users_backup_codes")
          .set("used", true)
          .where("users_backup_codes.userId", '=', user.userId)
          .where("users_backup_codes.code", '=', TFA)
          .limit(1)
          .executeTakeFirst()
          isApproved2FA = true;
        }

        // Verify token with TOTP
        let totp = new OTPAuth.TOTP({
            issuer: "Schoolingo",
            label: user.username,
            algorithm: "SHA1",
            digits: 6,
            secret: user['2fa_secret']
        });

        let delta = totp.validate({ token: TFA });
        if (delta !== null) {
          isApproved2FA = true;
        }

        if (!isApproved2FA) {
          return Response.json({ error: ['Invalid 2FA'] });
        }
      }

      try {
        // Update user data
        //- Generate encrypted password
        const encryptedPassword = bcrypt.hashSync(password, 12);
        //- Generate password id
        const passwordQuery = await db.insertInto("passwords")
        .values({ password: encryptedPassword })
        .executeTakeFirst();

        const passwordId = parseInt(passwordQuery.insertId?.toString()!);

        db.updateTable("users")
        .set("users.password", passwordId)
        .set("users.passwordChanged", sql`NOW()`)
        .set('users.recommendChangePassword', false)
        .where('users.userId', '=', user.userId)
        .limit(1)
        .execute();

        db.updateTable("tokens")
        .set("tokens.password", passwordId)
        .where('tokens.token', '=', token)
        .limit(1)
        .execute()
        return Response.json({ success: true, message: 'Password changed' });
      } catch(e) {
        console.log(e)
        return Response.json({ error: ['Failed update password'] });
      }
    } catch (e) {
      console.log(e)
      return Response.json({ error: ['Failed validate password or TFA'] }); 
    }
  }, {
    body: t.Object({
      oldpassword: t.Optional(t.String()),
      password: t.Optional(t.String()),
      TFA: t.Optional(t.String())
    }),
    detail: {
      description: "This endpoint is rate-limited: max 10 requests per 5 minutes",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {}
                }
            }
          }
        },
        404: {
          description: "Invalid student",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string", example: "Student not found" }
                }
              }
            }
          }
        },
        429: {
          description: "Rate limit exceeded",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "rate-limited"
                  }
                }
              }
            }
          }
        }
      }
    }
  });

export default elysiaApp;
