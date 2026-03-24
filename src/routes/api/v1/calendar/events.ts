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
            .select([
                'event_id',
                'event_name as name',
                'event_description as description',
                'event_date as date',
                'event_end_date as endDate',
                'event_type as type',
                'class_id as classId'
            ])
            .where((eb) => eb.or([
                eb.and([
                    eb('event_date', '>=', startDate),
                    eb('event_date', '<=', endDate)
                ]),
                eb.and([
                    eb('event_end_date', '>=', startDate),
                    eb('event_end_date', '<=', endDate)
                ]),
                eb.and([
                    eb('event_date', '<=', startDate),
                    eb('event_end_date', '>=', endDate)
                ])
            ]))
            .orderBy('event_date', 'asc')
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
            .select([
                'event_id',
                'event_name as name',
                'event_description as description',
                'event_date as date',
                'event_end_date as endDate',
                'event_type as type',
                'class_id as classId'
            ])
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

        const { name, description, date, endDate, type, classId } = body;

        const result = await db
            .insertInto('events')
            .values({
                event_name: name,
                event_description: description || null,
                event_date: date,
                event_end_date: endDate || null,
                event_type: type || 'event',
                class_id: classId || null,
                created_by: auth.user_id
            })
            .execute();

        const insertId = Number(result[0].insertId);

        return Response.json({ event_id: insertId, success: true });
    }, {
        body: t.Object({
            name: t.String(),
            description: t.Optional(t.String()),
            date: t.String(),
            endDate: t.Optional(t.Nullable(t.String())),
            type: t.Optional(t.String()),
            classId: t.Optional(t.Nullable(t.Number()))
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

        const updateData: any = {};
        if (body.name !== undefined) updateData.event_name = body.name;
        if (body.description !== undefined) updateData.event_description = body.description;
        if (body.date !== undefined) updateData.event_date = body.date;
        if (body.endDate !== undefined) updateData.event_end_date = body.endDate;
        if (body.type !== undefined) updateData.event_type = body.type;

        await db
            .updateTable('events')
            .set(updateData)
            .where('event_id', '=', eventId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            name: t.Optional(t.String()),
            description: t.Optional(t.String()),
            date: t.Optional(t.String()),
            endDate: t.Optional(t.Nullable(t.String())),
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
