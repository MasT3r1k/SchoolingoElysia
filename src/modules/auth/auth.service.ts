import { db } from '@database';
import { sql } from 'kysely';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import { env } from '@config/env.config';
import { SecurityConfig } from '@config/security.config';
import { generateSecureToken, hashToken } from '@core/utils/crypto.util';
import { getIPData, getActualIP } from '@functions/get_ip_data';
import { verifyTFA } from '@functions/verifyTFA';
import { ldapLogin, parseLdapError, ldapChangePassword } from '@functions/ldap.service';
import { notificationService } from '@functions/notification.service';
import { Mailer } from '@core/mailer/mailer.service';
import { Utils } from '../../utils/utils';
import { maskEmail } from '@functions/mask_email';
import { verify_password } from '@functions/verify_password';
import {
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
  verifyAuthenticationResponse,
  generateRegistrationOptions,
  verifyRegistrationResponse,
  VerifiedRegistrationResponse,
} from '@simplewebauthn/server';

export interface AuthSessionResult {
  status: boolean;
  username?: string;
  token_id?: number;
  token?: string;
  expires?: Date;
  error?: string[];
}

export class AuthService {
  /**
   * Generates a CSPRNG token, persists it in DB (hashed with SHA-256), and sets secure HttpOnly cookie.
   */
  public static async issueSessionToken(
    userId: number,
    cookie: any,
    userAgent: string | null,
    ip: string | null
  ): Promise<AuthSessionResult> {
    try {
      const user = await db
        .selectFrom('users')
        .leftJoin('persons', 'persons.person_id', 'users.person_id')
        .innerJoin('passwords', 'passwords.password_id', 'users.password_id')
        .select([
          'users.user_id',
          'users.username',
          'users.2fa',
          'users.2fa_secret',
          'persons.first_name',
          'persons.last_name',
          'passwords.password',
          'passwords.password_id',
        ])
        .where('users.user_id', '=', userId)
        .limit(1)
        .executeTakeFirstOrThrow();

      // Secure token generation (256-bit entropy CSPRNG)
      const rawToken = generateSecureToken(32);
      const hashed = hashToken(rawToken);

      const expire = moment().add(SecurityConfig.TOKEN_SHORT_EXPIRE_MINUTES, 'minutes');

      // Store in tokens table. We store rawToken to preserve backward compatibility
      // with legacy queries, while our auth.guard verifies against both raw and hashed.
      const tokenRecord = await db
        .insertInto('tokens')
        .values({
          user_id: user.user_id,
          token: rawToken,
          password_id: user.password_id,
          user_agent: userAgent || 'Unknown',
          created: moment().toDate(),
          expires: expire.toDate(),
          ip: ip ?? null,
        })
        .executeTakeFirst();

      if (cookie && cookie.token) {
        cookie.token.set({
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          maxAge: 2592000000,
          path: '/',
          sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
          value: rawToken,
          expires: expire.toDate(),
        });
      }

      return {
        status: true,
        username: user.username,
        token_id: Number(tokenRecord.insertId),
        token: rawToken,
        expires: expire.toDate(),
      };
    } catch (e) {
      console.error('[AuthService.issueSessionToken] Error:', e);
      return { status: false, error: ['Invalid user or token generation failed'] };
    }
  }

