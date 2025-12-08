/**
 * Education Measures API Endpoints
 * Manage student educational measures (praise, reprimand, warnings, etc.)
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { validateBody, createEducationMeasureSchema } from '../../../../utils/validation.schemas';

const app = new Elysia()
    // List education measures
    .get('/measures', async ({ query, cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.person', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const isTeacher = auth.role === 'teacher' || auth.role === 'admin';

        let q = db
            .selectFrom('student_rewards') // This table can be used for both rewards and measures
            .leftJoin('persons as student', 'student.person', 'student_rewards.person')
            .leftJoin('users as issuer', 'issuer.userId', 'student_rewards.created_by')
            .leftJoin('persons as issuer_person', 'issuer_person.person', 'issuer.person')
            .select([
                'student_rewards.reward_id as id',
                'student_rewards.type',
                'student_rewards.reason',
                'student_rewards.note',
                'student_rewards.date',
                'student_rewards.person as studentId',
                db.fn('concat', ['student.firstname', db.val(' '), 'student.lastname']).as('studentName'),
                db.fn('concat', ['issuer_person.firstname', db.val(' '), 'issuer_person.lastname']).as('issuedByName'),
            ])
            .where('student_rewards.type', 'in', ['praise', 'reprimand', 'warning', 'reduced_behavior', 'other']);

        // Students only see their own measures
        if (!isTeacher) {
            q = q.where('student_rewards.person', '=', auth.person);
        }

        // Filter by student if specified
        if (query.studentId && isTeacher) {
            q = q.where('student_rewards.person', '=', parseInt(query.studentId));
        }

        const measures = await q.orderBy('student_rewards.date', 'desc').limit(50).execute();

        return Response.json({ measures });
    })

    // Create education measure (teacher only)
    .post('/measures', async ({ body, cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || (auth.role !== 'teacher' && auth.role !== 'admin')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const validation = validateBody(createEducationMeasureSchema, body);
        if (!validation.success) {
            return Response.json({ error: 'validation_failed', details: validation.errors }, { status: 400 });
        }

        const { studentId, type, reason, date, note } = validation.data;

        const result = await db
            .insertInto('student_rewards')
            .values({
                person: studentId,
                type: type as any,
                reason,
                date: new Date(date),
                note: note || null,
                created_by: auth.userId
            })
            .execute();

        return Response.json({ measure_id: Number(result[0].insertId), success: true });
    })

    // Update education measure
    .put('/measures/:id', async ({ params, body, cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || (auth.role !== 'teacher' && auth.role !== 'admin')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const measureId = parseInt(params.id);
        const { reason, note } = body as any;

        await db
            .updateTable('student_rewards')
            .set({
                reason,
                note
            })
            .where('reward_id', '=', measureId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // Delete education measure
    .delete('/measures/:id', async ({ params, cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || (auth.role !== 'admin')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('student_rewards')
            .where('reward_id', '=', parseInt(params.id))
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        })
    });

export default app;
