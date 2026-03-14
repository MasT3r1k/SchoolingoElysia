import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { format_person_by_id } from '../../../../functions/format_person_by_id';

const app = new Elysia()
  .get('/messages/details/:id', async ({ cookie, params }) => {
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

    const messageId = parseInt(params.id);

    const message = await db
        .selectFrom('messages')
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
            'messages.deleted',
            'messages.require_confirm',
            'users.avatar'
        ])
        .where('messages.message_id', '=', messageId)
        .executeTakeFirst();

    if (!message) return { error: 'message_not_found' };

    // Fetch receivers and their simplified group info (class)
    // We only care about students for classes usually.
    const receivers = await db
        .selectFrom('messages_receivers')
        .innerJoin('persons', 'messages_receivers.receiver_id', 'persons.person_id')
        .leftJoin('users', 'users.person_id', 'persons.person_id')
        .leftJoin('students', 'persons.person_id', 'students.person_id')
        .leftJoin('classes', 'students.class_id', 'classes.class_id')
        .leftJoin('student_groups', 'students.person_id', 'student_groups.student_id')
        .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
        .select([
            'persons.person_id',
            'persons.first_name',
            'persons.last_name',
            sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className'),
            'messages_receivers.read_at',
            'messages_receivers.confirmed_at',
            'users.avatar'
        ])
        .where('messages_receivers.message_id', '=', messageId)
        .execute();

    // Format author name
    const authorName = await format_person_by_id(message.author_id);

    // Build unique class/group names
    const targetGroups = new Set<string>();
    
    // Remove duplicates and process receivers
    const uniqueReceiversMap = new Map();
    receivers.forEach(r => {
        let primaryGroup = '';
        if (r.className) {
            primaryGroup = `${r.className}`;
            targetGroups.add(primaryGroup);
        }

        if (!uniqueReceiversMap.has(r.person_id)) {
            uniqueReceiversMap.set(r.person_id, {
                personId: r.person_id,
                first_name: r.first_name,
                lastName: r.last_name,
                groupName: primaryGroup, 
                read_at: r.read_at,
                confirmed_at: r.confirmed_at,
                avatar: r.avatar
            });
        }
    });
    
    const formattedReceivers = Array.from(uniqueReceiversMap.values());
    const uniqueClasses = Array.from(targetGroups).sort();

    const receiverIds = formattedReceivers.map(r => r.person_id);
    const receiverNames = await format_person_map_by_ids(receiverIds);
    
    formattedReceivers.forEach((r) => {
        r.full_name = receiverNames.get(r.person_id);
    });

     return {
        ...message,
        author: {
            first_name: message.first_name,
            last_name: message.last_name,
            full_name: authorName,
            avatar: message.avatar
        },
        receivers: formattedReceivers,
        target_groups: uniqueClasses
    };

  }, {
    params: t.Object({
      id: t.String()
    })
  });

export default app;
