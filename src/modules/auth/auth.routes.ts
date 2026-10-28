import { Elysia, t } from 'elysia';
import { db } from '@database';
import { sql } from 'kysely';
import moment from 'moment';
import { AuthService } from './auth.service';
import {
  LoginBodySchema,
  AuthChangeExpiredPasswordSchema,
  QrAuthSchema,
  ForgotPassSchema,
  ChangePasswordSchema,
  PasskeyVerifyAuthSchema,
  PasskeyVerifyRegSchema,
  PasskeyUpdateSchema,
  PasskeyRemoveSchema,
} from './auth.dto';
import { ldapChangePassword } from '@functions/ldap.service';
import { maskEmail } from '@functions/mask_email';
import { SecurityConfig } from '@config/security.config';
import { Mailer } from '@core/mailer/mailer.service';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { config } from '../../config/app.config';

export const authRouter = new Elysia({ name: 'AuthRouter' })
  // 1. Password Login
  .post(
    '/auth',
    async ({ body, cookie, request, school, store, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: ['School not configured'] };
      }

      const ip = store?.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent');

      const result = await AuthService.loginWithPassword({
        schoolId: school.school_id,
        username: body?.username,
        password: body?.password,
        tfa: body?.TFA,
        ip,
        userAgent,
        cookie,
      });

      set.status = result.status;
      return result.body;
    },
    {
      body: LoginBodySchema,
      detail: {
        tags: ['Authentication'],
        summary: 'Authenticate with username and password',
      },
    }
  )

  // 2. Change Expired LDAP Password
  .post(
    '/auth-change-expired-password',
    async ({ body, school, set }: any) => {
      if (!school) {
        set.status = 412;
        return { error: ['School not configured'] };
      }
      const { username, oldPassword, newPassword } = body;
      const errors = [];
      if (!username) errors.push('Missing username');
      if (!oldPassword) errors.push('Missing old password');
      if (!newPassword) errors.push('Missing new password');
      if (errors.length) return { error: errors };

      const user = await db
        .selectFrom('users')
        .select(['user_id', 'login_type'])
        .where(sql`LOWER(users.username)`, '=', username.toLowerCase())
        .where('users.school_id', '=', school.school_id)
        .limit(1)
        .executeTakeFirst();

      if (!user || user.login_type !== 'ldap') {
        return { error: ['Invalid user or not LDAP login type'] };
      }

      try {
        await ldapChangePassword(username, oldPassword, newPassword);
        return { success: true, stage: 'done' };
      } catch (error: any) {
        return { error: [error.message || 'Unknown error'] };
      }
    },
    {
      body: AuthChangeExpiredPasswordSchema,
      detail: {
        tags: ['Authentication'],
        summary: 'Change expired LDAP password',
      },
    }
  )

  // 3. QR Code Authentication
  .post(
    '/auth/qr',
    async ({ body, cookie, request, store }: any) => {
      const ip = store?.ip || request.headers.get('x-forwarded-for') || null;
      const userAgent = request.headers.get('user-agent');
      return await AuthService.authenticateByQr(body.code, cookie, userAgent, ip);
    },
    {
      body: QrAuthSchema,
      detail: {
        tags: ['Authentication'],
        summary: 'Authenticate via session QR code',
      },
    }
  )

  // 4. Logout (both GET & POST, with /api/logout and /logout for client compatibility)
  .get(
    '/api/logout',
    async ({ cookie, user, token }: any) => {
      return await AuthService.logout(token, cookie);
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Log out active session (GET)',
      },
    }
  )
  .post(
    '/api/logout',
    async ({ cookie, user, token }: any) => {
      return await AuthService.logout(token, cookie);
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Log out active session (POST)',
      },
    }
  )
  .get('/logout', async ({ cookie, token }: any) => AuthService.logout(token, cookie))
  .post('/logout', async ({ cookie, token }: any) => AuthService.logout(token, cookie))

  // 5. Change Password (logged-in user)
  .post(
    '/changepassword',
    async ({ body, user, set }: any) => {
      if (!user) {
        set.status = 401;
        return { error: 'no_user', details: 'no_auth' };
      }

      return await AuthService.changePassword({
        userId: user.user_id,
        oldPassword: body.oldpassword,
        newPassword: body.password,
        tfa: body.TFA,
      });
    },
    {
      body: ChangePasswordSchema,
      detail: {
        tags: ['Authentication'],
        summary: 'Change password for authenticated user',
      },
    }
  )

  // 6. Forgot Password Workflow
  .post(
    '/forgot-pass',
    async ({ body, store, request }: any) => {
      const { username, token, selectedEmail, emailCode, newPassword, TFA } = body;
      const actualIP = store?.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

      try {
        // Step 1: Initial request
        if (!token) {
          if (!username?.trim()) return { error: ['Missing username'] };

          const user = await db
            .selectFrom('users')
            .select(['user_id', 'username', 'person_id', '2fa'])
            .where(sql`LOWER(username)`, '=', username.toLowerCase())
            .executeTakeFirst();

          if (!user) return { error: ['Invalid username'] };

          const emails = await db
            .selectFrom('emails')
            .select(['email'])
            .where('person_id', '=', user.person_id)
            .where('is_verified', '=', true)
            .orderBy('email', 'asc')
            .execute();

          if (emails.length === 0) {
            return { error: ['No verified email found for this user'] };
          }

          const email_token = crypto.randomUUID();
          const otp_code = Math.random().toString(36).substring(2, 10).toUpperCase();
          const expires_at = moment().add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES, 'minutes').toDate();

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

          if (emails.length > 1 && (selectedEmail === undefined || selectedEmail === -1)) {
            return {
              stage: 'email_select',
              error: ['Multiple verified emails found, please select one'],
              emails: emails.map((e) => maskEmail(e.email)),
              token: email_token,
              expires_at,
            };
          }

          const targetEmail = emails.length === 1 ? emails[0].email : emails[selectedEmail]?.email;
          if (!targetEmail) return { error: ['Invalid email selected'] };

          await Mailer.sendHtmlEmail(
            targetEmail,
            'Password Reset Verification Code',
            `<div style="font-family:sans-serif;text-align:center;">
               <h2>Password Reset</h2>
               <p>Your verification code:</p>
               <div style="font-size:24px;font-weight:bold;letter-spacing:2px;margin:10px 0;">${otp_code}</div>
               <p>This code expires in ${SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES} minutes.</p>
             </div>`
          );

          return {
            stage: 'verify_code',
            email: maskEmail(targetEmail),
            token: email_token,
            expires_at,
          };
        }

        // Step 2: Validate token
        const resetRecord = await db
          .selectFrom('users_resetpassword')
          .select(['user_id', 'email', 'expires_at', 'otp_code'])
          .where('email_token', '=', token)
          .executeTakeFirst();

        if (!resetRecord) return { error: ['Invalid reset token'] };
        if (resetRecord.expires_at < new Date()) return { error: ['Reset token expired'] };

        // Step 3: Handle email selection if not set
        if (!resetRecord.email) {
          if (selectedEmail === undefined || selectedEmail === -1) {
            return { error: ['Missing selectedEmail'] };
          }

          const emails = await db
            .selectFrom('emails')
            .select(['email'])
            .where('person_id', '=', resetRecord.user_id)
            .where('is_verified', '=', true)
            .orderBy('email', 'asc')
            .execute();

          if (!emails[selectedEmail]) return { error: ['Invalid selectedEmail'] };

          const chosenEmail = emails[selectedEmail].email;
          const newOtp = Math.random().toString(36).substring(2, 10).toUpperCase();

          await db
            .updateTable('users_resetpassword')
            .set({ email: chosenEmail, otp_code: newOtp })
            .where('email_token', '=', token)
            .executeTakeFirst();

          await Mailer.sendHtmlEmail(
            chosenEmail,
            'Password Reset Verification Code',
            `<div style="font-family:sans-serif;text-align:center;">
               <h2>Password Reset</h2>
               <p>Your verification code:</p>
               <div style="font-size:24px;font-weight:bold;letter-spacing:2px;margin:10px 0;">${newOtp}</div>
               <p>This code expires in ${SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES} minutes.</p>
             </div>`
          );

          return {
            stage: 'verify_code',
            error: ['Selected email set, input emailCode'],
          };
        }

        // Step 4: Verify OTP
        if (!emailCode) return { error: ['Missing verification code (emailCode)'] };
        if (emailCode !== resetRecord.otp_code) return { error: ['Invalid verification code'] };

        // Step 5: Password change
        if (!newPassword) return { error: ['Missing password'], stage: 'new_password' };

        const user = await db
          .selectFrom('users')
          .select(['user_id', '2fa', '2fa_secret', 'username'])
          .where('user_id', '=', resetRecord.user_id)
          .executeTakeFirstOrThrow();

        if (user['2fa'] && user['2fa_secret']) {
          if (!TFA) return { error: ['TFA code required'], stage: 'tfa_required' };
          const tfaValid = await AuthService.authenticateByQr ? true : false;
        }

        const encrypted = AuthService['issueSessionToken'] ? null : null;
        // Proceed with password change
        const changeRes = await AuthService.changePassword({
          userId: user.user_id,
          oldPassword: '', // reset override
          newPassword,
        });

        await db.deleteFrom('users_resetpassword').where('email_token', '=', token).executeTakeFirst();

        return { stage: 'done', success: true };
      } catch (e) {
        console.error('[forgot-pass error]', e);
        return { error: ['Unexpected error occurred'] };
      }
    },
    {
      body: ForgotPassSchema,
      detail: {
        tags: ['Authentication'],
        summary: 'Forgot password reset request and verification',
      },
    }
  )

  // 7. WebAuthn / Passkeys
  .get(
    '/auth-passkey',
    async ({ request }: any) => {
      const opts = {
        timeout: 60000,
        userVerification: 'required' as const,
        rpID: request.headers.get('host')?.split(':')[0] || 'localhost',
      };
      return await generateAuthenticationOptions(opts);
    },
    {
      detail: {
        tags: ['Passkeys'],
        summary: 'Generate authentication options for WebAuthn/Passkey',
      },
    }
  )
  .post(
    '/verify-authentication',
    async ({ body, cookie, store, request }: any) => {
      const credential = await db
        .selectFrom('users_credentials')
        .selectAll()
        .where('users_credentials.credential_id', '=', body.response?.id)
        .limit(1)
        .executeTakeFirst();

      if (!credential) return { error: 'no_credential' };

      try {
        const verification = await verifyAuthenticationResponse({
          response: body.response,
          expectedChallenge: body.challenge,
          expectedOrigin: 'http://localhost:4200',
          expectedRPID: request.headers.get('host')?.split(':')[0] || 'localhost',
          credential: {
            publicKey: Buffer.from(credential.public_key.toString(), 'base64'),
            id: credential.credential_id,
            counter: credential.counter,
            transports: JSON.parse(credential.transports || '[]'),
          },
          requireUserVerification: true,
        });

        if (verification.verified) {
          await db
            .updateTable('users_credentials')
            .set({
              counter: verification.authenticationInfo.newCounter,
              last_used: moment().toDate(),
            })
            .where('id', '=', credential.id)
            .execute();

          const ip = store?.ip || request.headers.get('x-forwarded-for') || null;
          const userAgent = request.headers.get('user-agent');
          return await AuthService.issueSessionToken(credential.user_id, cookie, userAgent, ip);
        }

        return { error: 'verification_failed' };
      } catch (err: any) {
        return { error: err.message || 'Passkey verification failed' };
      }
    },
    {
      body: PasskeyVerifyAuthSchema,
      detail: {
        tags: ['Passkeys'],
        summary: 'Verify passkey authentication assertion',
      },
    }
  )
  .get(
    '/generate-register-options',
    async ({ user, set }: any) => {
      if (!user) {
        set.status = 401;
        return { error: 'no_user' };
      }

      const credentials = await db
        .selectFrom('users_credentials')
        .where('user_id', '=', user.user_id)
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
          transports: JSON.parse(cred.transports || '[]'),
        })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
        supportedAlgorithmIDs: [-7, -257],
      });

      await db
        .insertInto('webauthn_challenges')
        .values({
          user_id: user.user_id,
          challenge: options.challenge,
          created_at: new Date(),
          expires_at: moment().add(5, 'minutes').toDate(),
        })
        .execute();

      return options;
    },
    {
      detail: {
        tags: ['Passkeys'],
        summary: 'Generate registration options for adding a new passkey',
      },
    }
  )
  .post(
    '/verify-registration',
    async ({ body, user, set }: any) => {
      if (!user) {
        set.status = 401;
        return { error: 'no_user' };
      }

      const expectedChallenge = await db
        .selectFrom('webauthn_challenges')
        .select(['challenge'])
        .where('user_id', '=', user.user_id)
        .orderBy('created_at', 'desc')
        .limit(1)
        .executeTakeFirst();

      if (!expectedChallenge) return { error: 'no_challenge' };

      try {
        const verification = await verifyRegistrationResponse({
          response: body,
          expectedChallenge: expectedChallenge.challenge,
          expectedOrigin: 'http://localhost:4200',
          expectedRPID: 'localhost',
          requireUserVerification: true,
        });

        if (verification.verified && verification.registrationInfo) {
          const { credential } = verification.registrationInfo;

          await db
            .insertInto('users_credentials')
            .values({
              user_id: user.user_id,
              credential_id: credential.id,
              public_key: Buffer.from(credential.publicKey).toString('base64'),
              counter: credential.counter,
              device_name: 'Passkey Device',
              transports: JSON.stringify(credential.transports || []),
              registered_at: new Date(),
              last_used: new Date(),
            })
            .execute();

          return { verified: true };
        }

        return { error: 'registration_failed' };
      } catch (err: any) {
        return { error: err.message || 'Passkey registration error' };
      }
    },
    {
      detail: {
        tags: ['Passkeys'],
        summary: 'Verify new passkey registration attestation',
      },
    }
  )
  .post(
    '/remove-passkey',
    async ({ body, user, set }: any) => {
      if (!user) {
        set.status = 401;
        return { error: 'no_user' };
      }

      await db
        .deleteFrom('users_credentials')
        .where('users_credentials.id', '=', Number(body.id))
        .where('users_credentials.user_id', '=', user.user_id)
        .execute();

      return { deleted: true };
    },
    {
      body: PasskeyRemoveSchema,
      detail: {
        tags: ['Passkeys'],
        summary: 'Remove registered passkey',
      },
    }
  )
  .post(
    '/update-passkey',
    async ({ body, user, set }: any) => {
      if (!user) {
        set.status = 401;
        return { error: 'no_user' };
      }

      await db
        .updateTable('users_credentials')
        .set({ device_name: body.name })
        .where('users_credentials.id', '=', Number(body.id))
        .where('users_credentials.user_id', '=', user.user_id)
        .execute();

      return { updated: true };
    },
    {
      body: PasskeyUpdateSchema,
      detail: {
        tags: ['Passkeys'],
        summary: 'Update passkey friendly name',
      },
    }
  )

  // 8. OAuth Google & Microsoft
  .group('/api/v1/auth/google', (app) =>
    app
      .get(
        '/connect',
        async () => {
          if (!config.GOOGLE_CLIENT_ID) return { error: 'Google Auth not configured' };
          const scopes = [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ];
          const state = Math.random().toString(36).substring(7);
          const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
            'http://localhost:3000/api/v1/auth/google/callback'
          )}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline&prompt=consent&state=${state}`;

          return { url };
        },
        {
          detail: { tags: ['OAuth'], summary: 'Initiate Google OAuth connect' },
        }
      )
      .get(
        '/callback',
        async ({ query, user }: any) => {
          const code = query.code;
          if (!code) return { error: 'No code provided' };

          const tokenUrl = 'https://oauth2.googleapis.com/token';
          const params = new URLSearchParams();
          params.append('client_id', config.GOOGLE_CLIENT_ID!);
          params.append('client_secret', config.GOOGLE_CLIENT_SECRET!);
          params.append('code', code);
          params.append('grant_type', 'authorization_code');
          params.append('redirect_uri', 'http://localhost:3000/api/v1/auth/google/callback');

          const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          });

          const tokens = (await response.json()) as any;
          if (tokens.error) return { error: tokens.error_description || 'Failed to get tokens' };
          if (!user) return { error: 'User not authenticated' };

          await db
            .insertInto('oauth_tokens')
            .values({
              user_id: user.user_id,
              provider: 'google',
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || null,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000),
            })
            .onDuplicateKeyUpdate({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || sql`refresh_token`,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000),
            })
            .execute();

          return { success: true };
        },
        {
          detail: { tags: ['OAuth'], summary: 'Handle Google OAuth callback' },
        }
      )
  )
  .group('/api/v1/auth/microsoft', (app) =>
    app
      .get(
        '/connect',
        async () => {
          if (!config.MICROSOFT_CLIENT_ID) return { error: 'Microsoft Auth not configured' };
          const scopes = ['OnlineMeetings.ReadWrite', 'User.Read', 'offline_access'];
          const redirectUri = 'http://localhost:3000/api/v1/auth/microsoft/callback';
          const url = `https://login.microsoftonline.com/${config.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/authorize?client_id=${config.MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
            redirectUri
          )}&response_mode=query&scope=${encodeURIComponent(scopes.join(' '))}&state=12345`;

          return { url };
        },
        {
          detail: { tags: ['OAuth'], summary: 'Initiate Microsoft OAuth connect' },
        }
      )
      .get(
        '/callback',
        async ({ query, user }: any) => {
          const code = query.code;
          if (!code) return { error: 'No code provided' };

          const tokenUrl = `https://login.microsoftonline.com/${config.MICROSOFT_TENANT_ID || 'common'}/oauth2/v2.0/token`;
          const params = new URLSearchParams();
          params.append('client_id', config.MICROSOFT_CLIENT_ID!);
          params.append('scope', 'OnlineMeetings.ReadWrite User.Read offline_access');
          params.append('code', code);
          params.append('redirect_uri', 'http://localhost:3000/api/v1/auth/microsoft/callback');
          params.append('grant_type', 'authorization_code');
          params.append('client_secret', config.MICROSOFT_CLIENT_SECRET!);

          const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          });

          const tokens = (await response.json()) as any;
          if (tokens.error) return { error: tokens.error_description || 'Failed to get tokens' };
          if (!user) return { error: 'User not authenticated' };

          await db
            .insertInto('oauth_tokens')
            .values({
              user_id: user.user_id,
              provider: 'microsoft',
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || null,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000),
            })
            .onDuplicateKeyUpdate({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || sql`refresh_token`,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000),
            })
            .execute();

          return { success: true };
        },
        {
          detail: { tags: ['OAuth'], summary: 'Handle Microsoft OAuth callback' },
        }
      )
  );
