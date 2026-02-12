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
            .innerJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person) return createErrorResponse('no_user', 'no_db');

        const { email, type, description } = body;

        // Check availability
        const exists = await db.selectFrom('emails')
            .select('email')
            .where('email', '=', email)
            .where('personId', '=', user.person)
            .executeTakeFirst();
            
        if (exists) return createErrorResponse('email_exists');

        await db.insertInto('emails')
            .values({
                personId: user.person,
                email: email,
                type: type || 'other',
                description: description || null,
                is_verified: false 
            })
            .execute();

        return createResponse({ success: true }, cookie);
    }, {
        body: t.Object({
            email: t.String(),
            type: t.Optional(t.String()),
            description: t.Optional(t.String())
        })
    })

    .put('/user/email', async ({ cookie, body }) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.userId', 'tokens.userId')
            .leftJoin('persons', 'persons.personId', 'users.person')
            .select([
                'users.userId',
                'users.person',
                'users.2fa',
                'users.2fa_secret',
                'persons.firstName'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person) return createErrorResponse('no_user', 'no_db');

        const { originalEmail, email, type, description } = body as any;

        // Verify ownership of original
        const ownership = await db.selectFrom('emails')
            .select('email')
            .where('email', '=', originalEmail)
            .where('personId', '=', user.person)
            .executeTakeFirst();

        if (!ownership) return createErrorResponse('permission_denied', 'email_not_owned');

        // Check if already has email
        const hasEmail = await db.selectFrom('emails')
        .select(['email'])
        .where('emails.personId', '=', user.person)
        .where('emails.email', '=', email)
        .executeTakeFirst();
        if (hasEmail) {
            return createErrorResponse('already_has_email');
        }

        // Check 2FA
        if (user['2fa'] && user['2fa_secret']) {
            if (!body.token) {
                return createErrorResponse('required_2fa');
            }
    
            const isApproved2FA = await verifyTFA(body.token, user['userId']);
            if (!isApproved2FA) {
                return Response.json({ error: ['Invalid 2FA'] });
            }
        }

        const emailCode = randomString(8);
        const codeExpiration = moment().add(30, 'minutes');

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
            .where('personId', '=', user.person)
            .execute();

        await Mailer.sendFromTemplate(
            "add_email.html",
            {
                to: email.email,
                subject: "Přidání emailu k účtu",
                data: {
                    firstName: user.firstName || '',
                    email,
                    code: emailCode,
                    validUntil: Utils.formatDate(codeExpiration)
                }
            }
        );

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
            .innerJoin('users', 'users.userId', 'tokens.userId')
            .select([
                'users.userId',
                'users.person',
                'users.2fa',
                'users.2fa_secret'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person) return createErrorResponse('no_user', 'no_db');

        // Check 2FA
        if (user['2fa'] && user['2fa_secret']) {
            if (!body.token) {
                return createErrorResponse('required_2fa');
            }
    
            const isApproved2FA = await verifyTFA(body.token, user['userId']);
            if (!isApproved2FA) {
                return Response.json({ error: ['Invalid 2FA'] });
            }
        }

        const { email } = body;

        await db.deleteFrom('emails')
            .where('email', '=', email)
            .where('personId', '=', user.person)
            .execute();

        return createResponse({ success: true }, cookie);
    }, {
        body: t.Object({
            email: t.String(),
            token: t.Optional(t.String())
        })
    })

    // Phone Management
    .post('/user/phone', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person) return createErrorResponse('no_user', 'no_db');

        const { number, description } = body;
        // Basic phone validation/formatting could happen here, or frontend sends cleaner data
        // Assuming number is string, let's extract code and number?
        // Schema has 'code' (number) and 'number' (string).
        // Frontend likely sends "+420 123456789". We should parse.
        // For simplicity, let's assume body sends code and number separately or we parse.
        // Let's assume frontend sends { code: 420, number: "123456789" }

        const code = body.code || 420; // Default or parsed
        
        await db.insertInto('phone_numbers')
            .values({
                personId: user.person,
                code: code,
                number: number,
                description: description || null,
                is_verified: false
            })
            .execute();

        return createResponse({ success: true }, cookie);

    }, {
        body: t.Object({
            code: t.Optional(t.Number()),
            number: t.String(),
            description: t.Optional(t.String())
        })
    })

    .put('/user/phone', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person) return createErrorResponse('no_user', 'no_db');

        const { originalNumber, code, number, description } = body;
        // originalNumber should probably identify the phone uniquely with code.
        // But let's assume number is unique per person for simplicity or verify.

        await db.updateTable('phone_numbers')
            .set({
                code: code,
                number: number,
                description: description
            })
            .where('number', '=', originalNumber)
            .where('personId', '=', user.person)
            .execute();

        return createResponse({ success: true }, cookie);
    }, {
        body: t.Object({
            originalNumber: t.String(),
            code: t.Number(),
            number: t.String(),
            description: t.Optional(t.String())
        })
    })

    .delete('/user/phone', async ({ cookie, body }: any) => {
        const token = cookie.token?.value as string;
        if (!token) return createErrorResponse('no_user', 'no_cookie');

        const user = await db.selectFrom("tokens")
            .innerJoin('users', 'users.userId', 'tokens.userId')
            .select(['users.person'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst();

        if (!user || !user.person) return createErrorResponse('no_user', 'no_db');

        const { number } = body;

        await db.deleteFrom('phone_numbers')
            .where('number', '=', number)
            .where('personId', '=', user.person)
            .execute();

        return createResponse({ success: true }, cookie);
    }, {
        body: t.Object({
            number: t.String()
        })
    });

export default app;
