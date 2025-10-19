import { Elysia, t } from 'elysia';
import { db } from '../../../database'
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../index';
import moment from 'moment';
import { ip } from 'elysia-ip';
import bcrypt from 'bcryptjs';
import { verifyTFA } from '../../functions/verifyTFA';

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

      const expire = moment().add(15, 'minutes');
      await db.insertInto("tokens")
      .values({
        userId: user.userId,
        token: dbToken,
        password: user.passwordId,
        userAgent: userAgent,
        created: moment().toDate(),
        expires: expire.toDate(),
        ip
      })
      .execute();

      cookie.token.set({
        httpOnly: true,
        secure: true,
        maxAge: 2592000000,
        path: '/',
        value: dbToken
      })

      return {
        status: true,
        username: user.username,
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
  .use(ip())
  .use(rateLimit({
    scoping: "scoped",
    max: 5,
    duration: 5 * 60 * 1000,
    injectServer: () => app.server
  }))
  .post('/auth', async ({ body, store, request, cookie }: any) => {
    const { username, password, TFA } = body;
    let err = [];
    if (!username || username == "") {
      err.push('Missing username');
    }

    if (!password || password == "") {
      err.push('Missing password');
    }

    if (err.length) {
      return Response.json({ error: err });
    }

    try {
      // Check username
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
      .executeTakeFirstOrThrow()

      // Check password
      const isPasswordValid = bcrypt.compareSync(
        password,
        user.password
      );
      const { ip } = store;


      if (!isPasswordValid) {
        await db.insertInto("login_history")
        .values({
          userId: user.userId,
          success: false,
          type: 'password',
          ip,
          userAgent: request.headers.get("user-agent") || null,
          error: 'invalid_password'
        })
        .execute()
        return Response.json({ error: ["Invalid password"] });
      }

      if (user['2fa'] && user['2fa_secret']) {
        if (!TFA || TFA == "") {
          return Response.json({ error: ["Missing 2FA"] });
        }

        // Validate 2FA
        const isApproved2FA = await verifyTFA(TFA, user["userId"])
        
        if (!isApproved2FA) {
          // Log invalid 2FA attempt
          await db.insertInto("login_history")
          .values({
            userId: user.userId,
            success: false,
            type: 'password',
            ip,
            userAgent: request.headers.get("user-agent") || null,
            error: 'invalid_2fa'
          })
          .execute()

          return Response.json({ error: ['Invalid 2FA'] });
        }
      }



      const res = await authenticateUser(user.userId, cookie, request.headers.get('user-agent'), ip);

      if (res?.status == true) {
        // Log user history with error information
        await db.insertInto("login_history")
        .values({
          userId: user.userId,
          success: true,
          type: 'password',
          ip,
          userAgent: request.headers.get("user-agent") || null,
          error: null
        })
        .execute()

        return Response.json({
          username: res.username,
          expires: res.expires
        });
      } else {
        return Response.json({ error: res.error })
      }
    } catch(e) {
      return Response.json({ error: ['Invalid username'] })
    }
  }, {
    body: t.Optional(t.Object({
      username: t.Optional(t.String()),
      password: t.Optional(t.String()),
      TFA: t.Optional(t.String())
    }))
  })

export default elysiaApp;
