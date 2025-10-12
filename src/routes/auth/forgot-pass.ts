import { Elysia, t } from 'elysia';
import { db } from '../../../database'
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../index';
import moment from 'moment';
import { ip } from 'elysia-ip';
import { maskEmail } from '../../functions/mask_email';
import { SecurityConfig } from '../../config/security.config';
import { error } from 'console';

const elysiaApp = new Elysia()
  .use(ip())
  .use(rateLimit({
    scoping: "scoped",
    max: 25,
    duration: 5 * 60 * 1000,
    injectServer: () => app.server
  }))
  .post('/forgot-pass', async ({ body, store, request, cookie }: any) => {
    const { username, token, selectedEmail, emailCode, newPassword, TFA } = body;
    let err = [];
    // First initial request - check username, create token, send token with masked emails
    if (!token) {
        if (!username || username == "") {
        err.push('Missing username');
        }

        if (err.length) {
        return Response.json({ error: err });
        }

        try {
            // Check username
            const user = await db.selectFrom("users")
            .select([
                "users.userId",
                "users.username",
                "users.person"
            ])
            .where(sql`LOWER(users.username)`, '=', username.toLowerCase())
            .limit(1)
            .executeTakeFirstOrThrow()

            // Get user's emails
            const emails = await db.selectFrom("emails")
            .select([
                "emails.email"
            ])
            .where('emails.personId', '=', user.person)
            .where('emails.is_verified', '=', true)
            .orderBy('emails.email', 'asc')
            .execute()

            // Check if any email found
            if (emails.length == 0) {
                return Response.json({ error: ['No verified email found in the system for this user'] })
            }

            const email_token = crypto.randomUUID();
            const email_expires_at = moment().add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES, 'minutes').toDate();

            await db.insertInto('users_resetpassword').values({
                user_id: user.userId,
                email: emails.length === 1 ? emails[0].email : null,
                email_token,
                created_at: moment().toDate(),
                expires_at: email_expires_at,
                otp_code: null,
                ip: store.ip,
                user_agent: request.headers.get('user-agent') || 'unknown'
            }).execute()


            // If multiple emails, check if selectedEmail is valid
            if (emails.length > 1 && (selectedEmail == -1 || !emails[selectedEmail])) {
                return Response.json({
                    error: ['Multiple verified emails found, please select one'],
                    emails: emails.map(e => maskEmail(e.email)),
                    token: email_token,
                    expires_at: email_expires_at
                });
            }

            // Send reset email
            if (emails.length === 1 || emails.length > 1 && emails[selectedEmail]) {
                const email = emails.length === 1 ? emails[0].email : emails[selectedEmail].email;
                return Response.json({
                    error: ['Sent email with code'],
                    email: maskEmail(email),
                    token: email_token,
                    expires_at: email_expires_at
                });
            }

        } catch(e) {
            return Response.json({ error: ['Invalid username'] })
        }
    }

    // Second request - verify token, emailCode, TFA and change password
    else {
        try {
            // Verify token
            const getEmailPasswordReset = await db.selectFrom("users_resetpassword")
            .select([
                "users_resetpassword.email",
                "users_resetpassword.user_id",
                "users_resetpassword.expires_at",
                "users_resetpassword.otp_code"
            ])
            .where('users_resetpassword.email_token', '=', token)
            .limit(1)
            .executeTakeFirstOrThrow()

            // Check if selected email
            if (getEmailPasswordReset.expires_at < new Date()) {
                return Response.json({ error: ['Reset password token expired'] })
            }

            if (getEmailPasswordReset.email === null) {
                if (selectedEmail == undefined || selectedEmail == -1) {
                    return Response.json({ error: ['Missing selectedEmail'] })
                }

                // Get user's emails
                const emails = await db.selectFrom("emails")
                .select([
                    "emails.email"
                ])
                .where('emails.personId', '=', getEmailPasswordReset.user_id)
                .where('emails.is_verified', '=', true)
                .orderBy('emails.email', 'asc')
                .execute()

                // Check if any email found
                if (emails.length == 0) {
                    return Response.json({ error: ['No verified email found in the system for this user'] })
                }
                if (!emails[selectedEmail]) {
                    return Response.json({ error: ['Invalid selectedEmail'] })
                }
                getEmailPasswordReset.email = emails[selectedEmail].email;
                try {
                    await db.updateTable('users_resetpassword')
                    .set({ email: getEmailPasswordReset.email })
                    .where('users_resetpassword.email_token', '=', token)
                    .limit(1)
                    .executeTakeFirst()

                    return Response.json({ error: ['Selected email set, input emailCode'] })
                } catch(e) {
                    return Response.json({ error: ['Failed to set selected email, please try again'] })
                }
            }



        } catch(e) {
            return Response.json({ error: ['Invalid reset password token'] })
        }
    }
  }, {
    body: t.Optional(t.Object({
      username: t.Optional(t.String()),
      token: t.Optional(t.String()),
      selectedEmail: t.Optional(t.Number()),
      emailCode: t.Optional(t.String()),
      newPassword: t.Optional(t.String()),
      TFA: t.Optional(t.String())
    }))
  })

export default elysiaApp;
