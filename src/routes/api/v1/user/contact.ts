import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';
import { createErrorResponse, createResponse } from '../../../../utils/response.helper';
import { randomString } from '../../../../functions/random_string';
import { Mailer } from '../../../../../mailer.module';
import { Utils } from '../../../../utils/utils';
import { verifyTFA } from '../../../../functions/verifyTFA';

// TODO: Dodělat ověření 2FA
// TODO: Při přidání e-mailu vytvořit kód a následně vyžadovat zadat kód pro ověření vlastnictví e-mailu

const app = new Elysia()
    // Email Management
    .post('/user/email', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .leftJoin('persons', 'persons.person_id', 'users.person_id')
            .select([
                'users.user_id',
                'users.person_id',
                'users.2fa',
                'users.2fa_secret',
                'persons.first_name'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        const { email, type, description } = body;

        // Check availability
        const exists = await db.selectFrom('emails')
            .select(['email', 'person_id'])
            .where('email', '=', email)
            .executeTakeFirst();
            
        if (exists) {
            if (exists.person_id === user.person_id) return createErrorResponse('email_exists', 'already_yours');
            return createErrorResponse('email_exists', 'already_taken');
        }

        // Check 2FA
        if (user['2fa'] && user['2fa_secret']) {
            if (!body.token) return createErrorResponse('required_2fa');
            const isApproved2FA = await verifyTFA(body.token, user['user_id']);
            if (!isApproved2FA) return createErrorResponse('invalid_2fa');
        }

        const emailCode = Utils.randomstring(6, true).toUpperCase();
        const codeExpiration = moment().add(20, 'minutes');

        await db.insertInto('emails')
            .values({
                person_id: user.person_id,
                email: email,
                type: type || 'other',
                description: description || null,
                is_verified: false,
                email_code: emailCode,
                code_until: codeExpiration.toDate()
            })
            .execute();

        await Mailer.sendFromTemplate(
            "add_email.html",
            {
                to: email,
                subject: "Ověření e-mailu - Schoolingo",
                data: {
                    firstName: user.first_name || '',
                    email: email,
                    code: emailCode,
                    validUntil: Utils.formatDate(codeExpiration)
                }
            }
        ).catch(err => console.error('Failed to send verification email:', err));

        return createResponse({ success: true, code_valid_until: codeExpiration.toDate() }, cookie);
    }, {
        body: t.Object({
            email: t.String(),
            type: t.Optional(t.String()),
            description: t.Optional(t.String()),
            token: t.Optional(t.String())
        })
    })

    .put('/user/email', async ({ cookie, body }) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .leftJoin('persons', 'persons.person_id', 'users.person_id')
            .select([
                'users.user_id',
                'users.person_id',
                'users.2fa',
                'users.2fa_secret',
                'persons.first_name'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        const { originalEmail, email, type, description } = body as any;

        // Verify ownership of original
        const ownership = await db.selectFrom('emails')
            .select('email')
            .where('email', '=', originalEmail)
            .where('person_id', '=', user.person_id)
            .executeTakeFirst();

        if (!ownership) return createErrorResponse('permission_denied', 'email_not_owned');

        // Check 2FA
        if (user['2fa'] && user['2fa_secret']) {
            if (!body.token) return createErrorResponse('required_2fa');
            const isApproved2FA = await verifyTFA(body.token, user['user_id']);
            if (!isApproved2FA) return createErrorResponse('invalid_2fa');
        }

        // Check if new email is taken
        if (email !== originalEmail) {
            const exists = await db.selectFrom('emails')
                .select(['email', 'person_id'])
                .where('email', '=', email)
                .executeTakeFirst();
            
            if (exists) {
                if (exists.person_id === user.person_id) return createErrorResponse('email_exists', 'already_yours');
                return createErrorResponse('email_exists', 'already_taken');
            }
        }

        const emailCode = Utils.randomstring(6, true).toUpperCase();
        const codeExpiration = moment().add(20, 'minutes');

        await db.updateTable('emails')
            .set({
                email,
                type,
                description,
                is_verified: false,
                email_code: emailCode,
                code_until: codeExpiration.toDate()
            })
            .where('email', '=', originalEmail)
            .where('person_id', '=', user.person_id)
            .execute();

        await Mailer.sendFromTemplate(
            "add_email.html",
            {
                to: email,
                subject: "Změna e-mailu - Schoolingo",
                data: {
                    firstName: user.first_name || '',
                    email: email,
                    code: emailCode,
                    validUntil: Utils.formatDate(codeExpiration)
                }
            }
        ).catch(err => console.error('Failed to send verification email:', err));

        return createResponse({ success: true, code_valid_until: codeExpiration.toDate() }, cookie);
    }, {
        body: t.Object({
            originalEmail: t.String(),
            email: t.String(),
            type: t.Optional(t.String()),
            description: t.Optional(t.String()),
            token: t.Optional(t.String())
        })
    })

    .delete('/user/email', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .select([
                'users.user_id',
                'users.person_id',
                'users.2fa',
                'users.2fa_secret'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        // Check 2FA
        if (user['2fa'] && user['2fa_secret']) {
            if (!body.token) return createErrorResponse('required_2fa');
            const isApproved2FA = await verifyTFA(body.token, user['user_id']);
            if (!isApproved2FA) return createErrorResponse('invalid_2fa');
        }

        const { email } = body;

        await db.deleteFrom('emails')
            .where('email', '=', email)
            .where('person_id', '=', user.person_id)
            .execute();

        return createResponse({ success: true }, cookie);
    }, {
        body: t.Object({
            email: t.String(),
            token: t.Optional(t.String())
        })
    })

    .post('/user/email/verify/send', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .leftJoin('persons', 'persons.person_id', 'users.person_id')
            .select([
                'users.person_id',
                'persons.first_name'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        const { email } = body;

        const emailData = await db.selectFrom('emails')
            .select(['email', 'is_verified'])
            .where('email', '=', email)
            .where('person_id', '=', user.person_id)
            .executeTakeFirst();

        if (!emailData) return createErrorResponse('email_not_found');
        if (emailData.is_verified) return createErrorResponse('already_verified');

        const emailCode = Utils.randomstring(6, true).toUpperCase();
        const codeExpiration = moment().add(20, 'minutes');

        await db.updateTable('emails')
            .set({
                email_code: emailCode,
                code_until: codeExpiration.toDate()
            })
            .where('email', '=', email)
            .where('person_id', '=', user.person_id)
            .execute();

        await Mailer.sendFromTemplate(
            "add_email.html",
            {
                to: email,
                subject: "Ověřovací kód e-mailu - Schoolingo",
                data: {
                    firstName: user.first_name || '',
                    email: email,
                    code: emailCode,
                    validUntil: Utils.formatDate(codeExpiration)
                }
            }
        ).catch(err => console.error('Failed to send verification email:', err));

        return createResponse({ success: true, code_valid_until: codeExpiration.toDate() }, cookie);
    }, {
        body: t.Object({
            email: t.String()
        })
    })

    .post('/user/email/verify/confirm', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['users.user_id', 'users.person_id'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        const { email, code } = body;

        const emailData = await db.selectFrom('emails')
            .select(['email_code', 'code_until', 'is_verified'])
            .where('email', '=', email)
            .where('person_id', '=', user.person_id)
            .executeTakeFirst();

        if (!emailData) return createErrorResponse('email_not_found');
        if (emailData.is_verified) return createErrorResponse('already_verified');

        if (!emailData.email_code || emailData.email_code !== code) {
            return createErrorResponse('invalid_code');
        }

        if (!emailData.code_until || moment(emailData.code_until).isBefore(moment())) {
            return createErrorResponse('code_expired');
        }

        await db.updateTable('emails')
            .set({
                is_verified: true,
                email_code: null,
                code_until: null
            })
            .where('email', '=', email)
            .where('person_id', '=', user.person_id)
            .execute();

        return createResponse({ success: true }, cookie);
    }, {
        body: t.Object({
            email: t.String(),
            code: t.String()
        })
    })

    // Phone Management
    .post('/user/phone', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .select([
                'users.user_id',
                'users.person_id',
                'users.2fa',
                'users.2fa_secret'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        const { number, description } = body;
        const code = body.code || 420;

        // Check 2FA
        if (user['2fa'] && user['2fa_secret']) {
            if (!body.token) return createErrorResponse('required_2fa');
            const isApproved2FA = await verifyTFA(body.token, user['user_id']);
            if (!isApproved2FA) return createErrorResponse('invalid_2fa');
        }

        // Check availability
        const exists = await db.selectFrom('phone_numbers')
            .select(['number', 'person_id'])
            .where('number', '=', number)
            .executeTakeFirst();

        if (exists) {
            if (exists.person_id === user.person_id) return createErrorResponse('phone_exists', 'already_yours');
            return createErrorResponse('phone_exists', 'already_taken');
        }

        const phoneCode = Utils.randomstring(6, true);
        const codeExpiration = moment().add(20, 'minutes');

        await db.insertInto('phone_numbers')
            .values({
                person_id: user.person_id,
                code: code,
                number: number,
                description: description || null,
                is_verified: false,
                phone_code: phoneCode,
                code_until: codeExpiration.toDate()
            })
            .execute();

        // TODO: Send SMS with phoneCode
        console.log(`Sending SMS to ${code}${number} with code ${phoneCode}`);

        return createResponse({ success: true, code_valid_until: codeExpiration.toDate() }, cookie);

    }, {
        body: t.Object({
            code: t.Optional(t.Number()),
            number: t.String(),
            description: t.Optional(t.String()),
            token: t.Optional(t.String())
        })
    })

    .put('/user/phone', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .select([
                'users.user_id',
                'users.person_id',
                'users.2fa',
                'users.2fa_secret'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        const { originalNumber, code, number, description } = body;

        // Check 2FA
        if (user['2fa'] && user['2fa_secret']) {
            if (!body.token) return createErrorResponse('required_2fa');
            const isApproved2FA = await verifyTFA(body.token, user['user_id']);
            if (!isApproved2FA) return createErrorResponse('invalid_2fa');
        }

        // Check if new number is taken
        if (number !== originalNumber) {
            const exists = await db.selectFrom('phone_numbers')
                .select(['number', 'person_id'])
                .where('number', '=', number)
                .executeTakeFirst();

            if (exists) {
                if (exists.person_id === user.person_id) return createErrorResponse('phone_exists', 'already_yours');
                return createErrorResponse('phone_exists', 'already_taken');
            }
        }

        const phoneCode = Utils.randomstring(6, true);
        const codeExpiration = moment().add(20, 'minutes');

        await db.updateTable('phone_numbers')
            .set({
                code: code,
                number: number,
                description: description,
                is_verified: false,
                phone_code: phoneCode,
                code_until: codeExpiration.toDate()
            })
            .where('number', '=', originalNumber)
            .where('person_id', '=', user.person_id)
            .execute();

        // TODO: Send SMS with phoneCode
        console.log(`Sending SMS to ${code}${number} with code ${phoneCode}`);

        return createResponse({ success: true, code_valid_until: codeExpiration.toDate() }, cookie);
    }, {
        body: t.Object({
            originalNumber: t.String(),
            code: t.Number(),
            number: t.String(),
            description: t.Optional(t.String()),
            token: t.Optional(t.String())
        })
    })

    .delete('/user/phone', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .select([
                'users.user_id',
                'users.person_id',
                'users.2fa',
                'users.2fa_secret'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        // Check 2FA
        if (user['2fa'] && user['2fa_secret']) {
            if (!body.token) return createErrorResponse('required_2fa');
            const isApproved2FA = await verifyTFA(body.token, user['user_id']);
            if (!isApproved2FA) return createErrorResponse('invalid_2fa');
        }

        const { number } = body;

        await db.deleteFrom('phone_numbers')
            .where('number', '=', number)
            .where('person_id', '=', user.person_id)
            .execute();

        return createResponse({ success: true }, cookie);
    }, {
        body: t.Object({
            number: t.String(),
            token: t.Optional(t.String())
        })
    })

    .post('/user/phone/verify/send', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['users.person_id'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        const { number } = body;

        const phoneData = await db.selectFrom('phone_numbers')
            .select(['code', 'number', 'is_verified'])
            .where('number', '=', number)
            .where('person_id', '=', user.person_id)
            .executeTakeFirst();

        if (!phoneData) return createErrorResponse('phone_not_found');
        if (phoneData.is_verified) return createErrorResponse('already_verified');

        const phoneCode = Utils.randomstring(6, true);
        const codeExpiration = moment().add(20, 'minutes');

        await db.updateTable('phone_numbers')
            .set({
                phone_code: phoneCode,
                code_until: codeExpiration.toDate()
            })
            .where('number', '=', number)
            .where('person_id', '=', user.person_id)
            .execute();

        // TODO: Send SMS with phoneCode
        console.log(`Sending SMS to ${phoneData.code}${number} with code ${phoneCode}`);

        return createResponse({ success: true, code_valid_until: codeExpiration.toDate() }, cookie);
    }, {
        body: t.Object({
            number: t.String()
        })
    })

    .post('/user/phone/verify/confirm', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['users.person_id'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person_id) return createErrorResponse('no_user', 'no_db');

        const { number, code } = body;

        const phoneData = await db.selectFrom('phone_numbers')
            .select(['phone_code', 'code_until', 'is_verified'])
            .where('number', '=', number)
            .where('person_id', '=', user.person_id)
            .executeTakeFirst();

        if (!phoneData) return createErrorResponse('phone_not_found');
        if (phoneData.is_verified) return createErrorResponse('already_verified');

        if (!phoneData.phone_code || phoneData.phone_code !== code) {
            return createErrorResponse('invalid_code');
        }

        if (!phoneData.code_until || moment(phoneData.code_until).isBefore(moment())) {
            return createErrorResponse('code_expired');
        }

        await db.updateTable('phone_numbers')
            .set({
                is_verified: true,
                phone_code: null,
                code_until: null
            })
            .where('number', '=', number)
            .where('person_id', '=', user.person_id)
            .execute();

        return createResponse({ success: true }, cookie);
    }, {
        body: t.Object({
            number: t.String(),
            code: t.String()
        })
    });

export default app;
