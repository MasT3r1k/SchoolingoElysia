import { db } from '@database';

export class CanteenService {
    /**
     * Získá dostupné množství kreditu a ID účtu(ů) pro danou osobu (person_id).
     */
    static async getCredit(person_id: number): Promise<{ credit: number; account_id: number | number[] }> {
        const canteen_account = await db.selectFrom('canteen_accounts')
            .select(['canteen_accounts.account_id'])
            .where('canteen_accounts.person_id', '=', person_id)
            .executeTakeFirst();

        const accounts = await db.selectFrom('payments_accounts')
            .select(['payment_account_id', 'balance'])
            .where((eb) => eb.or([
                eb('owner_id', '=', person_id),
                eb('payment_account_id', '=', canteen_account?.account_id ?? 0)
            ]))
            .where('is_active', '=', true)
            .execute();

        let account = null;
        if (canteen_account) {
            account = accounts.find((acc) => acc.payment_account_id == canteen_account?.account_id);
        }

        if (!accounts.length) {
            return { credit: 0, account_id: [] };
        }

        const credit = Number(
            canteen_account
                ? account?.balance
                : accounts.reduce((sum, d) => sum + (d.balance || 0), 0)
        );

        const account_id = canteen_account ? canteen_account.account_id : accounts.map((acc) => (acc.payment_account_id));

        return { 
            credit: isNaN(credit) ? 0 : credit,
            account_id
        };
    }

    static async getSetting(key: string, defaultValue: string = ''): Promise<string> {
        const res = await db.selectFrom('canteen_settings')
            .where('key', '=', key)
            .select('value')
            .executeTakeFirst();
        return res ? res.value : defaultValue;
    }

    static async issueMeal(order_id: number, issuer_user_id: number): Promise<{ success: boolean; error?: string }> {
        const order = await db.selectFrom('canteen_orders')
            .innerJoin('canteen_menus', 'canteen_menus.menu_id', 'canteen_orders.menu_id')
            .innerJoin('canteen_meals', 'canteen_meals.meal_id', 'canteen_menus.meal_id')
            .select([
                'canteen_orders.person_id', 
                'canteen_orders.status', 
                'canteen_orders.payment_transfer_id',
                'canteen_meals.price as meal_price',
                'canteen_meals.name as meal_name'
            ])
            .where('canteen_orders.order_id', '=', order_id)
            .executeTakeFirst();

        if (!order) return { success: false, error: 'order_not_found' };
        if (order.status === 'issued') return { success: false, error: 'already_issued' };
        if (order.status === 'cancelled') return { success: false, error: 'order_cancelled' };

        // Determine price
        const flatPriceEnabled = await this.getSetting('canteen_flat_price_enabled', '0') === '1';
        const flatPriceValue = await this.getSetting('canteen_flat_price', '0');
        const price = flatPriceEnabled ? parseFloat(flatPriceValue) : parseFloat(order.meal_price as string);

        let transfer_id = null;

        if (price > 0) {
            // Get user's credit and account
            const creditInfo = await this.getCredit(order.person_id);
            const overdraftLimit = parseFloat(await this.getSetting('canteen_overdraft_limit', '0'));
            
            if (creditInfo.credit - price < -overdraftLimit) {
                return { success: false, error: 'insufficient_funds' };
            }

            const account_id = Array.isArray(creditInfo.account_id) ? creditInfo.account_id[0] : creditInfo.account_id;
            if (!account_id) {
                return { success: false, error: 'no_payment_account' };
            }

            // Target account (school's canteen account)
            const targetAccountStr = await this.getSetting('canteen_payment_account', '0');
            const targetAccount = parseInt(targetAccountStr) || 0;

            // 1. Update source balance
            await db.updateTable('payments_accounts')
                .set((eb) => ({
                    balance: eb('balance', '-', price)
                }))
                .where('payment_account_id', '=', account_id)
                .execute();

            // 2. Update target balance (if exists)
            if (targetAccount > 0) {
                await db.updateTable('payments_accounts')
                    .set((eb) => ({
                        balance: eb('balance', '+', price)
                    }))
                    .where('payment_account_id', '=', targetAccount)
                    .execute();
            }

            // 3. Create transfer record
            const transfer = await db.insertInto('payments_transfers')
                .values({
                    source_id: account_id,
                    target_id: targetAccount,
                    source_balance: creditInfo.credit - price,
                    target_balance: 0, // Simplified, we don't have atomic read of target balance here easily
                    type: 'out',
                    amount: price,
                    description: `Platba za oběd: ${order.meal_name}`,
                    category: 'canteen',
                    created_by: issuer_user_id
                })
                .executeTakeFirst();
                
            transfer_id = Number(transfer.insertId);
        }

        // Update order status
        await db.updateTable('canteen_orders')
            .set({ 
                status: 'issued', 
                issued_at: new Date(),
                payment_transfer_id: transfer_id
            })
            .where('order_id', '=', order_id)
            .execute();

        return { success: true };
    }
}
