import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
    const res = await db.selectFrom('canteen_settings')
        .where('key', '=', key)
        .select('value')
        .executeTakeFirst();
    return res ? res.value : defaultValue;
}

const app = new Elysia()
    
    // ═══════════════════════════════════════════════════════════════════════
    // CREDIT
    // ═══════════════════════════════════════════════════════════════════════

    .get('/canteen/credit', async ({ cookie }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const canteen_account = await db.selectFrom('canteen_accounts')
        .select(['canteen_accounts.account_id'])
        .where('canteen_accounts.person_id', '=', auth.person_id)
        .executeTakeFirst()

        const accounts = await db.selectFrom('payments_accounts')
            .select(['payment_account_id', 'balance'])
            .where((eb) => eb.or([
                eb('owner_id', '=', auth.person_id),
                eb('payment_account_id', '=', canteen_account?.account_id ?? 0)
            ]))
            .where('is_active', '=', true)
            .execute()

        let account = null;
        if (canteen_account) {
            account = accounts.find((acc) => acc.payment_account_id == canteen_account?.account_id)
        }

        if (!accounts.length) {
            return { credit: 0, account_id: [] }
        }

        const credit = Number(
            canteen_account
                ? account?.balance
                : accounts.reduce((sum, d) => sum + (d.balance || 0), 0)
            )

        const account_id = canteen_account ? canteen_account.account_id : accounts.map((acc) => (acc.payment_account_id))

        return { 
            credit,
            account_id
        }
    })

    // ═══════════════════════════════════════════════════════════════════════
    // MEALS (Jídla v katalogu)
    // ═══════════════════════════════════════════════════════════════════════

    .get('/canteen/meals', async ({ cookie }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const meals = await db.selectFrom('canteen_meals')
            .selectAll()
            .where('deleted_at', 'is', null)
            .orderBy('name', 'asc')
            .execute();

        return Response.json(meals);
    })

    .post('/canteen/meal', async ({ cookie, body }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });
        
        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_MANAGE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        const { name, category, price, calories, allergens } = body as any;

        await db.insertInto('canteen_meals')
            .values({
                name,
                category,
                price: String(parseFloat(price)),
                calories: calories ? parseInt(calories) : null,
                allergens: allergens || null,
                created_by: auth.user_id
            })
            .execute();

        return Response.json({ success: true });
    }, {
        body: t.Object({
            name: t.String(),
            category: t.String(),
            price: t.Union([t.Number(), t.String()]),
            calories: t.Optional(t.Nullable(t.Union([t.Number(), t.String()]))),
            allergens: t.Optional(t.Nullable(t.String()))
        })
    })

    // ═══════════════════════════════════════════════════════════════════════
    // MENU (Jídelníček na týden)
    // ═══════════════════════════════════════════════════════════════════════

    .get('/canteen/menu', async ({ cookie, query }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const start_date = query.start_date as string || moment().startOf('isoWeek').format('YYYY-MM-DD');
        const end_date = query.end_date as string || moment(start_date).add(4, 'days').format('YYYY-MM-DD');

        const menuItems = await db.selectFrom('canteen_menus')
            .innerJoin('canteen_meals', 'canteen_meals.meal_id', 'canteen_menus.meal_id')
            .leftJoin('canteen_orders', (join) => join
                .onRef('canteen_orders.menu_id', '=', 'canteen_menus.menu_id')
                .on('canteen_orders.status', '!=', 'cancelled')
            )
            .select(({ fn }) => [
                'canteen_menus.menu_id',
                'canteen_menus.date',
                'canteen_menus.variant_index',
                'canteen_menus.limit_count',
                'canteen_meals.meal_id',
                'canteen_meals.name',
                'canteen_meals.category',
                'canteen_meals.price',
                'canteen_meals.calories',
                'canteen_meals.allergens',
                fn.count('canteen_orders.order_id').as('ordered_count')
            ])
            .where('canteen_menus.date', '>=', start_date)
            .where('canteen_menus.date', '<=', end_date)
            .groupBy('canteen_menus.menu_id')
            .execute();

        const flatPriceEnabled = await getSetting('canteen_flat_price_enabled', '0') === '1';
        const flatPriceValue = await getSetting('canteen_flat_price', '0');

        const menuItemsMapped = menuItems.map(item => {
            if (flatPriceEnabled) {
                return { ...item, price: flatPriceValue };
            }
            return item;
        });

        const orders = await db.selectFrom('canteen_orders')
            .innerJoin('canteen_menus', 'canteen_menus.menu_id', 'canteen_orders.menu_id')
            .select([
                'canteen_orders.order_id',
                'canteen_orders.menu_id',
                'canteen_orders.status',
                'canteen_menus.date'
            ])
            .where('canteen_orders.person_id', '=', auth.person_id!)
            .where('canteen_orders.status', '!=', 'cancelled')
            .where('canteen_menus.date', '>=', start_date)
            .where('canteen_menus.date', '<=', end_date)
            .execute();

        return Response.json({
            menu: menuItemsMapped,
            orders: orders
        });
    })

    // ═══════════════════════════════════════════════════════════════════════
    // ORDERS (Objednávky)
    // ═══════════════════════════════════════════════════════════════════════

    .post('/canteen/order', async ({ cookie, body }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth || !auth.person_id) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const { selections, account_id } = body as any;

        const dates = selections.map((s: any) => s.date);
        
        let totalCost = 0;
        let mealsToOrder: any[] = [];

        const flatPriceEnabled = await getSetting('canteen_flat_price_enabled', '0') === '1';
        const flatPriceValue = await getSetting('canteen_flat_price', '0');
        
        for (const sel of selections) {
            if (sel.menu_id) {
                const menuItem = await db.selectFrom('canteen_menus')
                    .innerJoin('canteen_meals', 'canteen_meals.meal_id', 'canteen_menus.meal_id')
                    .select(['canteen_meals.price'])
                    .where('canteen_menus.menu_id', '=', sel.menu_id)
                    .executeTakeFirst();
                if (menuItem) {
                    const priceToUse = flatPriceEnabled ? parseFloat(flatPriceValue) : parseFloat(menuItem.price as string);
                    totalCost += priceToUse;
                    mealsToOrder.push(sel.menu_id);
                }
            }
        }

        // Kontrola zůstatku
        if (totalCost > 0) {
            if (!account_id) return Response.json({ error: 'no_account' }, { status: 400 });

            const acc = await db.selectFrom('payments_accounts')
                .select(['payment_account_id', 'balance', 'owner_id', 'is_active'])
                .where('payment_account_id', '=', parseInt(account_id))
                .executeTakeFirst();

            if (!acc || !acc.is_active || acc.owner_id !== auth.person_id) return Response.json({ error: 'invalid_account' }, { status: 400 });
            
            const currentBalance = parseFloat(acc.balance as any) || 0;
            if (currentBalance < totalCost) return Response.json({ error: 'insufficient_funds' }, { status: 400 });

            // Stržení peněz
            const newBalance = currentBalance - totalCost;
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
                    amount: totalCost,
                    description: `Objednávka obědů (${mealsToOrder.length} porcí)`,
                    created_by: auth.user_id,
                })
                .execute();
        }

        // Zrušíme případné předchozí objednávky v těchto dnech
        for (const date of dates) {
            await db.updateTable('canteen_orders')
                .set({ status: 'cancelled', cancelled_at: moment().toDate() })
                .where('person_id', '=', auth.person_id)
                .where('status', '=', 'ordered')
                .where('menu_id', 'in', (qb) => qb.selectFrom('canteen_menus').select('menu_id').where('date', '=', date))
                .execute();
        }

        // Vytvoříme nové
        for (const menu_id of mealsToOrder) {
            await db.insertInto('canteen_orders')
                .values({
                    person_id: auth.person_id,
                    menu_id: menu_id,
                    status: 'ordered',
                    payment_transfer_id: null
                })
                .execute();
        }

        return Response.json({ success: true });
    }, {
        body: t.Object({
            selections: t.Array(t.Object({
                date: t.String(),
                menu_id: t.Nullable(t.Number())
            })),
            account_id: t.Optional(t.Nullable(t.Union([t.Number(), t.String()])))
        })
    })

    // ═══════════════════════════════════════════════════════════════════════
    // ISSUES (Výdeje)
    // ═══════════════════════════════════════════════════════════════════════

    .get('/canteen/issues', async ({ cookie, query }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_ISSUE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        const date = query.date as string || moment().format('YYYY-MM-DD');

        const issues = await db.selectFrom('canteen_orders')
            .innerJoin('canteen_menus', 'canteen_menus.menu_id', 'canteen_orders.menu_id')
            .innerJoin('canteen_meals', 'canteen_meals.meal_id', 'canteen_menus.meal_id')
            .innerJoin('persons', 'persons.person_id', 'canteen_orders.person_id')
            .select([
                'canteen_orders.order_id',
                'canteen_orders.status',
                'canteen_menus.variant_index',
                'canteen_meals.name as meal_name',
                'persons.first_name',
                'persons.last_name',
            ])
            .where('canteen_menus.date', '=', date)
            .execute();

        const stats = {
            total_ordered: issues.length,
            issued: issues.filter(i => i.status === 'issued').length,
            cancelled: issues.filter(i => i.status === 'cancelled').length,
        };

        return Response.json({ issues, stats });
    })

    .get('/canteen/students/search', async ({ cookie, query }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_ISSUE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        const q = (query.q as string || '').trim();
        const date = query.date as string || moment().format('YYYY-MM-DD');

        if (!q || q.length < 2) return Response.json([]);

        const tokens = q.split(/\s+/).filter(t => t.length > 0);

        const students = await db.selectFrom('persons')
            .select(['person_id', 'first_name', 'last_name'])
            .where((eb) => {
                const expressions = tokens.map(token => 
                    eb.or([
                        eb('first_name', 'like', `%${token}%`),
                        eb('last_name', 'like', `%${token}%`)
                    ])
                );
                return eb.and(expressions);
            })
            .limit(15)
            .execute();

        const results = [];
        for (const student of students) {
            const order = await db.selectFrom('canteen_orders')
                .innerJoin('canteen_menus', 'canteen_menus.menu_id', 'canteen_orders.menu_id')
                .innerJoin('canteen_meals', 'canteen_meals.meal_id', 'canteen_menus.meal_id')
                .select([
                    'canteen_orders.order_id',
                    'canteen_orders.status',
                    'canteen_menus.variant_index',
                    'canteen_meals.name as meal_name'
                ])
                .where('canteen_orders.person_id', '=', student.person_id)
                .where('canteen_menus.date', '=', date)
                .executeTakeFirst();

            const account = await db.selectFrom('payments_accounts')
                .select('balance')
                .where('owner_id', '=', student.person_id)
                .where('is_active', '=', true)
                .executeTakeFirst();

            results.push({
                person_id: student.person_id,
                first_name: student.first_name,
                last_name: student.last_name,
                order_id: order?.order_id || null,
                status: order?.status || null,
                variant_index: order?.variant_index || null,
                meal_name: order?.meal_name || null,
                credit: account ? parseFloat(account.balance as any) : null
            });
        }

        return Response.json(results);
    })

    .post('/canteen/issue/:order_id', async ({ cookie, params }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_ISSUE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        await db.updateTable('canteen_orders')
            .set({ status: 'issued', issued_at: moment().toDate() })
            .where('order_id', '=', parseInt(params.order_id))
            .execute();

        return Response.json({ success: true });
    })

    .put('/canteen/meal/:meal_id', async ({ cookie, params, body }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });
        
        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_MANAGE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        const { name, category, price, calories, allergens } = body as any;

        await db.updateTable('canteen_meals')
            .set({
                name,
                category,
                price: String(parseFloat(price)),
                calories: calories ? parseInt(calories) : null,
                allergens: allergens || null
            })
            .where('meal_id', '=', parseInt(params.meal_id))
            .execute();

        return Response.json({ success: true });
    }, {
        body: t.Object({
            name: t.String(),
            category: t.String(),
            price: t.Union([t.Number(), t.String()]),
            calories: t.Optional(t.Nullable(t.Union([t.Number(), t.String()]))),
            allergens: t.Optional(t.Nullable(t.String()))
        })
    })

    .delete('/canteen/meal/:meal_id', async ({ cookie, params }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });
        
        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_MANAGE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        await db.updateTable('canteen_meals')
            .set({ deleted_at: moment().toDate() })
            .where('meal_id', '=', parseInt(params.meal_id))
            .execute();

        return Response.json({ success: true });
    })

    .post('/canteen/menu', async ({ cookie, body }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });
        
        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_MANAGE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        const { date, variant_index, meal_id } = body as any;

        // Delete existing variant on this date
        await db.deleteFrom('canteen_menus')
            .where('date', '=', date)
            .where('variant_index', '=', parseInt(variant_index))
            .execute();

        if (meal_id) {
            await db.insertInto('canteen_menus')
                .values({
                    date: date,
                    variant_index: parseInt(variant_index),
                    meal_id: parseInt(meal_id),
                    created_by: auth.user_id
                })
                .execute();
        }

        return Response.json({ success: true });
    }, {
        body: t.Object({
            date: t.String(),
            variant_index: t.Number(),
            meal_id: t.Nullable(t.Number())
        })
    })

    .post('/canteen/menu/generate', async ({ cookie, body }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });
        
        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_MANAGE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        const { start_date, target_kcal, variants } = body as any;
        
        // 1. Get all active meals (not deleted)
        const meals = await db.selectFrom('canteen_meals')
            .selectAll()
            .where('deleted_at', 'is', null)
            .execute();

        if (meals.length === 0) {
            return Response.json({ error: 'no_meals_in_catalog' }, { status: 400 });
        }

        // 2. For each meal, find its last served date before start_date
        const menuHistory = await db.selectFrom('canteen_menus')
            .select(['meal_id', 'date'])
            .where('date', '<', start_date)
            .orderBy('date', 'desc')
            .execute();

        // Map meal_id -> last served date time (default 0 for never served)
        const lastServedMap = new Map<number, number>();
        for (const m of menuHistory) {
            if (!lastServedMap.has(m.meal_id)) {
                lastServedMap.set(m.meal_id, new Date(m.date).getTime());
            }
        }

        // Sort meals by last served date ascending (never served first, then oldest)
        const mealsSortedByPriority = [...meals].sort((a, b) => {
            const timeA = lastServedMap.get(a.meal_id) || 0;
            const timeB = lastServedMap.get(b.meal_id) || 0;
            return timeA - timeB;
        });

        // 3. We generate for the given number of variants (default 2) for Monday to Friday (5 days)
        const numVariants = variants || 2;
        const daysToGenerate = 5; // Mon-Fri
        const dates: string[] = [];
        for (let i = 0; i < daysToGenerate; i++) {
            dates.push(moment(start_date).add(i, 'days').format('YYYY-MM-DD'));
        }

        // Helper to find a combination of 5 meals with calorie limit
        const findCombination = (availableMeals: typeof meals, limitKcal: number): typeof meals | null => {
            let bestCombination: typeof meals | null = null;
            let bestPrioritySum = Infinity;

            const dfs = (startIndex: number, current: typeof meals, currentKcal: number, prioritySum: number) => {
                if (current.length === daysToGenerate) {
                    if (currentKcal <= limitKcal) {
                        if (prioritySum < bestPrioritySum) {
                            bestPrioritySum = prioritySum;
                            bestCombination = [...current];
                        }
                    }
                    return;
                }

                if (prioritySum >= bestPrioritySum) return;

                for (let i = startIndex; i < availableMeals.length; i++) {
                    const meal = availableMeals[i];
                    const mealKcal = meal.calories || 550; // default 550 kcal if null

                    if (currentKcal + mealKcal > limitKcal) continue;

                    current.push(meal);
                    // Priority is the index in the sorted array (0 = highest priority)
                    dfs(i + 1, current, currentKcal + mealKcal, prioritySum + i);
                    current.pop();
                }
            };

            dfs(0, [], 0, 0);
            return bestCombination;
        };

        // Clear existing menus for this week and these variants first
        const end_date = moment(start_date).add(4, 'days').format('YYYY-MM-DD');
        await db.deleteFrom('canteen_menus')
            .where('date', '>=', start_date)
            .where('date', '<=', end_date)
            .execute();

        const selectedMealIdsSet = new Set<number>();

        for (let v = 1; v <= numVariants; v++) {
            // Filter out meals already used by other variants in this generation run to maintain variety
            let availableForVariant = mealsSortedByPriority.filter(m => !selectedMealIdsSet.has(m.meal_id));
            
            // If we don't have enough meals left, fall back to all meals
            if (availableForVariant.length < daysToGenerate) {
                availableForVariant = mealsSortedByPriority;
            }

            let limit = target_kcal || 3500; // default weekly calorie limit
            let chosenMeals = findCombination(availableForVariant, limit);

            // If we cannot find a valid combination under the calorie limit, relax the limit
            if (!chosenMeals) {
                chosenMeals = findCombination(availableForVariant, 99999);
            }

            // If still nothing (e.g. fewer than 5 meals total), just pick the top available meals, repeating if necessary
            if (!chosenMeals) {
                chosenMeals = [];
                for (let i = 0; i < daysToGenerate; i++) {
                    const meal = availableForVariant[i % availableForVariant.length];
                    chosenMeals.push(meal);
                }
            }

            // Save to DB and add to selected list
            for (let i = 0; i < daysToGenerate; i++) {
                const meal = chosenMeals[i];
                selectedMealIdsSet.add(meal.meal_id);

                await db.insertInto('canteen_menus')
                    .values({
                        date: dates[i],
                        variant_index: v,
                        meal_id: meal.meal_id,
                        created_by: auth.user_id
                    })
                    .execute();
            }
        }

        return Response.json({ success: true });
    }, {
        body: t.Object({
            start_date: t.String(),
            target_kcal: t.Optional(t.Number()),
            variants: t.Optional(t.Number())
        })
    })

    // ═══════════════════════════════════════════════════════════════════════
    // SETTINGS (Nastavení)
    // ═══════════════════════════════════════════════════════════════════════

    .get('/canteen/settings', async ({ cookie }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_MANAGE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        const settings = await db.selectFrom('canteen_settings').selectAll().execute();
        const config: Record<string, string> = {
            canteen_enabled: '1',
            canteen_deadline_day: 'Neděle',
            canteen_deadline_time: '20:00',
            canteen_flat_price_enabled: '0',
            canteen_flat_price: '0',
            canteen_payment_account: '1',
            canteen_auto_refund: '1'
        };
        for (const s of settings) {
            config[s.key] = s.value;
        }

        // Get potential staff members (all non-student, non-parent users)
        const staff = await db.selectFrom('users')
            .innerJoin('persons', 'users.person_id', 'persons.person_id')
            .select(['users.user_id', 'persons.first_name', 'persons.last_name', 'users.username'])
            .where('users.role', 'in', ['teacher', 'admin_staff', 'management', 'personnel', 'maintenance', 'other'])
            .where('users.active', '=', true)
            .execute();

        const formattedStaff = staff.map(s => ({
            user_id: s.user_id,
            name: `${s.first_name} ${s.last_name} (${s.username})`
        }));

        // Get users who currently have canteen.manage permission
        const managersResult = await db.selectFrom('user_permissions')
            .innerJoin('permissions', 'permissions.permission_id', 'user_permissions.permission_id')
            .where('permissions.permission_name', '=', 'canteen.manage')
            .select('user_permissions.user_id')
            .execute();
        const managers = managersResult.map(r => r.user_id);

        // Get users who currently have canteen.issue permission
        const cooksResult = await db.selectFrom('user_permissions')
            .innerJoin('permissions', 'permissions.permission_id', 'user_permissions.permission_id')
            .where('permissions.permission_name', '=', 'canteen.issue')
            .select('user_permissions.user_id')
            .execute();
        const cooks = cooksResult.map(r => r.user_id);

        return Response.json({
            settings: config,
            staff: formattedStaff,
            managers,
            cooks
        });
    })

    .post('/canteen/settings', async ({ cookie, body }) => {
        const auth = await getAuthUser(cookie.token?.value as string, cookie);
        if (!auth) return Response.json({ error: 'unauthorized' }, { status: 401 });

        const perm = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.CANTEEN_MANAGE);
        if (!perm && !auth.is_principal) return Response.json({ error: 'unauthorized_canteen' }, { status: 403 });

        const { settings, managers, cooks } = body as any;

        // 1. Save general settings
        const settingsKeys = [
            'canteen_enabled',
            'canteen_deadline_day',
            'canteen_deadline_time',
            'canteen_flat_price_enabled',
            'canteen_flat_price',
            'canteen_payment_account',
            'canteen_auto_refund'
        ];

        await db.deleteFrom('canteen_settings')
            .where('key', 'in', settingsKeys)
            .execute();

        const insertValues = Object.entries(settings).map(([k, v]) => ({
            key: k,
            value: String(v)
        }));

        if (insertValues.length > 0) {
            await db.insertInto('canteen_settings')
                .values(insertValues)
                .execute();
        }

        // 2. Save permissions: canteen.manage
        let managePerm = await db.selectFrom('permissions')
            .where('permission_name', '=', 'canteen.manage')
            .select('permission_id')
            .executeTakeFirst();
        if (!managePerm) {
            await db.insertInto('permissions')
                .values({ permission_name: 'canteen.manage', description: 'Správa jídelny' })
                .execute();
            managePerm = await db.selectFrom('permissions')
                .where('permission_name', '=', 'canteen.manage')
                .select('permission_id')
                .executeTakeFirst();
        }

        if (managePerm && Array.isArray(managers)) {
            await db.deleteFrom('user_permissions')
                .where('permission_id', '=', managePerm.permission_id)
                .execute();

            if (managers.length > 0) {
                const values = managers.map((uid: number) => ({
                    user_id: uid,
                    permission_id: managePerm!.permission_id
                }));
                await db.insertInto('user_permissions')
                    .values(values)
                    .execute();
            }
        }

        // 3. Save permissions: canteen.issue
        let issuePerm = await db.selectFrom('permissions')
            .where('permission_name', '=', 'canteen.issue')
            .select('permission_id')
            .executeTakeFirst();
        if (!issuePerm) {
            await db.insertInto('permissions')
                .values({ permission_name: 'canteen.issue', description: 'Výdej jídla v jídelně' })
                .execute();
            issuePerm = await db.selectFrom('permissions')
                .where('permission_name', '=', 'canteen.issue')
                .select('permission_id')
                .executeTakeFirst();
        }

        if (issuePerm && Array.isArray(cooks)) {
            await db.deleteFrom('user_permissions')
                .where('permission_id', '=', issuePerm.permission_id)
                .execute();

            if (cooks.length > 0) {
                const values = cooks.map((uid: number) => ({
                    user_id: uid,
                    permission_id: issuePerm!.permission_id
                }));
                await db.insertInto('user_permissions')
                    .values(values)
                    .execute();
            }
        }

        return Response.json({ success: true });
    }, {
        body: t.Object({
            settings: t.Record(t.String(), t.Any()),
            managers: t.Array(t.Number()),
            cooks: t.Array(t.Number())
        })
    });

export default app;
