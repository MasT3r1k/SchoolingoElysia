import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import moment from 'moment';
import Database from 'bun:sqlite';
import { sql } from 'bun';

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

    .get('/payments/account/:id', async({ cookie, params }) => {
        const account_id = parseInt(params.id);
        if (account_id == undefined) {
            return { error: 'Missing account id' }
        }

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

        if (!auth || !auth.person_id) {
            return Response.json({ error: 'no_user', details: 'no_db' });
        }

        const paymentAccount = await db.selectFrom('payments_accounts')
        .select(['owner_id'])
        .where('payments_accounts.payment_account_id', '=', account_id)
        .executeTakeFirst()

        const hasAdminRights = PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT)
        const isOwner = paymentAccount?.owner_id == auth.person_id

        if (!hasAdminRights && !isOwner) {
            return Response.json({ error: 'No access' });
        }

        const inTotalLast30days = await db.selectFrom('payments_transfers')
        .select(
            db.fn.count('payments_transfers.amount').as('count')
        )
        .where('payments_transfers.target_id', '=', account_id)
        .where('payments_transfers.created_at', '>', sql`NOW() - INTERVAL 30 DAY` as any)
        .executeTakeFirst()

        const outTotalLast30days = await db.selectFrom('payments_transfers')
        .select(
            db.fn.count('payments_transfers.amount').as('count')
        )
        .where('payments_transfers.source_id', '=', account_id)
        .where('payments_transfers.created_at', '>', sql`NOW() - INTERVAL 30 DAY` as any)
        .executeTakeFirst()

        const lastPayment = await db.selectFrom('payments_transfers')
        .select(['payments_transfers.amount', 'payments_transfers.created_at'])
        .where((eb) => eb.or([
            eb('payments_transfers.source_id', '=', account_id),
            eb('payments_transfers.target_id', '=', account_id)
        ]))
        .orderBy('payment_log_id', 'desc')
        .limit(1)
        .executeTakeFirst();

        return { total_in: inTotalLast30days?.count ?? 0, total_out: outTotalLast30days?.count ?? 0, last_payment: lastPayment };
    })

    .post('/payments/account', async({ cookie, body }) => {
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

        if (!auth || !auth.person_id) {
            return Response.json({ error: 'no_user', details: 'no_db' });
        }

        const name = body.name;
        const type = body.type;
        const iban = body.iban;

        if (!type) {
            return Response.json({ error: 'missing_type' })
        }
        if (!name || name == '') {
            return Response.json({ error: 'missing_name' })
        }

        if (type == 'bank' && (iban == '' || !iban)) {
            return Response.json({ error: 'missing_iban' })
        }

        const add_account_db = await db.insertInto('payments_accounts')
        .values({
            owner_id: auth.person_id,
            type,
            name,
            balance: 0,
            iban,
            is_active: true,
            created_by: auth.user_id,
            deleted_at: null
        })
        .execute()

        return { success: true }
    }, {
        body: t.Object({
            type: t.UnionEnum(['bank', 'cash']),
            name: t.String(),
            iban: t.Nullable(t.String())
        })
    })

    .get('/payments/account_transfers/:id', async({ cookie, query, params }) => {
        const account_id = parseInt(params.id);
        if (account_id == undefined) {
            return { error: 'Missing account id' }
        }

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

        if (!auth || !auth.person_id) {
            return Response.json({ error: 'no_user', details: 'no_db' });
        }

        const paymentAccount = await db.selectFrom('payments_accounts')
        .select(['owner_id'])
        .where('payments_accounts.payment_account_id', '=', account_id)
        .executeTakeFirst()

        const hasAdminRights = PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT)
        const isOwner = paymentAccount?.owner_id == auth.person_id

        if (!hasAdminRights && !isOwner) {
            return Response.json({ error: 'No access' });
        }

        const transfersQuery = db.selectFrom('payments_transfers')
        .select([
            'payments_transfers.payment_log_id as transaction_id',
            'payments_transfers.source_id',
            'payments_transfers.source_balance',
            'payments_transfers.target_id',
            'payments_transfers.target_balance',
            'payments_transfers.amount',
            'payments_transfers.description',
            'payments_transfers.created_at'
        ])
        .where((eb) => eb.or([
            eb('payments_transfers.source_id', '=', account_id),
            eb('payments_transfers.target_id', '=', account_id)
        ]))
        .orderBy('payment_log_id', 'desc')
        
        const cursor = parseInt(query.cursor);
        if (cursor) {
            transfersQuery.where('payment_log_id', '<', cursor);
        }

        const transfers = await transfersQuery.execute();


        return transfers.map((transfer) => ({
            transaction_id: transfer.transaction_id,
            type: transfer.target_id == account_id ? 'in' : 'out',
            source_id: transfer.source_id,
            target_id: transfer.target_id,
            amount: transfer.amount,
            new_balance: transfer.target_id == account_id ? transfer.target_balance : transfer.source_balance,
            description: transfer.description,
            created_at: transfer.created_at
        }));
    })

export default app;
