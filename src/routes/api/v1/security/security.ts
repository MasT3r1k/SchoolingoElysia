import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';
import { verifyTFA } from '../../../../functions/verifyTFA';
import { authenticator } from 'otplib';
import * as OTPAuth from 'otpauth'
import { SecurityConfig } from '../../../../config/security.config';
import { generateNewBackupCodes } from '../../../../functions/generateNewBackupCodes';
import { ip } from 'elysia-ip';

const app = new Elysia()
    .use(ip())
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

    .post('/security', async ({ cookie, body, store }: any) => {
        const { ip } = store;

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
            case "GET_QRCODE_FOR_TFA":
                if (user['2fa']) return Response.json({ error: ['Already activated 2FA'] });
                const secret = authenticator.generateSecret();
                let totp = new OTPAuth.TOTP({
                    issuer: "Schoolingo",
                    label: user.username, // Editnout na zkratku školy + jméno uživatele
                    algorithm: "SHA1",
                    digits: SecurityConfig.TFA_TOKEN_LENGTH,
                    secret,
                });
                await db.updateTable("users")
                .set("2fa_secret", secret)
                .where("userId", "=", user.userId)
                .limit(1)
                .execute();

                return Response.json({ qrcode: totp.toString() });

            case "ACTIVATE_2FA":
                if (user['2fa']) return Response.json({ error: ['Already activated 2FA'] });
                if (!TFA || TFA == "") return Response.json({ error: ['Invalid TFA'] });

                const isTrue2FA = await verifyTFA(TFA, user.userId, false, false);
                if (!isTrue2FA) return Response.json({ error: ['Invalid TFA'] });

                await db.updateTable("users")
                .set("2fa", true)
                .set("2fa_activated", new Date())
                .where("userId", "=", user.userId)
                .limit(1)
                .execute();


                await db.insertInto("auditlog")
                .values({
                    userId: user.userId,
                    type: "activated_2FA",
                    data: {},
                    ip
                })
                .execute()

                // Generate new backup codes
                generateNewBackupCodes(user.userId);

                return Response.json({ status: true });

            case "DEACTIVATE_2FA":
                if (!user['2fa']) return Response.json({ error: ['Already deactivated 2FA'] });
                if (!TFA || TFA == "") return Response.json({ error: ['Invalid TFA'] });

                const isValid2FA = await verifyTFA(TFA, user.userId);
                if (!isValid2FA) return Response.json({ error: ['Invalid TFA'] });

                // Update 2FA status
                await db.updateTable("users")
                .set("2fa", false)
                .set("2fa_activated", null)
                .where("userId", "=", user.userId)
                .limit(1)
                .execute();

                await db.insertInto("auditlog")
                .values({
                    userId: user.userId,
                    type: "deactivated_2FA",
                    data: {},
                    ip
                })
                .execute()

                // Remove all backup codes
                await db.deleteFrom("users_backup_codes")
                .where("userId", "=", user.userId)
                .execute();

                return Response.json({ status: true })

            case "GET_BACKUP_CODES":
                if (user['2fa'] == false || !user['2fa_secret']) return Response.json({ error: ['Not activated TFA'] });
                if (!TFA || TFA == "") return Response.json({ error: ['Invalid TFA'] });

                // Verify TFA
                const isApproved2FA = await verifyTFA(TFA, user["userId"]);

                if (!isApproved2FA) {
                    return Response.json({ error: ['Invalid 2FA'] });
                }

                const codes = await db.selectFrom("users_backup_codes")
                .select([
                    'users_backup_codes.code',
                    'users_backup_codes.used'
                ])
                .where('users_backup_codes.userId', '=', user.userId)
                .orderBy('users_backup_codes.ubcId', 'asc')
                .execute()
                return Response.json({ codes });
            case "GENERATE_BACKUP_CODES":
                if (user['2fa'] == false || !user['2fa_secret']) return Response.json({ error: ['Not activated TFA'] });
                if (!TFA || TFA == "") return Response.json({ error: ['Invalid TFA'] });

                // Verify TFA
                const isRight2FA = await verifyTFA(TFA, user["userId"]);
                if (!isRight2FA) {
                    return Response.json({ error: ['Invalid 2FA'] });
                }

                const backupCodes = await generateNewBackupCodes(user.userId);
                await db.insertInto("auditlog")
                .values({
                    userId: user.userId,
                    type: "refresh_backup_codes",
                    data: {},
                    ip
                })
                .execute()
                return Response.json({ status: true, codes: backupCodes });
            default:
                return Response.json({ error: 'no_method' });
        }
    }, {
        body: t.Object({
            method: t.Optional(t.String()),
            TFA: t.Optional(t.String())
        }),
    })

export default app;
