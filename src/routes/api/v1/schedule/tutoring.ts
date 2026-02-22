/**
 * Tutoring API Endpoints
 * Manage tutoring sessions (doučování)
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia({ prefix: '/schedule' })
    // List available tutoring sessions
    .get('/tutoring', async ({ query, cookie: { token } }) => {
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

        // Get upcoming tutoring sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Note: Using homework table as a proxy for tutoring 
        // (you may need a dedicated tutoring table)
        const sessions = await db
            .selectFrom('homework')
            .leftJoin('subjects', 'subjects.subject_id', 'homework.subject_id')
            .leftJoin('persons', 'persons.person_id', 'homework.teacher_id')
            .select([
                'homework.homework_id as sessionId',
                'homework.headline',
                'homework.assigned_at',
                'homework.homework',
                'subjects.label as subject',
                sql`CONCAT(persons.first_name, ' ', persons.last_name)`.as('teacher')
            ])
            .where('homework.type', '=', 2) // tutoring
            .where('homework.assigned_at', '>=', today)
            .orderBy('homework.assigned_at', 'asc')
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
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select([
                'tokens.user_id',
                'users.person_id',
                'users.role'
            ])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        if (auth.role != "teacher") {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const { subjectId, title, description, date, maxStudents, room } = body;


        return Response.json({ sessionId: -1, success: true });
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
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.person_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const sessionId = parseInt(params.id);

        // Verify ownership
        const session = await db
            .selectFrom('homework')
            .select(['teacher_id'])
            .where('homework_id', '=', sessionId)
            .executeTakeFirst();

        if (!session || session.teacher_id !== auth.person_id) {
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
