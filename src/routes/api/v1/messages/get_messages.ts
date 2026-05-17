import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .get('/messages/list', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };
    const queryFilters = JSON.parse(query.filters ?? '{}');

    /* 
      ZMĚNA ZDE: 
      Začínáme u tabulky 'messages' a připojujeme 'messages_receivers' pomocí LEFT JOIN.
      Díky tomu se načtou i zprávy (např. drafty), které nemají žádný záznam v messages_receivers.
    */
    let baseQuery = db
      .selectFrom('messages')
      .leftJoin('messages_receivers', 'messages_receivers.message_id', 'messages.message_id')
      .leftJoin('persons', 'messages.author_id', 'persons.person_id')
      .leftJoin('users', 'users.person_id', 'persons.person_id')
      .select([
        'messages.message_id',
        'messages.topic',
        'messages.message',
        'messages.author_id',
        'persons.first_name',
        'persons.last_name',
        'messages.sent_at',
        'messages.is_draft',
        'messages.deleted',
        'messages.require_confirm',
        'users.avatar'
      ])
      .groupBy('messages.message_id')
      .where('messages.type', 'not in', [1])
      .where('messages.is_draft', '=', query.is_draft ? true : false);

    if (query.receiver_id) {
      baseQuery = baseQuery.where('messages_receivers.receiver_id', '=', query.receiver_id);
    }

    /* Cursor pagination */
    if (query.from_id) {
      baseQuery = baseQuery.where('messages.message_id', '<', query.from_id);
    }

    /* Authors */
    if (query.author_ids?.length) {
        baseQuery = baseQuery.where(
          'messages.author_id', 'in', query.author_ids
        );
    }

    /* Text message */
    if (query.q) {
      baseQuery = baseQuery.where(
        sql<any>`LOWER(messages.message) LIKE ${'%' + query.q.toLowerCase() + '%'}`
      );
    }

    /* Has files */
    if (query.has_attachments !== undefined) {
      baseQuery = baseQuery.where(
        sql<any>`
          ${
            query.has_attachments
              ? sql`EXISTS (
                    SELECT 1 FROM messages_files ma
                    WHERE ma.message_id = messages.message_id
                  )`
              : sql`NOT EXISTS (
                    SELECT 1 FROM messages_files ma
                    WHERE ma.message_id = messages.message_id
                  )`
          }
        `
      );
    }

    /* Date */
    if (query.sent_after) {
      baseQuery = baseQuery.where(
        'messages.sent_at',
        '>=',
        new Date(query.sent_after)
      );
    }

    if (query.sent_before) {
      baseQuery = baseQuery.where(
        'messages.sent_at',
        '<=',
        new Date(query.sent_before)
      );
    }

    console.log(queryFilters);

    if (queryFilters.order) {
      baseQuery = baseQuery.orderBy('messages.message_id', queryFilters.order == 'oldest_to_newest' ? 'asc' : 'desc');
    } else {
      baseQuery = baseQuery.orderBy('messages.message_id', 'desc');
    }

    if (!queryFilters.show_suppress) {
      baseQuery = baseQuery.where('messages_receivers.suppress_at', 'is', null);
    }

    const messagesDB = await baseQuery
      .limit(query.limit ?? 20)
      .execute();

    console.log(messagesDB);

    if (!messagesDB.length) {
      return { messages: [], next_from_id: null };
    }

    /* Files */
    const messageIds = messagesDB.map(m => m.message_id);
    const filesDB = await db
        .selectFrom('messages_files')
        .innerJoin('files', 'messages_files.file_id', 'files.file_id')
        .select([
            'messages_files.message_id',
            'files.file_id',
            'files.file_uuid',
            'files.real_file_name as name',
            'files.file_format',
            'files.file_size',
            'files.mime_type'
        ])
        .where('messages_files.message_id', 'in', messageIds)
        .execute();

    const filesMap = new Map<number, any[]>();
    filesDB.forEach(f => {
        if (!filesMap.has(f.message_id)) filesMap.set(f.message_id, []);
        filesMap.get(f.message_id)!.push({
            file_id: f.file_id,
            file_uuid: f.file_uuid,
            file_name: f.name,
            file_format: f.file_format,
            file_size: f.file_size,
            mime_type: f.mime_type
        });
    });

    /* Receivers */
    const receiversDB = await db
        .selectFrom('messages_receivers')
        .leftJoin('users', 'users.person_id', 'messages_receivers.receiver_id')
        .select([
            'messages_receivers.message_id',
            'messages_receivers.receiver_id',
            'users.avatar',
            'messages_receivers.read_at',
            'messages_receivers.confirmed_at',
            'messages_receivers.suppress_at'
        ])
        .where('messages_receivers.message_id', 'in', messageIds)
        .execute();

    /* 
      ZMĚNA ZDE: 
      Odfiltrování null hodnot. Pokud má draft 0 příjemců, receiver_id by vyhazoval null 
      a mohl by dělat problémy ve format_person_map_by_ids.
    */
    const people_ids = [
      ...new Set(messagesDB.map(m => m.author_id).filter(id => id !== null)), 
      ...new Set(receiversDB.map(m => m.receiver_id).filter(id => id !== null))
    ] as number[];
    
    const people = await format_person_map_by_ids(people_ids);

    const receiverMap = new Map<number, any[]>();
    receiversDB.forEach(m => {
        if (!m.receiver_id) return; // Ignorujeme, pokud není receiver
        
        if (!receiverMap.has(m.message_id)) receiverMap.set(m.message_id, []);
        receiverMap.get(m.message_id)!.push({
            person_id: m.receiver_id,
            full_name: people.get(m.receiver_id),
            avatar: m.avatar,
            read_at: m.read_at,
            confirm_at: m.confirmed_at,
            suppress_at: m.suppress_at
        });
    });

    const messages = messagesDB.map(m => ({
      ...m,
      author: {
        first_name: m.first_name,
        last_name: m.last_name,
        full_name: people.get(m.author_id as number),
        avatar: m.avatar
      },
      files: filesMap.get(m.message_id as number) || [],
      receivers: receiverMap.get(m.message_id as number) || [],
    }));

    return {
      messages,
      next_from_id: messages[messages.length - 1].message_id
    };
  }, {
    query: t.Object({
      is_draft: t.Optional(t.Boolean({ default: false })),
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 15 })),
      from_id: t.Optional(t.Number()),
      receiver_id: t.Optional(t.Number()),
      author_ids: t.Optional(t.Array(t.Number())),
      q: t.Optional(t.String()),
      has_attachments: t.Optional(t.Boolean()),
      sent_after: t.Optional(t.String()),
      sent_before: t.Optional(t.String()),
      filters: t.Optional(t.String())
    })
  });

export default app;