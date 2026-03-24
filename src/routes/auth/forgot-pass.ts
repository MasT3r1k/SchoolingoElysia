import { Elysia, t } from 'elysia';
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit';
import moment from 'moment';
import { ip } from 'elysia-ip';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { app } from '../../..';
import { db } from '../../../database';
import { SecurityConfig } from '../../config/security.config';
import { maskEmail } from '../../functions/mask_email';
import { verify_password } from '../../functions/verify_password';
import { verifyTFA } from '../../functions/verifyTFA';
import { getActualIP } from '../../functions/get_ip_data';

// 🔹 Globální proměnná pro testovací transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'jensen68@ethereal.email',
    pass: 'B3DryQvm8pVbDWW9SN',
  },
});

// Inicializace testovacího maileru při startu aplikace
// (async () => {
//   try {
//     const testAccount = await nodemailer.createTestAccount();
//     transporter = nodemailer.createTransport({
//       host: 'smtp.ethereal.email',
//       port: 587,
//       secure: false,
//       auth: {
//         user: testAccount.user,
//         pass: testAccount.pass
//       }
//     });

//     console.log('✅ Test SMTP account created (Ethereal)');
//     console.log('📧 Login:', testAccount.user);
//     console.log('🔑 Password:', testAccount.pass);
//     console.log('🌐 Ethereal webmail:', 'https://ethereal.email/login');
//   } catch (err) {
//     console.error('❌ Failed to create Ethereal test account:', err);
//   }
// })();

