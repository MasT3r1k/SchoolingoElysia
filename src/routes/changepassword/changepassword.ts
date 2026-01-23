import { Elysia, t } from 'elysia';
import { db } from '../../../database'
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../index';
import moment from 'moment';
import { ip } from 'elysia-ip';
import * as OTPAuth from "otpauth";
import bcrypt from 'bcryptjs';
import { verify_password } from '../../functions/verify_password';
import { verifyTFA } from '../../functions/verifyTFA';

const elysiaApp = new Elysia()
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

      if (!verify_password(password)) {
        return Response.json({ error: ['Invalid password'] });
      }

      if (user['2fa'] && user['2fa_secret']) {
        if (!TFA) {
          return Response.json({ error: ["Missing 2FA"] });
        }

        const isApproved2FA = await verifyTFA(TFA, user.userId);
        if (!isApproved2FA) return Response.json({ error: ['Invalid TFA code'] });
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

        db.insertInto("auditlog")
        .values({
          userId: user.userId,
          type: 'change_password',
          data: {}
        });

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
    })
  });

export default elysiaApp;
