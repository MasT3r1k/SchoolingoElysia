import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

const app = new Elysia()
  .delete('/messages/delete', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id', 'users.manager', 'users.principal'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    // 1. Získání pole ID zpráv (přejmenováno na message_ids pro jasnost)
    const message_ids = query.message_ids;
    if (!message_ids || message_ids.length === 0) return { error: 'no_message_ids' };

    // 2. Získání VŠECH zpráv, které se mají smazat
    const messagesToDelete = await db
      .selectFrom('messages')
      .select([
        'messages.message_id',
        'messages.author_id'
      ])
      .where('messages.message_id', 'in', message_ids)
      .where('messages.type', 'not in', [1])
      .execute();

    if (!messagesToDelete.length) {
        return { error: 'messages_not_found' };
    }

    const hasAdminAccess = await PermissionService.hasPermission(auth.user_id, GlobalPermissions.MESSAGES_DELETE);

    // 3. Bezpečnostní ověření pro běžného uživatele
    if (!hasAdminAccess) {
        // Uživatel musí být autorem VŠECH zpráv, které se snaží smazat
        const isAuthorOfAll = messagesToDelete.every(msg => msg.author_id === auth.user_id);
        if (!isAuthorOfAll) {
            return { error: 'no_permission', details: 'not_author_of_all_messages' };
        }
    }

    // Filtrujeme jen reálně nalezená ID v databázi (prevence proti smazání neexistujících)
    const validMessageIds = messagesToDelete.map(msg => msg.message_id);

    // 4. Kontrola přečtení u příjemců (pokud není admin)
    if (!hasAdminAccess) {
        const readReceivers = await db.selectFrom('messages_receivers')
            .select(['message_id'])
            .where('read_at', 'is not', null)
            .where('message_id', 'in', validMessageIds)
            .limit(1) // Stačí najít jednu jedinou přečtenou zprávu a zamítneme to
            .execute();

        if (readReceivers.length > 0) {
            return { error: 'cannot_delete_message', details: 'some_messages_already_read' };
        }
    }

    // 5. Samotné hromadné mazání v transakci
    try {
        await db.transaction().execute(async (trx) => {
            await trx
            .deleteFrom('messages_files')
            .where('message_id', 'in', validMessageIds)
            .execute();

            await trx
            .deleteFrom('messages_receivers')
            .where('message_id', 'in', validMessageIds)
            .execute();

            await trx
            .deleteFrom('messages')
            .where('message_id', 'in', validMessageIds)
            .execute();
        });

        return {
            success: true,
            deleted_count: validMessageIds.length
        };
    } catch (error) {
        console.error("Chyba při mazání zpráv:", error);
        return { error: 'database_error', details: 'failed_to_delete' };
    }
  }, {
    // Používáme t.Array(t.Numeric()), což správně převede stringy z URL query na čísla
    query: t.Object({
      message_ids: t.Array(t.Numeric())
    })
  });

export default app;