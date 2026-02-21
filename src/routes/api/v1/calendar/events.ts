/**
 * Calendar / Events API Endpoints
 * Manage school events, holidays, exams, and meetings
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
    // Get events for a date range
    .get('/events', async ({ query, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.person_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        // Default to current month
        const now = new Date();
        const startDate = query.start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endDate = query.end || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const events = await db
            .selectFrom('events')
            .selectAll()
            .where('date', '>=', new Date(startDate))
            .where('date', '<=', new Date(endDate))
            .orderBy('date', 'asc')
            .execute();

        return Response.json({ events });
    })

    // Get single event
    .get('/events/:id', async ({ params, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const event = await db
            .selectFrom('events')
            .selectAll()
            .where('event_id', '=', parseInt(params.id))
            .executeTakeFirst();

        if (!event) {
            return Response.json({ error: 'not_found' }, { status: 404 });
        }

        return Response.json({ event });
    }, {
        params: t.Object({ id: t.String() })
    })

    // Create event (teacher/admin only)
    .post('/events', async ({ body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const { name, description, date, type } = body;

        const result = await db
            .insertInto('events')
            .values({
                event_name: name,
                event_description: description || null,
                created_time: new Date(date),
                event_type: type || 'event'
            })
            .execute();

        return Response.json({ event_id: Number(result[0].insertId), success: true });
    }, {
        body: t.Object({
            name: t.String(),
            description: t.Optional(t.String()),
            date: t.String(),
            type: t.Optional(t.String())
        })
    })

    // Update event
    .put('/events/:id', async ({ params, body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const eventId = parseInt(params.id);

        await db
            .updateTable('events')
            .set(body as any)
            .where('event_id', '=', eventId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            name: t.Optional(t.String()),
            description: t.Optional(t.String()),
            date: t.Optional(t.String()),
            type: t.Optional(t.String())
        })
    })

    // Delete event
    .delete('/events/:id', async ({ params, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['user_id', 'users.manager'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('events')
            .where('event_id', '=', parseInt(params.id))
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() })
    });

export default app;
