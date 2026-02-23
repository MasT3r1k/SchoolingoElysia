import { Elysia, t } from 'elysia';
import { db } from '../../../database'
import { sql } from 'kysely';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import { verifyTFA } from '../../functions/verifyTFA';
import { getIPData } from '../../functions/get_ip_data';
import { SecurityConfig } from '../../config/security.config';
import { Mailer } from '../../../mailer.module';
import { Utils } from '../../utils/utils';

export async function authenticateUser(user_id: number, cookie: any, userAgent: string | null, ip: string) {
  try {
    const user = await db.selectFrom("users")
      .leftJoin("persons", "persons.person_id", "users.person_id")
      .innerJoin("passwords", "passwords.password_id", 'users.password_id')
      .select([
        "users.user_id",
        "users.username",
        "users.2fa",
        "users.2fa_secret",
        "persons.first_name",
        "persons.last_name",
        "passwords.password",
        'passwords.password_id'
      ])
      .where('users.user_id', '=', user_id)
      .limit(1)
      .executeTakeFirstOrThrow()

      try {
      // Generate token
      let dbToken = '';
      while (dbToken == '') {
        const tempToken = await Bun.password.hash(
          user.username +
          Bun.randomUUIDv7("hex", new Date().getTime()) +
          Date.now(),
          {
            algorithm: 'bcrypt',
            cost: 4
          }
        );

        const checkToken = await db.selectFrom("tokens")
          .select([
            'tokens.token_id'
          ])
          .where('tokens.token', '=', tempToken)
          .limit(1)
          .executeTakeFirst()
        

        if (!checkToken) {
          dbToken = tempToken;
        }
      }

      const expire = moment().add(SecurityConfig.TOKEN_SHORT_EXPIRE_MNUTES, 'minutes');
      const tokenDB = await db.insertInto("tokens")
      .values({
        user_id: user.user_id,
        token: dbToken,
        password_id: user.password_id,
        user_agent: userAgent,
        created: moment().toDate(),
        expires: expire.toDate(),
        ip
      })
      .executeTakeFirst();

      cookie.token.set({
        httpOnly: true,
        secure: true,
        maxAge: 2592000000,
        path: '/',
        sameSite: 'None',
        value: dbToken
      })

      return {
        status: true,
        username: user.username,
        token_id: Number(tokenDB.insertId),
        expires: expire.toDate()
      };
    } catch(e) {
      return {
        status: false,
        error: ['Unknown error']
      }
    }
  } catch (e) {
    return { status: false, error: ['Invalid username'] };
  }
}

