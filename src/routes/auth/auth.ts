import { Elysia, t } from 'elysia';
import { db } from '../../../database'
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../index';
import moment from 'moment';
import { ip } from 'elysia-ip';
import bcrypt from 'bcryptjs';
import { verifyTFA } from '../../functions/verifyTFA';
import { getIPData } from '../../functions/get_ip_data';
import { SecurityConfig } from '../../config/security.config';

export async function authenticateUser(userId: number, cookie: any, userAgent: string, ip: string) {
  try {
    const user = await db.selectFrom("users")
      .leftJoin("persons", "persons.personId", "users.person")
      .innerJoin("passwords", "passwords.passwordId", "users.password")
      .select([
        "users.userId",
        "users.username",
        "users.2fa",
        "users.2fa_secret",
        "persons.firstName",
        "persons.lastName",
        "passwords.password",
        'passwords.passwordId'
      ])
      .where('users.userId', '=', userId)
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
            sql`COUNT(*)`.as('count')
          ])
          .where('tokens.token', '=', tempToken)
          .limit(1)
          .executeTakeFirst()
        

        if (!checkToken?.count) {
          dbToken = tempToken;
        }
      }

      const expire = moment().add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES, 'minutes');
      const tokenDB = await db.insertInto("tokens")
      .values({
        userId: user.userId,
        token: dbToken,
        password: user.passwordId,
        userAgent: userAgent,
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
  .post('/auth', async ({ body, store, request, cookie }: any) => {
    const { username, password, TFA } = body;
    let err = [];

    if (!username) err.push('Missing username');
    if (!password) err.push('Missing password');

    if (err.length) return Response.json({ error: err });

    try {
      const user = await db.selectFrom("users")
        .leftJoin("persons", "persons.personId", "users.person")
        .innerJoin("passwords", "passwords.passwordId", "users.password")
        .select([
          "users.userId",
          "users.username",
          "users.2fa",
          "users.2fa_secret",
          "persons.firstName",
          "persons.lastName",
          "passwords.password",
          'passwords.passwordId'
        ])
        .where(sql`LOWER(users.username)`, '=', username.toLowerCase())
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
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        await db.insertInto("login_history")
          .values({
            userId: user.userId,
            success: false,
            type: 'password',
            ip: ipData?.ip ?? ip,
            userAgent,
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

        const isApproved2FA = await verifyTFA(TFA, user["userId"]);

        if (!isApproved2FA) {
          await db.insertInto("login_history")
            .values({
              userId: user.userId,
              success: false,
              type: 'password',
              ip: ipData?.ip ?? ip,
              userAgent,
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
      const res = await authenticateUser(user.userId, cookie, userAgent, ipData?.ip ?? ip);

      if (res?.status === true) {
        await db.insertInto("login_history")
          .values({
            userId: user.userId,
            success: true,
            type: 'password',
            ip: ipData?.ip ?? ip,
            token_id: res.token_id ?? null,
            userAgent,
            error: null,
            city: ipData?.city ?? null,
            zip_code: ipData?.zip_code ?? null,
            region_name: ipData?.region_name ?? null,
            country: ipData?.country ?? null,
            country_code: ipData?.country_code ?? null,
            continent: ipData?.continent ?? null,
            continent_code: ipData?.continent_code ?? null,
          })
          .execute();

        return Response.json({
          username: res.username,
          expires: res.expires
        });
      } else {
        return Response.json({ error: res.error })
      }
    } catch (e) {
      return Response.json({ error: ['SQL error'] })
    }
  }, {
    body: t.Optional(t.Object({
      username: t.Optional(t.String()),
      password: t.Optional(t.String()),
      TFA: t.Optional(t.String())
    }))
  })

export default elysiaApp;
