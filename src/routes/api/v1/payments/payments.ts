import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import moment from 'moment';
import Database from 'bun:sqlite';

const app = new Elysia()
    // Třídní fond a přehled
    .get('/payments/regular_payments', async ({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const auth = await db
        .selectFrom('tokens')
        .leftJoin('users', 'users.user_id', 'tokens.user_id')
        .select([
            'tokens.user_id',
            'users.person_id',
            'users.role'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'no_user', details: 'no_db' });
        }

        const regular_payments = await db.selectFrom('payments_regular')
        .leftJoin('payments_regular_users', 'payments_regular_users.payment_regular_id', 'payments_regular.payment_regular_id')
        .select([
            'payments_regular.payment_regular_id',
            'payments_regular.name',
            'payments_regular.amount',
            'payments_regular.frequency',
            'payments_regular.is_active as active',
            'payments_regular.created_at',
            'payments_regular.deleted_at',
            db.fn.count('payments_regular_users.payment_regular_user_id').as("recipients")
        ])
        .groupBy('payments_regular.payment_regular_id')
        .execute();

        const canView = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_VIEW);
        const canEdit = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_EDIT);
        const canCreate = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_CREATE);
        const canDelete = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_DELETE);

        return Response.json({
            view: 'admin',
            perms: {
                canView,
                canEdit,
                canCreate,
                canDelete
            },
            payments: regular_payments
        });
    })

    .post('/payments/regular_payment', async ({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const auth = await db
        .selectFrom('tokens')
        .leftJoin('users', 'users.user_id', 'tokens.user_id')
        .select([
            'tokens.user_id',
            'users.person_id',
            'users.role'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'no_user', details: 'no_db' });
        }

        const canCreate = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_CREATE);

        if (!canCreate) return { error: 'no_permission' };
    })

    .get('/payments/accounts', async({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const auth = await db
        .selectFrom('tokens')
        .leftJoin('users', 'users.user_id', 'tokens.user_id')
        .select([
            'tokens.user_id',
            'users.person_id',
            'users.role'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'no_user', details: 'no_db' });
        }

        const accounts = await db.selectFrom('payments_accounts')
        .select([
            'payments_accounts.payment_account_id',
            'payments_accounts.type',
            'payments_accounts.name',
            'payments_accounts.iban',
            'payments_accounts.balance',
            'payments_accounts.is_active',
            'payments_accounts.created_at',
            'payments_accounts.deleted_at',
        ])
        .where('payments_accounts.owner_id', '=', auth.person_id)
        .execute()

        return accounts
    })

export default app;