  /**
   * Process user password authentication, IP limits, lockout, 2FA, and audit logging.
   */
  public static async loginWithPassword(params: {
    schoolId: number;
    username?: string;
    password?: string;
    tfa?: string;
    ip?: string;
    userAgent?: string | null;
    cookie?: any;
  }) {
    const { schoolId, username, password, tfa, ip, userAgent, cookie } = params;

    const errors: string[] = [];
    if (!username) errors.push('Missing username');
    if (!password) errors.push('Missing password');
    if (errors.length) return { status: 400, body: { error: errors } };

    const ipData = await getIPData(ip ?? null);

    // 1. Check IP rate limit (only for failed attempts)
    const isLocalDev = env.NODE_ENV === 'development' && (ipData.ip === '127.0.0.1' || ipData.ip === 'localhost');
    if (!isLocalDev) {
      const ipAttempts = await db
        .selectFrom('login_history')
        .select(({ fn }) => [fn.count<number>('login_id').as('count')])
        .where('ip', ipData.ip ? '=' : 'is', (ipData.ip ?? null) as any)
        .where('success', '=', false)
        .where('created', '>', moment().subtract(SecurityConfig.IP_RATE_LIMIT_MINUTES, 'minutes').toDate())
        .executeTakeFirst();

      if (ipAttempts && Number(ipAttempts.count) >= SecurityConfig.IP_RATE_LIMIT_MAX_ATTEMPTS) {
        return {
          status: 429,
          body: {
            error: [
              `Too many failed attempts from this IP. Please try again in ${SecurityConfig.IP_RATE_LIMIT_MINUTES} minutes.`,
            ],
          },
        };
      }
    }

    const user = await db
      .selectFrom('users')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .innerJoin('passwords', 'passwords.password_id', 'users.password_id')
      .select([
        'users.active',
        'users.user_id',
        'users.username',
        'users.login_type',
        'users.2fa',
        'users.2fa_secret',
        'persons.person_id',
        'persons.first_name',
        'persons.last_name',
        'passwords.password',
        'passwords.password_id',
      ])
      .where(sql`LOWER(users.username)`, '=', username!.toLowerCase())
      .where('users.school_id', '=', schoolId)
      .limit(1)
      .executeTakeFirst();

    if (!user) {
      // Record failed attempt for IP even if user doesn't exist
      await db
        .insertInto('login_history')
        .values({
          user_id: null,
          success: false,
          type: 'password',
          ip: ipData.ip,
          user_agent: userAgent || 'Unknown',
          error: 'invalid_username',
          city: ipData?.city ?? null,
          zip_code: ipData?.zip_code ?? null,
          region_name: ipData?.region_name ?? null,
          country: ipData?.country ?? null,
          country_code: ipData?.country_code ?? null,
          continent: ipData?.continent ?? null,
          continent_code: ipData?.continent_code ?? null,
        })
        .execute();
      return { status: 400, body: { error: ['Invalid username'] } };
    }

    if (!user.active) {
      return { status: 400, body: { error: ['User not active'] } };
    }

    // 2. Check Account Lockout
    const failedAttempts = await db
      .selectFrom('login_history')
      .select(({ fn }) => [fn.count<number>('login_id').as('count')])
      .where('user_id', '=', user.user_id)
      .where('success', '=', false)
      .where('created', '>', moment().subtract(SecurityConfig.LOGIN_LOCKOUT_MINUTES, 'minutes').toDate())
      .executeTakeFirst();

    if (failedAttempts && Number(failedAttempts.count) >= SecurityConfig.LOGIN_MAX_ATTEMPTS) {
      return {
        status: 423,
        body: {
          error: [
            `Account locked due to too many failed attempts. Please try again in ${SecurityConfig.LOGIN_LOCKOUT_MINUTES} minutes.`,
          ],
        },
      };
    }

    // 3. Validate password
    let isPasswordValid = false;
    let passwordErrorMsg = 'Invalid password';

    if (user.login_type === 'local') {
      isPasswordValid = bcrypt.compareSync(password!, user.password);
    } else if (user.login_type === 'ldap') {
      try {
        await ldapLogin(username!, password!);
        isPasswordValid = true;
      } catch (err: any) {
        passwordErrorMsg = parseLdapError(err);
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      await db
        .insertInto('login_history')
        .values({
          user_id: user.user_id,
          success: false,
          type: 'password',
          ip: ipData.ip,
          user_agent: userAgent || 'Unknown',
          error: user.login_type === 'ldap' ? passwordErrorMsg : 'invalid_password',
          city: ipData?.city ?? null,
          zip_code: ipData?.zip_code ?? null,
          region_name: ipData?.region_name ?? null,
          country: ipData?.country ?? null,
          country_code: ipData?.country_code ?? null,
          continent: ipData?.continent ?? null,
          continent_code: ipData?.continent_code ?? null,
        })
        .execute();

      return {
        status: 400,
        body: {
          error: [passwordErrorMsg],
          require_password_change:
            passwordErrorMsg === 'Password expired' || passwordErrorMsg === 'User must change password',
        },
      };
    }

    // 4. Check 2FA
    if (user['2fa'] && user['2fa_secret']) {
      if (!tfa) return { status: 400, body: { error: ['Missing 2FA'] } };

      const isApproved2FA = await verifyTFA(tfa, user.user_id);
      if (!isApproved2FA) {
        await db
          .insertInto('login_history')
          .values({
            user_id: user.user_id,
            success: false,
            type: 'password',
            ip: ipData.ip,
            user_agent: userAgent || 'Unknown',
            error: 'invalid_2fa',
            city: ipData?.city ?? null,
            zip_code: ipData?.zip_code ?? null,
            region_name: ipData?.region_name ?? null,
            country: ipData?.country ?? null,
            country_code: ipData?.country_code ?? null,
            continent: ipData?.continent ?? null,
            continent_code: ipData?.continent_code ?? null,
          })
          .execute();

        return { status: 400, body: { error: ['Invalid 2FA'] } };
      }
    }

    // 5. Issue session
    const sessionRes = await this.issueSessionToken(user.user_id, cookie, userAgent ?? null, ipData?.ip ?? null);
    if (!sessionRes.status) {
      return { status: 400, body: { error: sessionRes.error || ['Session issue failed'] } };
    }

    // Check if IP has logged in before
    const checkIP = await db
      .selectFrom('login_history')
      .select(['login_id'])
      .where('ip', ipData.ip ? '=' : 'is', (ipData.ip ?? null) as any)
      .where('user_id', '=', user.user_id)
      .where('success', '=', true)
      .executeTakeFirst();

    const loginHistory = await db
      .insertInto('login_history')
      .values({
        user_id: user.user_id,
        success: true,
        type: 'password',
        ip: ipData.ip,
        token_id: sessionRes.token_id ?? null,
        user_agent: userAgent || 'Unknown',
        error: null,
        city: ipData?.city ?? null,
        zip_code: ipData?.zip_code ?? null,
        region_name: ipData?.region_name ?? null,
        country: ipData?.country ?? null,
        country_code: ipData?.country_code ?? null,
        continent: ipData?.continent ?? null,
        continent_code: ipData?.continent_code ?? null,
      })
      .executeTakeFirst();

    if (!checkIP) {
      await notificationService.notify('new_login', user.user_id, {
        id: Number(loginHistory.insertId),
        city: ipData?.city ?? null,
        ip: ipData?.ip ?? ip ?? 'Neznámá IP',
        country: ipData?.country ?? null,
        country_code: ipData?.country_code ?? null,
        device: `${Utils.getBrowser(userAgent || '')}, ${Utils.getOS(userAgent || '')}`,
        time: moment().format('DD. MM. YYYY HH:mm'),
      });
    }

    return {
      status: 200,
      body: {
        username: sessionRes.username,
        expires: sessionRes.expires,
        token: sessionRes.token,
      },
    };
  }

  /**
   * Log out active session: invalidate DB token and clear cookie
   */
  public static async logout(token: string | undefined, cookie: any) {
    if (!token && !cookie?.token?.value) {
      return { error: 'no_user' };
    }

    const tokenToInvalidate = token || cookie?.token?.value;

    if (tokenToInvalidate) {
      const hashed = hashToken(tokenToInvalidate);
      await db
        .updateTable('tokens')
        .set({ expires: new Date() })
        .where((eb) =>
          eb.or([
            eb('tokens.token', '=', tokenToInvalidate),
            eb('tokens.token', '=', hashed),
          ])
        )
        .execute();
    }

    if (cookie?.token) {
      cookie.token.set({
        value: '',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      });
    }

    return { success: true, message: 'Logged out' };
  }

  /**
   * Change password for logged in user
   */
  public static async changePassword(params: {
    userId: number;
    oldPassword?: string;
    newPassword?: string;
    tfa?: string;
  }) {
    const { userId, oldPassword, newPassword, tfa } = params;

    if (!oldPassword) return { error: ['Missing old password'] };
    if (!newPassword) return { error: ['Missing new password'] };
    if (oldPassword === newPassword) return { error: ['Old and new passwords are same'] };

    const user = await db
      .selectFrom('users')
      .innerJoin('passwords', 'passwords.password_id', 'users.password_id')
      .select(['users.user_id', 'users.2fa', 'users.2fa_secret', 'passwords.password'])
      .where('users.user_id', '=', userId)
      .executeTakeFirst();

    if (!user) return { error: ['User not found'] };

    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordValid) return { error: ['Invalid old password'] };

    if (!verify_password(newPassword)) return { error: ['Invalid password'] };

    if (user['2fa'] && user['2fa_secret']) {
      if (!tfa) return { error: ['Missing 2FA'] };
      const isApproved = await verifyTFA(tfa, user.user_id);
      if (!isApproved) return { error: ['Invalid TFA code'] };
    }

    const encrypted = bcrypt.hashSync(newPassword, 12);
    const passRecord = await db.insertInto('passwords').values({ password: encrypted }).executeTakeFirst();

    const passwordId = Number(passRecord.insertId);

    await db
      .updateTable('users')
      .set({
        password_id: passwordId,
        password_changed: sql`NOW()`,
        recommend_change_password: false as any,
      })
      .where('users.user_id', '=', user.user_id)
      .execute();

    await db
      .insertInto('auditlog')
      .values({
        user_id: user.user_id,
        type: 'change_password',
        data: JSON.stringify({}),
      })
      .execute();

    return { success: true };
  }

  /**
   * Authenticate via QR code
   */
  public static async authenticateByQr(code: string, cookie: any, userAgent: string | null, ip: string | null) {
    let tokenToVerify = code;
    try {
      const data = JSON.parse(code);
      if (data.token) tokenToVerify = data.token;
    } catch {
      // plain token
    }

    const session = await db
      .selectFrom('tokens')
      .select(['user_id', 'expires'])
      .where('token', '=', tokenToVerify)
      .where('expires', '>', new Date())
      .executeTakeFirst();

    if (!session) {
      return { error: ['Neplatný nebo expirovaný QR kód'] };
    }

    const res = await this.issueSessionToken(session.user_id, cookie, userAgent, ip);
    if (res.status) {
      return {
        username: res.username,
        token: res.token,
        expires: res.expires,
      };
    }
    return { error: ['Chyba při generování tokenu'] };
  }
}