// Pomocná funkce na generování 8místného alfanumerického kódu
function generateOTP(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const elysiaApp = new Elysia()
  .post(
    '/forgot-pass',
    async ({ body, store, request }: any) => {
      const { username, token, selectedEmail, emailCode, newPassword, TFA } = body;
      const actualIP = await getActualIP(store.ip);

      if (!transporter) {
        console.error('❌ Email transporter not initialized');
        return Response.json({ error: ['Mail system not ready, please try again later'] });
      }

      try {
        // ------------------------------
        // 1️⃣ Požadavek o reset – vytvoření tokenu a odeslání e-mailu
        // ------------------------------
        if (!token) {
          if (!username?.trim()) return Response.json({ error: ['Missing username'] });

          const user = await db
            .selectFrom('users')
            .select(['user_id', 'username', 'person_id', '2fa'])
            .where(sql`LOWER(username)`, '=', username.toLowerCase())
            .executeTakeFirst();

          if (!user) return Response.json({ error: ['Invalid username'] });

          const emails = await db
            .selectFrom('emails')
            .select(['email'])
            .where('person_id', '=', user.person_id)
            .where('is_verified', '=', true)
            .orderBy('email', 'asc')
            .execute();

          if (emails.length === 0)
            return Response.json({ error: ['No verified email found for this user'] });

          const email_token = crypto.randomUUID();
          const otp_code = generateOTP();
          const expires_at = moment()
            .add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES, 'minutes')
            .toDate();

          await db
            .insertInto('users_resetpassword')
            .values({
              user_id: user.user_id,
              email: emails.length === 1 ? emails[0].email : null,
              email_token,
              created_at: moment().toDate(),
              expires_at,
              otp_code,
              ip: actualIP,
              user_agent: request.headers.get('user-agent') || 'unknown',
            })
            .execute();

          // pokud má více e-mailů
          if (emails.length > 1 && (selectedEmail === undefined || selectedEmail === -1)) {
            return Response.json({
              stage: 'email_select',
              error: ['Multiple verified emails found, please select one'],
              emails: emails.map((e) => maskEmail(e.email)),
              token: email_token,
              expires_at,
            });
          }

          // pošle OTP
          const email = emails.length === 1 ? emails[0].email : emails[selectedEmail].email;

          await db.insertInto("auditlog")
          .values({
              user_id: user.user_id,
              type: "reset_password",
              data: JSON.stringify({}),
              ip: actualIP
          })
          .execute()

          const info = await transporter.sendMail({
            to: email,
            subject: 'Password Reset Verification Code',
            html: `
            <div style="font-family:sans-serif;text-align:center;">
              <h2>Password Reset</h2>
              <p>Your verification code:</p>
              <div style="font-size:24px;font-weight:bold;letter-spacing:2px;margin:10px 0;">${otp_code}</div>
              <p>This code expires in ${SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES} minutes.</p>
            </div>
          `,
          });

          console.log('📬 Email sent (Ethereal preview):', nodemailer.getTestMessageUrl(info));

          return Response.json({
            stage: 'verify_code',
            email: maskEmail(email),
            token: email_token,
            expires_at,
          });
        }

        // ------------------------------
        // 2️⃣ Vyhledání tokenu (druhá fáze)
        // ------------------------------
        const resetRecord = await db
          .selectFrom('users_resetpassword')
          .select(['user_id', 'email', 'expires_at', 'otp_code'])
          .where('email_token', '=', token)
          .executeTakeFirst();

        if (!resetRecord) return Response.json({ error: ['Invalid reset token'] });

        if (resetRecord.expires_at < new Date())
          return Response.json({ error: ['Reset token expired'] });

        // ------------------------------
        // 3️⃣ Pokud není e-mail vybraný
        // ------------------------------
        if (!resetRecord.email) {
          if (selectedEmail === undefined || selectedEmail === -1)
            return Response.json({ error: ['Missing selectedEmail'] });

          const emails = await db
            .selectFrom('emails')
            .select(['email'])
            .where('person_id', '=', resetRecord.user_id)
            .where('is_verified', '=', true)
            .orderBy('email', 'asc')
            .execute();

          if (!emails[selectedEmail]) return Response.json({ error: ['Invalid selectedEmail'] });

          const chosenEmail = emails[selectedEmail].email;
          const newOtp = generateOTP();

          await db
            .updateTable('users_resetpassword')
            .set({ email: chosenEmail, otp_code: newOtp })
            .where('email_token', '=', token)
            .executeTakeFirst();

          await transporter.sendMail({
            to: chosenEmail,
            subject: 'Password Reset Verification Code',
            html: `
            <div style="font-family:sans-serif;text-align:center;">
              <h2>Password Reset</h2>
              <p>Your verification code:</p>
              <div style="font-size:24px;font-weight:bold;letter-spacing:2px;margin:10px 0;">${newOtp}</div>
              <p>This code expires in ${SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES} minutes.</p>
            </div>
          `,
          });

          return Response.json({
            stage: 'verify_code',
            error: ['Selected email set, input emailCode'],
          });
        }

        // ------------------------------
        // 4️⃣ Ověření OTP
        // ------------------------------
        if (!emailCode) return Response.json({ error: ['Missing verification code (emailCode)'] });

        if (emailCode !== resetRecord.otp_code)
          return Response.json({ error: ['Invalid verification code'] });

        // ------------------------------
        // 5️⃣ Ověření 2FA + změna hesla
        // ------------------------------
        const user = await db
          .selectFrom('users')
          .select(['user_id', '2fa', '2fa_secret', 'username'])
          .where('user_id', '=', resetRecord.user_id)
          .executeTakeFirstOrThrow();

        if (!newPassword) return Response.json({ error: ['Missing password'], stage: 'new_password' });
        if (!verify_password(newPassword)) return Response.json({ error: ['Invalid password'] });

        if (user['2fa'] && user['2fa_secret']) {
          if (!TFA) return Response.json({ error: ['TFA code required'], stage: 'tfa_required' });

          const tfaValid = await verifyTFA(TFA, user["user_id"]);
          if (!tfaValid) return Response.json({ error: ['Invalid TFA code'] });
        }

        // vytvoří nový záznam v passwords
        const encryptedPassword = bcrypt.hashSync(newPassword, 12);
        //- Generate password id
        const passwordQuery = await db
          .insertInto('passwords')
          .values({ password: encryptedPassword })
          .executeTakeFirst();

        const passwordId = parseInt(passwordQuery.insertId?.toString()!);

        db.updateTable('users')
          .set('users.password_id', passwordId)
          .set('users.password_changed', sql`NOW()`)
          .set('users.recommend_change_password', false)
          .where('users.user_id', '=', user.user_id)
          .limit(1)
          .execute();

        // aktualizuje usera
        await db
          .updateTable('users')
          .set({ password_id: passwordId })
          .where('user_id', '=', user.user_id)
          .executeTakeFirst();

        await db.insertInto("auditlog")
        .values({
            user_id: user.user_id,
            type: "change_password",
            data: JSON.stringify({}),
            ip: actualIP
        })
        .execute()
        
        // smaže reset token
        await db
          .deleteFrom('users_resetpassword')
          .where('email_token', '=', token)
          .executeTakeFirst();

        return Response.json({ stage: 'done', success: true });
      } catch (e) {
        console.error(e);
        return Response.json({ error: ['Unexpected error occurred'] });
      }
    },
    {
      body: t.Optional(
        t.Object({
          username: t.Optional(t.String()),
          token: t.Optional(t.String()),
          selectedEmail: t.Optional(t.Number()),
          emailCode: t.Optional(t.String()),
          newPassword: t.Optional(t.String()),
          TFA: t.Optional(t.String()),
        })
      ),
    }
  );

export default elysiaApp;
