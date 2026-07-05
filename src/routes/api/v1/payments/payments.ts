import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import moment from 'moment';

async function getAuth(token: string | undefined) {
    if (!token) return null;
    return db
        .selectFrom('tokens')
        .leftJoin('users', 'users.user_id', 'tokens.user_id')
        .select(['tokens.user_id', 'users.person_id', 'users.role'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst();
}

const app = new Elysia()
    .get('/payments/regular_payments', async ({ cookie }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

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
                db.fn.count('payments_regular_users.payment_regular_user_id').as('recipients')
            ])
            .where('payments_regular.deleted_at', 'is', null)
            .groupBy('payments_regular.payment_regular_id')
            .execute();

        const canView   = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_VIEW);
        const canEdit   = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_EDIT);
        const canCreate = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_CREATE);
        const canDelete = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_DELETE);

        return Response.json({
            view: 'admin',
            perms: { canView, canEdit, canCreate, canDelete },
            payments: regular_payments
        });
    })

    .post('/payments/regular_payment', async ({ cookie, body }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const canCreate = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_REGULAR_ADMIN_CREATE);
        if (!canCreate) return Response.json({ error: 'no_permission' }, { status: 403 });

        const { name, amount, frequency, class_id } = body as any;

        if (!name || name.trim() === '') return Response.json({ error: 'missing_name' });
        if (!amount || parseFloat(amount) <= 0) return Response.json({ error: 'invalid_amount' });
        if (!frequency) return Response.json({ error: 'missing_frequency' });

        const result = await db.insertInto('payments_regular')
            .values({
                name: name.trim(),
                amount: String(parseFloat(amount)),
                frequency,
                is_active: 1,
                created_by: auth.user_id,
                deleted_at: null
            })
            .execute();

        const payment_regular_id = Number(result[0].insertId);

        if (class_id) {
            const students = await db.selectFrom('students')
                .leftJoin('persons', 'persons.person_id', 'students.person_id')
                .select(['students.person_id'])
                .where('students.class_id', '=', class_id)
                .execute();

            if (students.length > 0) {
                await db.insertInto('payments_regular_users')
                    .values(
                        students.map((s) => ({
                            payment_regular_id,
                            person_id: s.person_id!,
                            payer_id: s.person_id!,
                            payment_account_id: 0,
                            amount: String(parseFloat(amount)),
                            frequency,
                            frequency_index: 0,
                            is_active: 1,
                            note: null,
                            created_by: auth.user_id,
                            deleted_at: null
                        }))
                    )
                    .execute();
            }
        }

        return Response.json({ success: true, payment_regular_id });
    }, {
        body: t.Object({
            name: t.String(),
            amount: t.Union([t.String(), t.Number()]),
            frequency: t.UnionEnum(['daily', 'weekly', 'monthly', 'yearly']),
            class_id: t.Optional(t.Nullable(t.Number()))
        })
    })

    .get('/payments/fees', async ({ cookie, query }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        let feesQuery = db.selectFrom('payments_fees')
            .leftJoin('payments_categories', 'payments_categories.category_id', 'payments_fees.category_id')
            .leftJoin('classes', 'classes.class_id', 'payments_fees.class_id')
            .leftJoin('payments_assigned_fees', 'payments_assigned_fees.payment_fee_id', 'payments_fees.payment_fee_id')
            .select([
                'payments_fees.payment_fee_id',
                'payments_fees.name',
                'payments_fees.amount',
                'payments_fees.due_date',
                'payments_fees.description',
                'payments_fees.is_draft',
                'payments_fees.created_at',
                'payments_categories.category',
                'classes.name as class_name' as any,
                'payments_fees.class_id',
                db.fn.count('payments_assigned_fees.payment_assign_id').as('total_assigned'),
            ])
            .where('payments_fees.deleted_at', 'is', null)
            .groupBy('payments_fees.payment_fee_id')
            .orderBy('payments_fees.created_at', 'desc');

        if (query.class_id) {
            feesQuery = feesQuery.where('payments_fees.class_id', '=', parseInt(query.class_id as string));
        }

        const fees = await feesQuery.execute();
        return Response.json(fees);
    })

    .post('/payments/fee', async ({ cookie, body }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const canCreate = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADD);
        if (!canCreate) return Response.json({ error: 'no_permission' }, { status: 403 });

        const { name, amount, due_date, description, category_id, class_id, is_draft } = body as any;

        if (!name || name.trim() === '') return Response.json({ error: 'missing_name' });
        if (!amount || parseFloat(amount) <= 0) return Response.json({ error: 'invalid_amount' });
        if (!due_date) return Response.json({ error: 'missing_due_date' });
        if (!category_id) return Response.json({ error: 'missing_category' });

        const result = await db.insertInto('payments_fees')
            .values({
                name: name.trim(),
                amount: String(parseFloat(amount)),
                due_date: new Date(due_date),
                description: description ?? '',
                category_id,
                class_id: class_id ?? null,
                reminder_days: 7,
                is_draft: is_draft ? 1 : 0,
                file_id: 0,
                created_by: auth.user_id,
                deleted_at: null
            })
            .execute();

        const payment_fee_id = Number(result[0].insertId);

        if (class_id && !is_draft) {
            const students = await db.selectFrom('students')
                .leftJoin('persons', 'persons.person_id', 'students.person_id')
                .select(['students.person_id'])
                .where('students.class_id', '=', class_id)
                .execute();

            if (students.length > 0) {
                const vsBase = Date.now();
                await db.insertInto('payments_assigned_fees')
                    .values(
                        students.map((s, i) => ({
                            payment_fee_id,
                            person_id: s.person_id!,
                            payer_id: s.person_id!,
                            variable_symbol: String(vsBase + i),
                            specific_symbol: '',
                            constant_symbol: '0308',
                            status: 'pending' as const
                        }))
                    )
                    .execute();
            }
        }

        return Response.json({ success: true, payment_fee_id });
    }, {
        body: t.Object({
            name: t.String(),
            amount: t.Union([t.String(), t.Number()]),
            due_date: t.String(),
            description: t.Optional(t.String()),
            category_id: t.Number(),
            class_id: t.Optional(t.Nullable(t.Number())),
            is_draft: t.Optional(t.Boolean())
        })
    })

    .delete('/payments/fee/:id', async ({ cookie, params }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const canDelete = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADD);
        if (!canDelete) return Response.json({ error: 'no_permission' }, { status: 403 });

        const fee_id = parseInt(params.id);
        if (isNaN(fee_id)) return Response.json({ error: 'invalid_id' });

        await db.updateTable('payments_fees')
            .set({ deleted_at: moment().toDate() })
            .where('payment_fee_id', '=', fee_id)
            .execute();

        return Response.json({ success: true });
    })

    .get('/payments/my_fees', async ({ cookie }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const fees = await db.selectFrom('payments_assigned_fees')
            .leftJoin('payments_fees', 'payments_fees.payment_fee_id', 'payments_assigned_fees.payment_fee_id')
            .leftJoin('payments_categories', 'payments_categories.category_id', 'payments_fees.category_id')
            .select([
                'payments_assigned_fees.payment_assign_id',
                'payments_assigned_fees.status',
                'payments_assigned_fees.variable_symbol',
                'payments_fees.payment_fee_id',
                'payments_fees.name',
                'payments_fees.amount',
                'payments_fees.due_date',
                'payments_fees.description',
                'payments_categories.category',
            ])
            .where('payments_assigned_fees.person_id', '=', auth.person_id)
            .where('payments_fees.deleted_at', 'is', null)
            .orderBy('payments_fees.due_date', 'asc')
            .execute();

        return Response.json(fees);
    })

    .get('/payments/overview', async ({ cookie }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const canViewAdmin = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_OVERVIEW);

        if (canViewAdmin) {
            // Admin/vedení pohled — celoškolní statistiky
            const totalCollected = await db.selectFrom('payments_payments')
                .select(db.fn.sum('payments_payments.amount').as('total'))
                .where('payments_payments.deleted_at', 'is', null)
                .executeTakeFirst();

            const pendingFees = await db.selectFrom('payments_assigned_fees')
                .leftJoin('payments_fees', 'payments_fees.payment_fee_id', 'payments_assigned_fees.payment_fee_id')
                .select(db.fn.sum('payments_fees.amount').as('total'))
                .where('payments_assigned_fees.status', '=', 'pending')
                .where('payments_fees.deleted_at', 'is', null)
                .executeTakeFirst();

            const overdueFees = await db.selectFrom('payments_assigned_fees')
                .leftJoin('payments_fees', 'payments_fees.payment_fee_id', 'payments_assigned_fees.payment_fee_id')
                .select(db.fn.sum('payments_fees.amount').as('total'))
                .where('payments_assigned_fees.status', '=', 'pending')
                .where('payments_fees.due_date', '<', moment().toDate() as any)
                .where('payments_fees.deleted_at', 'is', null)
                .executeTakeFirst();

            const activeFees = await db.selectFrom('payments_fees')
                .leftJoin('payments_assigned_fees', 'payments_assigned_fees.payment_fee_id', 'payments_fees.payment_fee_id')
                .select([
                    'payments_fees.payment_fee_id',
                    'payments_fees.name',
                    'payments_fees.due_date',
                    'payments_fees.amount',
                    'payments_fees.class_id',
                    db.fn.count('payments_assigned_fees.payment_assign_id').as('total'),
                    db.fn
                        .count('payments_assigned_fees.payment_assign_id')
                        .filterWhere('payments_assigned_fees.status', '=', 'paid')
                        .as('paid'),
                ])
                .where('payments_fees.deleted_at', 'is', null)
                .where('payments_fees.is_draft', '=', 0)
                .groupBy('payments_fees.payment_fee_id')
                .orderBy('payments_fees.due_date', 'asc')
                .execute();

            const overdueCount = await db.selectFrom('payments_assigned_fees')
                .leftJoin('payments_fees', 'payments_fees.payment_fee_id', 'payments_assigned_fees.payment_fee_id')
                .select(db.fn.count('payments_assigned_fees.payment_assign_id').as('count'))
                .where('payments_assigned_fees.status', '=', 'pending')
                .where('payments_fees.due_date', '<', moment().toDate() as any)
                .where('payments_fees.deleted_at', 'is', null)
                .executeTakeFirst();

            return Response.json({
                role: 'admin',
                stats: {
                    total_collected: parseFloat((totalCollected?.total as string) ?? '0') || 0,
                    pending_amount: parseFloat((pendingFees?.total as string) ?? '0') || 0,
                    overdue_amount: parseFloat((overdueFees?.total as string) ?? '0') || 0,
                    active_fees_count: activeFees.length,
                    overdue_count: Number(overdueCount?.count ?? 0),
                },
                active_fees: activeFees
            });
        }

        if (!auth.person_id) return Response.json({ error: 'no_person' });

        const myPending = await db.selectFrom('payments_assigned_fees')
            .leftJoin('payments_fees', 'payments_fees.payment_fee_id', 'payments_assigned_fees.payment_fee_id')
            .select([
                'payments_assigned_fees.payment_assign_id',
                'payments_assigned_fees.status',
                'payments_assigned_fees.variable_symbol',
                'payments_fees.name',
                'payments_fees.amount',
                'payments_fees.due_date',
                'payments_fees.description',
            ])
            .where('payments_assigned_fees.person_id', '=', auth.person_id)
            .where('payments_assigned_fees.status', 'in', ['pending', 'partially_paid'])
            .where('payments_fees.deleted_at', 'is', null)
            .orderBy('payments_fees.due_date', 'asc')
            .execute();

        const myPaid = await db.selectFrom('payments_assigned_fees')
            .leftJoin('payments_fees', 'payments_fees.payment_fee_id', 'payments_assigned_fees.payment_fee_id')
            .leftJoin('payments_payments', 'payments_payments.payment_assign_id', 'payments_assigned_fees.payment_assign_id')
            .select([
                'payments_assigned_fees.payment_assign_id',
                'payments_fees.name',
                'payments_fees.amount',
                'payments_payments.paid_at',
            ])
            .where('payments_assigned_fees.person_id', '=', auth.person_id)
            .where('payments_assigned_fees.status', '=', 'paid')
            .where('payments_fees.deleted_at', 'is', null)
            .orderBy('payments_payments.paid_at', 'desc')
            .execute();

        return Response.json({
            role: 'parent',
            pending: myPending,
            paid: myPaid,
        });
    })

    .get('/payments/admin/accounts', async ({ cookie }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        if (!hasAdminRights) return Response.json({ error: 'no_access' }, { status: 403 });

        const accounts = await db.selectFrom('payments_accounts')
            .leftJoin('persons', 'persons.person_id', 'payments_accounts.owner_id')
            .select([
                'payments_accounts.payment_account_id',
                'payments_accounts.type',
                'payments_accounts.name',
                'payments_accounts.iban',
                'payments_accounts.balance',
                'payments_accounts.is_active',
                'payments_accounts.created_at',
                'persons.first_name',
                'persons.last_name'
            ])
            .where('payments_accounts.deleted_at', 'is', null)
            .execute();

        return Response.json(accounts);
    })

    .get('/payments/accounts', async ({ cookie }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

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
            .where('payments_accounts.deleted_at', 'is', null)
            .execute();

        return Response.json(accounts);
    })

    .get('/payments/account/:id', async ({ cookie, params }) => {
        const account_id = parseInt(params.id);
        if (isNaN(account_id)) return Response.json({ error: 'invalid_id' });

        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const paymentAccount = await db.selectFrom('payments_accounts')
            .select(['owner_id'])
            .where('payments_accounts.payment_account_id', '=', account_id)
            .executeTakeFirst();

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        const isOwner = paymentAccount?.owner_id == auth.person_id;

        if (!hasAdminRights && !isOwner) return Response.json({ error: 'no_access' }, { status: 403 });

        const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

        const inTotal = await db.selectFrom('payments_transfers')
            .select(db.fn.sum('payments_transfers.amount').as('total'))
            .where('payments_transfers.target_id', '=', account_id)
            .where('payments_transfers.created_at', '>=', thirtyDaysAgo as any)
            .executeTakeFirst();

        const outTotal = await db.selectFrom('payments_transfers')
            .select(db.fn.sum('payments_transfers.amount').as('total'))
            .where('payments_transfers.source_id', '=', account_id)
            .where('payments_transfers.created_at', '>=', thirtyDaysAgo as any)
            .executeTakeFirst();

        const lastPayment = await db.selectFrom('payments_transfers')
            .select(['payments_transfers.amount', 'payments_transfers.created_at'])
            .where((eb) => eb.or([
                eb('payments_transfers.source_id', '=', account_id),
                eb('payments_transfers.target_id', '=', account_id)
            ]))
            .orderBy('payment_log_id', 'desc')
            .limit(1)
            .executeTakeFirst();

        return Response.json({
            total_in: parseFloat((inTotal?.total as string) ?? '0') || 0,
            total_out: parseFloat((outTotal?.total as string) ?? '0') || 0,
            last_payment: lastPayment ?? null
        });
    })

    .patch('/payments/account/:id', async ({ cookie, params, body }) => {
        const account_id = parseInt(params.id);
        if (isNaN(account_id)) return Response.json({ error: 'invalid_id' });

        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const paymentAccount = await db.selectFrom('payments_accounts')
            .select(['owner_id'])
            .where('payments_accounts.payment_account_id', '=', account_id)
            .executeTakeFirst();

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        if (!hasAdminRights && paymentAccount?.owner_id != auth.person_id) return Response.json({ error: 'no_access' }, { status: 403 });

        const { name } = body as { name: string };
        if (!name || name.trim() === '') return Response.json({ error: 'missing_name' });

        await db.updateTable('payments_accounts')
            .set({ name: name.trim() })
            .where('payment_account_id', '=', account_id)
            .execute();

        return Response.json({ success: true });
    })

    .get('/payments/account/:id/settings', async ({ cookie, params }) => {
        const account_id = parseInt(params.id);
        if (isNaN(account_id)) return Response.json({ error: 'invalid_id' });

        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const paymentAccount = await db.selectFrom('payments_accounts')
            .select(['owner_id'])
            .where('payments_accounts.payment_account_id', '=', account_id)
            .executeTakeFirst();

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        if (!hasAdminRights && paymentAccount?.owner_id != auth.person_id) return Response.json({ error: 'no_access' }, { status: 403 });

        const settings = await db.selectFrom('payments_account_settings')
            .selectAll()
            .where('payment_account_id', '=', account_id)
            .executeTakeFirst();

        if (settings) {
            return Response.json({
                low_balance_threshold: settings.low_balance_threshold,
                notify_every_transaction: !!settings.notify_every_transaction,
                notify_monthly_summary: !!settings.notify_monthly_summary,
                share_with_guardians: !!settings.share_with_guardians
            });
        }

        return Response.json({
            low_balance_threshold: null,
            notify_every_transaction: false,
            notify_monthly_summary: false,
            share_with_guardians: false
        });
    })

    .patch('/payments/account/:id/settings', async ({ cookie, params, body }) => {
        const account_id = parseInt(params.id);
        if (isNaN(account_id)) return Response.json({ error: 'invalid_id' });

        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const paymentAccount = await db.selectFrom('payments_accounts')
            .select(['owner_id'])
            .where('payments_accounts.payment_account_id', '=', account_id)
            .executeTakeFirst();

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        if (!hasAdminRights && paymentAccount?.owner_id != auth.person_id) return Response.json({ error: 'no_access' }, { status: 403 });

        const { low_balance_threshold, notify_every_transaction, notify_monthly_summary, share_with_guardians, name } = body as any;

        const existing = await db.selectFrom('payments_account_settings')
            .select('payment_account_id')
            .where('payment_account_id', '=', account_id)
            .executeTakeFirst();

        const data = {
            low_balance_threshold: low_balance_threshold ?? null,
            notify_every_transaction: notify_every_transaction ? 1 : 0,
            notify_monthly_summary: notify_monthly_summary ? 1 : 0,
            share_with_guardians: share_with_guardians ? 1 : 0
        };

        if (existing) {
            await db.updateTable('payments_account_settings')
                .set(data)
                .where('payment_account_id', '=', account_id)
                .execute();
        } else {
            await db.insertInto('payments_account_settings')
                .values({
                    payment_account_id: account_id,
                    ...data
                })
                .execute();
        }

        // if name was changed in settings form
        if (name && name.trim() !== '') {
            await db.updateTable('payments_accounts')
                .set({ name: name.trim() })
                .where('payment_account_id', '=', account_id)
                .execute();
        }

        return Response.json({ success: true });
    })

    .post('/payments/account', async ({ cookie, body }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const { type, name, iban } = body;

        if (!name || name.trim() === '') return Response.json({ error: 'missing_name' });
        if (!type) return Response.json({ error: 'missing_type' });
        if (type === 'bank' && (!iban || iban.trim() === '')) return Response.json({ error: 'missing_iban' });

        await db.insertInto('payments_accounts')
            .values({
                owner_id: auth.person_id,
                type,
                name: name.trim(),
                balance: 0,
                iban: type === 'bank' ? iban!.trim().replace(/\s/g, '') : null,
                is_active: true,
                created_by: auth.user_id,
                deleted_at: null
            })
            .execute();

        return Response.json({ success: true });
    }, {
        body: t.Object({
            type: t.UnionEnum(['bank', 'cash']),
            name: t.String(),
            iban: t.Nullable(t.String())
        })
    })

    .get('/payments/account_transfers/:id', async ({ cookie, query, params }) => {
        const account_id = parseInt(params.id);
        if (isNaN(account_id)) return Response.json({ error: 'invalid_id' });

        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const paymentAccount = await db.selectFrom('payments_accounts')
            .select(['owner_id'])
            .where('payments_accounts.payment_account_id', '=', account_id)
            .executeTakeFirst();

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        const isOwner = paymentAccount?.owner_id == auth.person_id;

        if (!hasAdminRights && !isOwner) return Response.json({ error: 'no_access' }, { status: 403 });

        let transfersQuery = db.selectFrom('payments_transfers')
            .select([
                'payments_transfers.payment_log_id as transaction_id',
                'payments_transfers.source_id',
                'payments_transfers.source_balance',
                'payments_transfers.target_id',
                'payments_transfers.target_balance',
                'payments_transfers.amount',
                'payments_transfers.description',
                'payments_transfers.category',
                'payments_transfers.created_at'
            ])
            .where((eb) => eb.or([
                eb('payments_transfers.source_id', '=', account_id),
                eb('payments_transfers.target_id', '=', account_id)
            ]))
            .orderBy('payment_log_id', 'desc')
            .limit(50);

        const cursor = parseInt(query.cursor as string);
        if (!isNaN(cursor) && cursor > 0) {
            transfersQuery = transfersQuery.where('payment_log_id', '<', cursor);
        }

        const transfers = await transfersQuery.execute();

        return Response.json(transfers.map((t) => ({
            transaction_id: t.transaction_id,
            type: t.target_id == account_id ? 'in' : 'out',
            source_id: t.source_id,
            target_id: t.target_id,
            amount: t.amount,
            new_balance: t.target_id == account_id ? t.target_balance : t.source_balance,
            description: t.description,
            category: t.category,
            created_at: t.created_at
        })));
    })

    .patch('/payments/transfer/:id', async ({ cookie, params, body }) => {
        const transfer_id = parseInt(params.id);
        if (isNaN(transfer_id)) return Response.json({ error: 'invalid_id' });

        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const transfer = await db.selectFrom('payments_transfers')
            .select(['source_id', 'target_id'])
            .where('payment_log_id', '=', transfer_id)
            .executeTakeFirst();

        if (!transfer) return Response.json({ error: 'not_found' }, { status: 404 });

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);

        if (!hasAdminRights) {
            // Check if user owns source or target
            const userAccounts = await db.selectFrom('payments_accounts')
                .select('payment_account_id')
                .where('owner_id', '=', auth.person_id)
                .execute();
            const myAccountIds = userAccounts.map(a => a.payment_account_id);
            
            const ownsSource = transfer.source_id !== null && myAccountIds.includes(transfer.source_id);
            const ownsTarget = transfer.target_id !== null && myAccountIds.includes(transfer.target_id);
            
            if (!ownsSource && !ownsTarget) {
                return Response.json({ error: 'no_access' }, { status: 403 });
            }
        }

        const { description, category } = body as any;

        await db.updateTable('payments_transfers')
            .set({ 
                description: description || null,
                category: category || null
            })
            .where('payment_log_id', '=', transfer_id)
            .execute();

        return Response.json({ success: true });
    })

    .post('/payments/deposit', async ({ cookie, body }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const { target_account_id, amount, description } = body as any;
        const amountNum = parseFloat(amount);

        if (isNaN(amountNum) || amountNum <= 0) return Response.json({ error: 'invalid_amount' });

        const targetAccount = await db.selectFrom('payments_accounts')
            .select(['payment_account_id', 'balance', 'owner_id', 'is_active'])
            .where('payment_account_id', '=', target_account_id)
            .executeTakeFirst();

        if (!targetAccount) return Response.json({ error: 'account_not_found' }, { status: 404 });
        if (!targetAccount.is_active) return Response.json({ error: 'account_inactive' }, { status: 400 });

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        const isOwner = targetAccount.owner_id == auth.person_id;
        if (!hasAdminRights && !isOwner) return Response.json({ error: 'no_access' }, { status: 403 });

        const currentBalance = parseFloat(targetAccount.balance as any) || 0;
        const newBalance = currentBalance + amountNum;

        await db.transaction().execute(async (trx) => {
            await trx.updateTable('payments_accounts')
                .set({ balance: newBalance })
                .where('payment_account_id', '=', target_account_id)
                .execute();

            await trx.insertInto('payments_transfers')
                .values({
                    source_id: null,          // null = vnější zdroj (hotovost/banka)
                    target_id: target_account_id,
                    source_balance: 0,
                    target_balance: newBalance,
                    type: 'in',
                    amount: amountNum,
                    description: description ?? null,
                    created_by: auth.user_id,
                })
                .execute();
        });

        return Response.json({ success: true, new_balance: newBalance });
    }, {
        body: t.Object({
            target_account_id: t.Number(),
            amount: t.Union([t.String(), t.Number()]),
            description: t.Optional(t.Nullable(t.String()))
        })
    })

    .post('/payments/expense', async ({ cookie, body }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const { source_account_id, amount, description } = body as any;
        const amountNum = parseFloat(amount);

        if (isNaN(amountNum) || amountNum <= 0) return Response.json({ error: 'invalid_amount' });

        const sourceAccount = await db.selectFrom('payments_accounts')
            .select(['payment_account_id', 'balance', 'owner_id', 'is_active'])
            .where('payment_account_id', '=', source_account_id)
            .executeTakeFirst();

        if (!sourceAccount) return Response.json({ error: 'account_not_found' }, { status: 404 });
        if (!sourceAccount.is_active) return Response.json({ error: 'account_inactive' }, { status: 400 });

        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        const isOwner = sourceAccount.owner_id == auth.person_id;
        if (!hasAdminRights && !isOwner) return Response.json({ error: 'no_access' }, { status: 403 });

        const currentBalance = parseFloat(sourceAccount.balance as any) || 0;
        if (currentBalance < amountNum) return Response.json({ error: 'insufficient_funds' }, { status: 400 });

        const newBalance = currentBalance - amountNum;

        await db.transaction().execute(async (trx) => {
            await trx.updateTable('payments_accounts')
                .set({ balance: newBalance })
                .where('payment_account_id', '=', source_account_id)
                .execute();

            await trx.insertInto('payments_transfers')
                .values({
                    source_id: source_account_id,
                    target_id: null,
                    source_balance: newBalance,
                    target_balance: 0,
                    type: 'out',
                    amount: amountNum,
                    description: description ?? null,
                    created_by: auth.user_id,
                })
                .execute();
        });

        return Response.json({ success: true, new_balance: newBalance });
    }, {
        body: t.Object({
            source_account_id: t.Number(),
            amount: t.Union([t.String(), t.Number()]),
            description: t.Optional(t.Nullable(t.String()))
        })
    })

    .post('/payments/transfer', async ({ cookie, body }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const { source_account_id, target_account_id, amount, description } = body as any;
        const amountNum = parseFloat(amount);

        if (isNaN(amountNum) || amountNum <= 0) return Response.json({ error: 'invalid_amount' });
        if (source_account_id === target_account_id) return Response.json({ error: 'same_account' });

        const sourceAccount = await db.selectFrom('payments_accounts')
            .select(['payment_account_id', 'balance', 'owner_id', 'is_active'])
            .where('payment_account_id', '=', source_account_id)
            .executeTakeFirst();

        const targetAccount = await db.selectFrom('payments_accounts')
            .select(['payment_account_id', 'balance', 'owner_id', 'is_active'])
            .where('payment_account_id', '=', target_account_id)
            .executeTakeFirst();

        if (!sourceAccount || !targetAccount) return Response.json({ error: 'account_not_found' }, { status: 404 });

        const isSourceOwner = sourceAccount.owner_id == auth.person_id;
        const hasAdminRights = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.PAYMENTS_ADMIN_VIEW_ACCOUNT);
        if (!hasAdminRights && !isSourceOwner) return Response.json({ error: 'no_access' }, { status: 403 });

        const sourceBalance = parseFloat(sourceAccount.balance as any) || 0;
        const targetBalance = parseFloat(targetAccount.balance as any) || 0;

        if (sourceBalance < amountNum) return Response.json({ error: 'insufficient_funds' }, { status: 400 });

        const newSourceBalance = sourceBalance - amountNum;
        const newTargetBalance = targetBalance + amountNum;

        await db.transaction().execute(async (trx) => {
            await trx.updateTable('payments_accounts')
                .set({ balance: newSourceBalance })
                .where('payment_account_id', '=', source_account_id)
                .execute();

            await trx.updateTable('payments_accounts')
                .set({ balance: newTargetBalance })
                .where('payment_account_id', '=', target_account_id)
                .execute();

            await trx.insertInto('payments_transfers')
                .values({
                    source_id: source_account_id,
                    target_id: target_account_id,
                    source_balance: newSourceBalance,
                    target_balance: newTargetBalance,
                    type: 'out',
                    amount: amountNum,
                    description: description ?? null,
                    created_by: auth.user_id,
                })
                .execute();
        });

        return Response.json({ success: true, new_source_balance: newSourceBalance, new_target_balance: newTargetBalance });
    }, {
        body: t.Object({
            source_account_id: t.Number(),
            target_account_id: t.Number(),
            amount: t.Union([t.String(), t.Number()]),
            description: t.Optional(t.Nullable(t.String()))
        })
    })

    .post('/payments/confirm_fee', async ({ cookie, body }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const { payment_assign_id, method, account_id } = body as any;

        const assigned = await db.selectFrom('payments_assigned_fees')
            .leftJoin('payments_fees', 'payments_fees.payment_fee_id', 'payments_assigned_fees.payment_fee_id')
            .select([
                'payments_assigned_fees.payment_assign_id',
                'payments_assigned_fees.person_id',
                'payments_assigned_fees.status',
                'payments_fees.amount',
                'payments_fees.payment_fee_id',
            ])
            .where('payments_assigned_fees.payment_assign_id', '=', payment_assign_id)
            .executeTakeFirst();

        if (!assigned) return Response.json({ error: 'fee_not_found' }, { status: 404 });
        if (assigned.person_id !== auth.person_id) return Response.json({ error: 'no_access' }, { status: 403 });
        if (assigned.status === 'paid') return Response.json({ error: 'already_paid' }, { status: 400 });

        const amount = parseFloat(assigned.amount as string);

        // Pokud platba z účtu — odečíst zůstatek
        if (method === 'account' && account_id) {
            const acc = await db.selectFrom('payments_accounts')
                .select(['payment_account_id', 'balance', 'owner_id', 'is_active'])
                .where('payment_account_id', '=', parseInt(account_id))
                .executeTakeFirst();

            if (!acc || !acc.is_active) return Response.json({ error: 'account_not_found' }, { status: 404 });
            if (acc.owner_id !== auth.person_id) return Response.json({ error: 'no_access' }, { status: 403 });

            const currentBalance = parseFloat(acc.balance as any) || 0;
            if (currentBalance < amount) return Response.json({ error: 'insufficient_funds' }, { status: 400 });

            const newBalance = currentBalance - amount;
            await db.updateTable('payments_accounts')
                .set({ balance: newBalance })
                .where('payment_account_id', '=', parseInt(account_id))
                .execute();

            await db.insertInto('payments_transfers')
                .values({
                    source_id: parseInt(account_id),
                    target_id: 0,
                    source_balance: newBalance,
                    target_balance: 0,
                    type: 'out',
                    amount,
                    description: `Platba poplatku #${assigned.payment_fee_id}`,
                    created_by: auth.user_id,
                })
                .execute();
        }

        await db.insertInto('payments_payments')
            .values({
                payment_assign_id,
                amount: String(amount),
                paid_at: moment().toDate(),
                transaction_type: 'payment',
                payment_method_id: null,
                payment_account_id: account_id ? parseInt(account_id) : null,
                note: null,
                is_auto_paired: 0,
                bank_transaction_id: null,
                file_id: 0,
                deleted_at: null,
            })
            .execute();

        await db.updateTable('payments_assigned_fees')
            .set({ status: 'paid' })
            .where('payment_assign_id', '=', payment_assign_id)
            .execute();

        return Response.json({ success: true });
    }, {
        body: t.Object({
            payment_assign_id: t.Number(),
            method: t.String(),
            account_id: t.Optional(t.Nullable(t.Union([t.String(), t.Number()])))
        })
    })

    .get('/payments/categories', async ({ cookie }) => {
        const auth = await getAuth(cookie.token?.value as string);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const categories = await db.selectFrom('payments_categories')
            .select(['category_id', 'category', 'created_at'])
            .where('deleted_at', 'is', null)
            .orderBy('category', 'asc')
            .execute();

        return Response.json(categories);
    });

export default app;
