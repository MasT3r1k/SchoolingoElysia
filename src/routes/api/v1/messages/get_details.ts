import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

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
        ])
        .where('messages.message_id', '=', messageId)
        .executeTakeFirst();

    if (!message) return { error: 'message_not_found' };

    // Fetch receivers and their simplified group info (class)
    // We only care about students for classes usually.
    const receivers = await db
        .selectFrom('messages_receivers')
        .innerJoin('persons', 'messages_receivers.receiver_id', 'persons.person_id')
        .leftJoin('students', 'persons.person_id', 'students.person_id')
        .leftJoin('classes', 'students.class_id', 'classes.class_id')
        .leftJoin('student_groups', 'students.person_id', 'student_groups.student_id')
        .leftJoin('groups', 'student_groups.group_id', 'groups.group_id')
        .select([
            'persons.person_id',
            'persons.first_name',
            'persons.last_name',
            'classes.prefix',
            'classes.suffix',
            'groups.name as groupName',
            'messages_receivers.read_at',
            'messages_receivers.confirmed_at'
        ])
        .where('messages_receivers.message_id', '=', messageId)
        .execute();

    // Format author name
    const authorName = (await format_people_by_ids([message.author_id]))[0];

    // Build unique class/group names
    const targetGroups = new Set<string>();
    
    // Remove duplicates and process receivers
    const uniqueReceiversMap = new Map();
    receivers.forEach(r => {
        let primaryGroup = '';
        if (r.prefix && r.suffix) {
            primaryGroup = `${r.prefix}.${r.suffix}`;
            targetGroups.add(primaryGroup);
        }
        if (r.groupName) {
            targetGroups.add(r.groupName);
            // If primaryGroup is empty, use groupName
            if (!primaryGroup) primaryGroup = r.groupName;
        }

        if (!uniqueReceiversMap.has(r.personId)) {
            uniqueReceiversMap.set(r.personId, {
                personId: r.personId,
                first_name: r.first_name,
                lastName: r.lastName,
                groupName: primaryGroup, 
                read_at: r.read_at,
                confirmed_at: r.confirmed_at
            });
        }
    });
    
    const formattedReceivers = Array.from(uniqueReceiversMap.values());
    const uniqueClasses = Array.from(targetGroups).sort();

    // Also get full names for receivers using format_people_by_ids to be consistent
    const receiverIds = formattedReceivers.map(r => r.personId);
    const receiverNames = await format_people_by_ids(receiverIds);
    
    formattedReceivers.forEach((r, index) => {
        r.full_name = receiverNames[index];
    });

     return {
        ...message,
        author: {
             first_name: message.first_name,
             last_name: message.lastName,
             full_name: authorName
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
