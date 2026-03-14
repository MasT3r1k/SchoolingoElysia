/**
 * Sent Messages API Endpoints
 * View messages sent by the current user
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
    // Get sent messages
    .get('/sent', async ({ query, user }) => {
        // Use user from derive context (authentication check)
        if (!user) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');
        const offset = (page - 1) * limit;

        // Get sent messages
        const messages = await db
            .selectFrom('messages')
            .select([
                'messages.message_id',
                'messages.message', 
                'messages.topic',   
                'messages.type',
                'messages.sent_at as created_at', 
                'messages.author_id' 
            ])
            .where('messages.author_id', '=', user.person_id)
            .orderBy('messages.sent_at', 'desc')
            .offset(offset)
            .limit(limit)
            .execute();

        // N+1 Optimization: Fetch all recipients for these messages in ONE query
        const messageIds = messages.map(m => m.message_id);
        let allRecipients: { message_id: number; person: number; name: string; is_read: number | null }[] = [];

        if (messageIds.length > 0) {
            allRecipients = await db
                .selectFrom('messages_receivers')
                .innerJoin('persons', 'persons.person_id', 'messages_receivers.receiver_id')
                .leftJoin('users', 'users.person_id', 'persons.person_id')
                .select([
                    'messages_receivers.message_id', 
                    'persons.person_id as person',
                    sql<string>`concat(persons.first_name, ' ', persons.last_name)`.as('name'),
                    'messages_receivers.read_at',
                    'users.avatar'
                ])
                .where('messages_receivers.message_id', 'in', messageIds)
                .execute()
                // Map read_at to is_read logic if client expects 0/1
                .then(rows => rows.map(r => ({
                    ...r,
                    is_read: r.read_at ? 1 : 0
                })));
        }

        // Get total count
        const total = await db
            .selectFrom('messages')
            .select(sql<number>`count(message_id)`.as('count'))
            .where('messages.author_id', '=', user.person_id)
            .executeTakeFirst();

        // Map recipients to messages in memory
        const messagesWithRecipients = messages.map((msg) => {
            const recipients = allRecipients.filter(r => r.message_id === msg.message_id);
            return {
                ...msg,
                recipients
            };
        });

        return Response.json({
            messages: messagesWithRecipients,
            pagination: {
                page,
                limit,
                total: Number(total?.count || 0),
                pages: Math.ceil(Number(total?.count || 0) / limit)
            }
        });
    }, {
        query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String())
        })
    })

    // Get single sent message
    .get('/sent/:id', async ({ params, user }) => {
        if (!user) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const messageId = parseInt(params.id);

        const message = await db
            .selectFrom('messages')
            .selectAll()
            .where('message_id', '=', messageId)
            .where('author_id', '=', user.person_id)
            .executeTakeFirst();

        if (!message) {
            return Response.json({ error: 'not_found' }, { status: 404 });
        }

        // Get recipients with read status
        const recipients = await db
            .selectFrom('messages_receivers')
            .innerJoin('persons', 'persons.person_id', 'messages_receivers.receiver_id')
            .leftJoin('users', 'users.person_id', 'persons.person_id')
            .select([
                'persons.person_id as person',
                sql<string>`concat(persons.first_name, ' ', persons.last_name)`.as('name'),
                'messages_receivers.read_at',
                'users.avatar'
            ])
            .where('messages_receivers.message_id', '=', messageId)
            .execute();

        return Response.json({
            message,
            recipients
        });
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // Delete sent message
    .delete('/sent/:id', async ({ params, user }) => {
        if (!user) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const messageId = parseInt(params.id);

        // Verify ownership
        const message = await db
            .selectFrom('messages')
            .select(['message_id'])
            .where('message_id', '=', messageId)
            .where('author_id', '=', user.person_id)
            .executeTakeFirst();

        if (!message) {
            return Response.json({ error: 'not_found' }, { status: 404 });
        }

        // Delete (or soft delete)
        await db.deleteFrom('messages').where('message_id', '=', messageId).execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        })
    });

export default app;