const elysiaApp = new Elysia()
  .post('/auth', async ({ body, store, request, cookie, school, set }: any) => {
    if (!school) {
        set.status = 412;
        return Response.json({ error: ['School not configured'] });
    }

    const { username, password, TFA } = body;
    let err = [];

    if (!username) err.push('Missing username');
    if (!password) err.push('Missing password');

    if (err.length) return Response.json({ error: err });

    try {
      const user = await db.selectFrom("users")
        .leftJoin("persons", "persons.person_id", "users.person_id")
        .innerJoin("passwords", "passwords.password_id", 'users.password_id')
        .select([
          "users.user_id",
          "users.username",
          "users.login_type",
          "users.2fa",
          "users.2fa_secret",
          "persons.person_id",
          "persons.first_name",
          "persons.last_name",
          "passwords.password",
          'passwords.password_id'
        ])
        .where(sql`LOWER(users.username)`, '=', username.toLowerCase())
        .where('users.school_id', '=', school.school_id)
        .limit(1)
        .executeTakeFirst()

        if (!user) {
          return Response.json({ error: ['Invalid username'] })
        }

      const { ip } = store;
      const userAgent = request.headers.get("user-agent") || null;

      // ---- IP Lookup ----
      const ipData = await getIPData(ip);

      // Validate password
      // TODO ldap login
      const isPasswordValid = user.login_type == "local" ? bcrypt.compareSync(password, user.password) : false;

      if (!isPasswordValid) {
        await db.insertInto("login_history")
          .values({
            user_id: user.user_id,
            success: false,
            type: 'password',
            ip: ipData?.ip ?? ip,
            user_agent: userAgent,
            error: 'invalid_password',
            city: ipData?.city ?? null,
            zip_code: ipData?.zip_code ?? null,
            region_name: ipData?.region_name ?? null,
            country: ipData?.country ?? null,
            country_code: ipData?.country_code ?? null,
            continent: ipData?.continent ?? null,
            continent_code: ipData?.continent_code ?? null,
          })
          .execute();

        return Response.json({ error: ["Invalid password"] });
      }

      // 2FA check
      if (user['2fa'] && user['2fa_secret']) {
        if (!TFA) return Response.json({ error: ["Missing 2FA"] });

        const isApproved2FA = await verifyTFA(TFA, user["user_id"]);

        if (!isApproved2FA) {
          await db.insertInto("login_history")
            .values({
              user_id: user.user_id,
              success: false,
              type: 'password',
              ip: ipData?.ip ?? ip,
              user_agent: userAgent,
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

          return Response.json({ error: ['Invalid 2FA'] });
        }
      }

      // Authenticate user (existing logic)
      const res = await authenticateUser(user.user_id, cookie, userAgent, ipData?.ip ?? ip);
      if (res?.status === true) {
        // Check if ip has been ever logged in
        const checkIP = await db.selectFrom('login_history')
        .select([
          'login_id'
        ])
        .where('ip', '=', ipData?.ip ?? ip)
        .where('user_id', '=', user.user_id)
        .where('success', '=', true)
        .executeTakeFirst();

        const loginHistory = await db.insertInto("login_history")
          .values({
            user_id: user.user_id,
            success: true,
            type: 'password',
            ip: ipData?.ip ?? ip,
            token_id: res.token_id ?? null,
            user_agent: userAgent,
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
          await db.insertInto("notifications")
          .values({
            user_id: user.user_id,
            type: 'new_login',
            data: JSON.stringify({
              id: Number(loginHistory.insertId),
              city: ipData?.city ?? null,
              ip: ipData?.ip ?? ip,
              country: ipData?.country ?? null,
              country_code: ipData?.country_code ?? null,
            })
          })
          .execute();

          const emails = await db.selectFrom('emails')
          .select([
            'emails.email'
          ])
          .where('emails.person_id', '=', user.person_id)
          .where('emails.is_verified', '=', true)
          .execute();

          // Email notification is optional - don't fail login if email fails
          for(const email of emails) {
            try {
              await Mailer.sendFromTemplate(
                "new_login.html",
                {
                  to: email.email,
                  subject: "Nové přihlášení z neznámého zařízení",
                  data: {
                    location: `${ipData?.city}, ${ipData?.country}`,
                    security_url: "https://localhost:4200",
                    device: `${Utils.getBrowser(userAgent)}, ${Utils.getOS(userAgent)}`,
                    ip: ipData?.ip ?? ip,
                    time: moment().format('DD. MM. YYYY HH:mm')
                  }
                }
              );
            } catch (mailError) {
              // Log but don't fail the login if email sending fails
              console.warn('[Login] Failed to send new login email notification:', mailError instanceof Error ? mailError.message : 'Unknown error');
            }
          }
        }


        return Response.json({
          username: res.username,
          expires: res.expires
        });
      } else {
        return Response.json({ error: res.error })
      }
    } catch (e) {
      // Lepší error logging pro debugging
      console.error('[Login Error] Caught exception during login:', e);
      if (e instanceof Error) {
        console.error('[Login Error] Error message:', e.message);
        console.error('[Login Error] Error stack:', e.stack);
      }
      
      return Response.json({ error: ['Authentication failed. Please try again.'] })
    }
  }, {
    body: t.Optional(t.Object({
      username: t.Optional(t.String()),
      password: t.Optional(t.String()),
      TFA: t.Optional(t.String())
    }))
  })

export default elysiaApp;
