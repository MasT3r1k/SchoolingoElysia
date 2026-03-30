import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .get('/messages/noticeboard', async ({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_user' };
    const auth = user;

    const totalRows = await db.selectFrom('messages')
    .select(sql`COUNT(*)`.as('count'))
    .where('messages.type', '=', 1)
    .executeTakeFirst()
    .then(r => Number(r?.count ?? 0));

    const messagesDB = await db.selectFrom('messages')
    .leftJoin('persons', 'messages.author_id', 'persons.person_id')
    .leftJoin('messages_receivers', (join) => join
        .onRef('messages.message_id', '=', 'messages_receivers.message_id')
        .on('messages_receivers.receiver_id', '=', auth.person_id)
  )
    .innerJoin('users as author_user', (join) => 
        join.onRef('author_user.person_id', '=', 'messages.author_id')
            .on('author_user.school_id', '=', auth.school_id)
    )
    .select([
        'messages.message_id',
        'messages.topic',
        'messages.message',
        'messages.author_id',
        'persons.first_name',
        'persons.last_name',
        'messages.sent_at',
        'messages.deleted',
        'messages.require_confirm',
        'messages_receivers.read_at',
        'messages_receivers.confirmed_at',
        'author_user.avatar'
    ])
    .where('messages.type', '=', 1)
    .offset(query.offset || 0)
    .limit(query.limit || 20)
    .execute()

    if (!messagesDB) return { error: 'failed_load_messages' };

    const people_ids = Array.from( new Set(messagesDB.map((m) => m.author_id!)) );
    const people = await format_person_map_by_ids(people_ids);

    /* 🔹 přílohy */
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
            name: f.name,
            file_format: f.file_format,
            file_size: f.file_size,
            mime_type: f.mime_type
        });
    });

    const messages = messagesDB.map((message, index) => ({
        ...message,
        author: {
            first_name: message.first_name,
            last_name: message.last_name,
            full_name: people.get(message.author_id),
            avatar: message.avatar
        },
        files: filesMap.get(message.message_id) || []
    }))

    return { total: totalRows, messages };
  }, {
    query: t.Object({
      limit: t.Optional(t.Number({ default: 20, minimum: 0, maximum: 100 })),
      offset: t.Optional(t.Number({ default: 0, minimum: 0 })),
    }),
  });

export default app;