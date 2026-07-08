import { cron } from '@elysiajs/cron';
import { notificationService } from '../functions/notification.service';
import { db } from '../../database';

export const canteenCron = cron({
    name: 'canteen-negative-balance-warning',
    pattern: '0 8 * * *', // Every day at 8:00 AM
    async run() {
        // Find users with negative balance in their canteen account
        const negativeAccounts = await db.selectFrom('canteen_accounts')
            .innerJoin('payments_accounts', 'payments_accounts.payment_account_id', 'canteen_accounts.account_id')
            .innerJoin('persons', 'persons.person_id', 'canteen_accounts.person_id')
            .select([
                'persons.person_id',
                'payments_accounts.balance',
                'payments_accounts.payment_account_id'
            ])
            .where('payments_accounts.balance', '<', 0)
            .execute();

        for (const account of negativeAccounts) {
            // Find users associated with this person to notify them
            const users = await db.selectFrom('users')
                .select(['user_id'])
                .where('person_id', '=', account.person_id)
                .execute();

            for (const user of users) {
                await notificationService.notify(
                    'canteen_balance_negative',
                    { userId: user.user_id },
                    {
                        title: 'Záporný zůstatek v jídelně',
                        body: `Váš zůstatek v jídelně je ${account.balance} Kč. Prosíme, dobijte si kredit co nejdříve.`,
                        data: {
                            payment_account_id: account.payment_account_id,
                            balance: account.balance
                        }
                    }
                );
            }
        }
    }
});
