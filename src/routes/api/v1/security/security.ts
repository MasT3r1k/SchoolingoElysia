import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';
import { sleep } from 'bun';
import * as OTPAuth from "otpauth";

const app = new Elysia()
    .get('/security', async ({ cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'no_user', details: 'no_cookie' });
        }

        const [user, passkeys] = await Promise.all([
            db.selectFrom("tokens")
            .innerJoin('users', 'users.userId', 'tokens.userId')
            .select([
                'users.2fa',
                'users.2fa_activated',
                'users.fastlogin'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst(),

            db.selectFrom('tokens')
                .innerJoin('users', 'users.userId', 'tokens.userId')
                .innerJoin('users_credentials', 'users_credentials.userId', 'users.userId')
                .select([
                    'users_credentials.id',
                    'users_credentials.device_name',
                    'users_credentials.registered_at',
                    'users_credentials.last_used'
                ])
                .where('tokens.token', '=', token)
                .execute()
        ]);

        if (!user) {
            return Response.json({ error: 'no_user', details: 'no_db' });
        }

        return Response.json({...user, passkeys});
    })

    .post('/security', async ({ cookie, body }) => {
      const token = cookie.token.value;
      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .select([
            'users.userId',
            'users.username',
            'users.2fa',
            'users.2fa_activated',
            'users.2fa_secret',
            'users.fastlogin'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst()

      if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
      }


      const { method, TFA } = body;
      if (!method || method == "") return Response.json({ error: 'no_method' });

      switch(method) {
        case "GET_BACKUP_CODES":
            if (user['2fa'] == false || !user['2fa_secret']) return Response.json({ error: 'Not activated TFA' });
            if (!TFA || TFA == "") return Response.json({ error: 'Invalid TFA' });

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

            const codes = await db.selectFrom("users_backup_codes")
            .select([
                'users_backup_codes.code',
                'users_backup_codes.used'
            ])
            .where('users_backup_codes.userId', '=', user.userId)
            .execute()
            return Response.json({codes});
            break;
        }

      return Response.json(user);
    }, {
        body: t.Object({
            method: t.Optional(t.String()),
            TFA: t.Optional(t.String())
        }),
    })

export default app;
