/**
 * Tutoring API Endpoints
 * Manage tutoring sessions (doučování)
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
    // List available tutoring sessions
    .get('/tutoring', async ({ query, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.person'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        // Get upcoming tutoring sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Note: Using homework table as a proxy for tutoring 
        // (you may need a dedicated tutoring table)
        const sessions = await db
            .selectFrom('homework')
            .leftJoin('subjects', 'subjects.subject_id', 'homework.subject')
            .leftJoin('persons', 'persons.person', 'homework.teacher')
            .select([
                'homework.homework_id as sessionId',
                'homework.name as title',
                'homework.date',
                'homework.description',
                'subjects.name as subject',
                db.fn('concat', ['persons.firstname', db.val(' '), 'persons.lastname']).as('teacher')
            ])
            .where('homework.type', '=', 'tutoring' as any)
            .where('homework.date', '>=', today)
            .orderBy('homework.date', 'asc')
            .limit(20)
            .execute();

        return Response.json({ sessions });
    })

    // Create tutoring session (teacher only)
    .post('/tutoring', async ({ body, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .leftJoin('teachers', 'teachers.person', 'users.person')
            .select(['tokens.userId', 'users.person', 'teachers.teacher'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.teacher) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const { subjectId, title, description, date, maxStudents, room } = body;

        const result = await db
            .insertInto('homework')
            .values({
                subject: subjectId,
                name: title,
                description: description || '',
                date: new Date(date),
                teacher: auth.person,
                type: 'tutoring' as any,
                // Use description to store extra info
                link: room ? `room:${room},max:${maxStudents || 10}` : null
            })
            .execute();

        return Response.json({ sessionId: Number(result[0].insertId), success: true });
    }, {
        body: t.Object({
            subjectId: t.Number(),
            title: t.String(),
            description: t.Optional(t.String()),
            date: t.String(),
            maxStudents: t.Optional(t.Number()),
            room: t.Optional(t.String())
        })
    })

    // Cancel tutoring session
    .delete('/tutoring/:id', async ({ params, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.person'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const sessionId = parseInt(params.id);

        // Verify ownership
        const session = await db
            .selectFrom('homework')
            .select(['teacher'])
            .where('homework_id', '=', sessionId)
            .executeTakeFirst();

        if (!session || session.teacher !== auth.person) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('homework')
            .where('homework_id', '=', sessionId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() })
    });

export default app;
