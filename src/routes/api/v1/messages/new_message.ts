import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { notificationService } from '../../../../functions/notification.service';

const app = new Elysia()
  .post('/messages/new_noticeboard', async ({ cookie, body }) => {
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

    const { topic, message } = body;
    if (topic == undefined || message == undefined) return { error: 'invalid_body' };

    try {
      const messageDB = await db.insertInto('messages')
      .values({
            type: 1,
            topic,
            message,
            author_id: auth.person_id as number,
        })
      .executeTakeFirst();

      const messageId = Number(messageDB.insertId);

      // Notify all users about the new noticeboard item
      const sender = await db.selectFrom('persons')
        .select(['first_name', 'last_name'])
        .where('person_id', '=', auth.person_id as number)
        .executeTakeFirst();
      
      const senderName = sender ? `${sender.first_name} ${sender.last_name}` : 'Nástěnka';

      // For noticeboard, we probably want to broadcast or notify all students/teachers
      // However, we don't have a list of recipients here. 
      // If it's a general announcement, we might broadcast.
      // For now, let's just return success.

      return { success: true, message_id: messageId };
    } catch(e) {
      return { success: false };
    }
  }, {
    body: t.Object({
      topic: t.Optional(t.String()),
      message: t.Optional(t.String())
    }),
  })
  
  .post('/messages/send', async ({ cookie, body }) => {
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

    const { topic, message, recipients, type, require_confirm, files, draft_id, copy_to_class_teacher, copy_to_parents, copy_to_students, 
            excuse_date_from, excuse_date_to, excuse_hour_from, excuse_hour_to, excuse_all_day } = body;

    // Validation
    if (!message || message.trim().length === 0) return { error: 'invalid_body', details: 'missing_message' };
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return { error: 'invalid_body', details: 'missing_recipients' };
    }

    try {
        const result = await db.transaction().execute(async (trx) => {
            // 1. Create message
            const insertResult = await trx.insertInto('messages')
                .values({
                    type: type ?? 0,
                    topic: topic || null,
                    message,
                    author_id: auth.person_id as number,
                    require_confirm: require_confirm ? true : false,
                    excuse_date_from: excuse_date_from || null,
                    excuse_date_to: excuse_date_to || null,
                    excuse_hour_from: excuse_hour_from || null,
                    excuse_hour_to: excuse_hour_to || null,
                    excuse_all_day: excuse_all_day ? true : false,
                    message_rating_type: type === 3 ? (body as any).message_rating_type : null
                } as any)
                .executeTakeFirstOrThrow();
            
            const messageId = Number(insertResult.insertId);

            // 2. Add recipients
            let expandedRecipients = new Set<number>(recipients);

            if (copy_to_class_teacher) {
                // Class teachers of students in recipients
                const sTeachers = await trx.selectFrom('students')
                    .innerJoin('classes', 'classes.class_id', 'students.class_id')
                    .select('classes.teacher_id')
                    .where('students.person_id', 'in', recipients)
                    .execute();
                sTeachers.forEach(t => t.teacher_id && expandedRecipients.add(t.teacher_id));

                // Class teachers of parents' children in recipients
                const pTeachers = await trx.selectFrom('family_relations')
                    .innerJoin('students', 'students.person_id', 'family_relations.source_id')
                    .innerJoin('classes', 'classes.class_id', 'students.class_id')
                    .select('classes.teacher_id')
                    .where('family_relations.target_id', 'in', recipients)
                    .execute();
                pTeachers.forEach(t => t.teacher_id && expandedRecipients.add(t.teacher_id));
            }

            if (copy_to_parents) {
                // Parents of students in recipients
                const parents = await trx.selectFrom('family_relations')
                    .select('target_id')
                    .where('source_id', 'in', recipients)
                    .execute();
                parents.forEach(p => expandedRecipients.add(p.target_id));
            }

            if (copy_to_students) {
                // Students of parents in recipients
                const students = await trx.selectFrom('family_relations')
                    .select('source_id')
                    .where('target_id', 'in', recipients)
                    .execute();
                students.forEach(s => expandedRecipients.add(s.source_id));
            }

            const filteredRecipients = Array.from(expandedRecipients).filter(id => id !== (auth.person_id as number));
            if (filteredRecipients.length === 0) {
                return { success: false, error: 'no_recipients' };
            }

            const receiverValues = filteredRecipients.map(recipientId => ({
                message_id: messageId,
                receiver_id: recipientId
            }));

            await trx.insertInto('messages_receivers')
                .values(receiverValues)
                .execute();

            // 3. Add files if any
            if (files && files.length > 0) {
                const fileValues = files.map(fileId => ({
                    message_id: messageId,
                    file_id: fileId
                }));
                await trx.insertInto('messages_files')
                    .values(fileValues)
                    .execute();
            }

            // 4. Delete draft if it was a draft
            if (draft_id) {
                await trx.deleteFrom('messages_drafts')
                    .where('draft_id', '=', draft_id)
                    .where('author_id', '=', auth.person_id as number)
                    .execute();
            }

            return { success: true, message_id: messageId, filteredRecipients };
        });

        if (result.success && result.filteredRecipients) {
            // Send notifications outside of transaction to avoid long-running locks
            const sender = await db.selectFrom('persons')
                .select(['first_name', 'last_name'])
                .where('person_id', '=', auth.person_id as number)
                .executeTakeFirst();
            
            const senderName = sender ? `${sender.first_name} ${sender.last_name}` : 'Uživatel';

            // Get user IDs for recipients (since recipients are person_ids)
            const recipientUsers = await db.selectFrom('users')
                .select(['user_id', 'person_id'])
                .where('person_id', 'in', result.filteredRecipients)
                .execute();

            for (const recipient of recipientUsers) {
                await notificationService.sendNotification('new_message', recipient.user_id, {
                    senderName,
                    subject: topic || 'Bez předmětu',
                    messageId: result.message_id
                });
            }
        }

        return result;
    } catch (e) {
        console.error('Failed to send message:', e);
        return { success: false, error: 'db_error' };
    }
  }, {
    body: t.Object({
      topic: t.Optional(t.Nullable(t.String())),
      message: t.String(),
      recipients: t.Array(t.Number()),
      type: t.Optional(t.Number()),
      require_confirm: t.Optional(t.Boolean()),
      copy_to_class_teacher: t.Optional(t.Boolean()),
      copy_to_parents: t.Optional(t.Boolean()),
      copy_to_students: t.Optional(t.Boolean()),
      files: t.Optional(t.Array(t.Number())),
      draft_id: t.Optional(t.Nullable(t.Number())),
      excuse_date_from: t.Optional(t.Nullable(t.String())),
      excuse_date_to: t.Optional(t.Nullable(t.String())),
      excuse_hour_from: t.Optional(t.Nullable(t.Number())),
      excuse_hour_to: t.Optional(t.Nullable(t.Number())),
      excuse_all_day: t.Optional(t.Nullable(t.Boolean()))
    })
  });

export default app;
