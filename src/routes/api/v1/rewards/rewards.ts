/**
 * Rewards API Endpoints
 * CRUD operations for student rewards
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { notificationBroadcaster } from '../../../../functions/notification-broadcaster';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
    // Get rewards for current user (student view) or all rewards (teacher view)
    .get('/rewards', async ({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select([
                'tokens.userId',
                'users.person',
                'users.role',
                'users.manager'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth?.person) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        // Check if user is teacher/admin
        const isTeacher = auth.role === 'teacher' || auth.manager == -1 || auth.role === 'admin_staff';

        let query = db
            .selectFrom('rewards')
            .leftJoin('persons', 'persons.personId', 'rewards.student_id')
            .leftJoin('users as creator', 'creator.userId', 'rewards.created_by')
            .select([
                'rewards.reward_id as id',
                'rewards.title',
                'rewards.description',
                'rewards.amount',
                'rewards.type',
                'rewards.status',
                'rewards.created_at as createdAt',
                'rewards.created_by as teacherId',
                'rewards.collected_at as collectedAt',
                'rewards.student_id as studentId'
            ]);

        if (!isTeacher) {
            // Student sees only their rewards
            query = query.where('rewards.student_id', '=', auth.person);
        }

        const rewards = await query
        .orderBy('rewards.created_at', 'desc')
        .execute();

        const peopleIds = rewards.map((reward) => (reward.studentId, reward.teacherId));

        const peopleNames = await format_person_map_by_ids(peopleIds);

        return Response.json({ rewards: rewards.map((reward) => ({...reward, teacherName: peopleNames.get(reward.teacherId), studentName: peopleNames.get(reward.studentId) })) });
    })

    // Create a new reward (teacher only)
    .post('/rewards', async ({ body, cookie }) => {
        const token = cookie.token?.value as string;
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

        // Only teachers can create rewards
        if (auth.role !== 'teacher' && auth.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const { title, description, amount, type, studentId } = body as any;

        if (!title || !type || !studentId) {
            return Response.json({ error: 'missing_fields' }, { status: 400 });
        }

        // Insert reward
        const result = await db
            .insertInto('rewards')
            .values({
                title,
                description: description || '',
                amount: amount || null,
                type,
                student_id: studentId,
                status: 'pending',
                created_by: auth.userId,
                created_at: new Date()
            })
            .execute();

        const rewardId = Number(result[0].insertId);

        // Get student's user ID for notification
        const student = await db
            .selectFrom('users')
            .select(['userId'])
            .where('person', '=', studentId)
            .executeTakeFirst();

        if (student) {
            // Send real-time notification to student
            await notificationBroadcaster.notifyNewReward(student.userId, {
                title,
                type,
                amount
            });
        }

        return Response.json({ reward_id: rewardId, success: true });
    }, {
        body: t.Object({
            title: t.String(),
            description: t.Optional(t.String()),
            amount: t.Optional(t.Number()),
            type: t.Union([
                t.Literal('financial'),
                t.Literal('certificate'),
                t.Literal('prize'),
                t.Literal('other')
            ]),
            studentId: t.Number()
        })
    })

    // Update reward status (mark as collected)
    .put('/rewards/:id', async ({ params, body, cookie }) => {
        const token = cookie.token?.value as string;
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

        const rewardId = parseInt(params.id);
        const { status } = body as any;

        // Get reward to check permissions
        const reward = await db
            .selectFrom('rewards')
            .select(['student_id', 'status'])
            .where('reward_id', '=', rewardId)
            .executeTakeFirst();

        if (!reward) {
            return Response.json({ error: 'not_found' }, { status: 404 });
        }

        // Only teachers can mark as collected, or the student themselves
        const isTeacher = auth.role === 'teacher' || auth.role === 'admin_staff';
        const isOwner = reward.student_id === auth.person;

        if (!isTeacher && !isOwner) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        // Update reward
        const updateData: any = { status };
        if (status === 'collected') {
            updateData.collected_at = new Date();
        }

        await db
            .updateTable('rewards')
            .set(updateData)
            .where('reward_id', '=', rewardId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            status: t.Union([
                t.Literal('pending'),
                t.Literal('collected')
            ])
        })
    })

    // Delete reward (teacher only)
    .delete('/rewards/:id', async ({ params, cookie }) => {
        const token = cookie.token?.value as string;
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

        // Only teachers can delete rewards
        if (auth.role !== 'teacher' && auth.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const rewardId = parseInt(params.id);

        await db
            .deleteFrom('rewards')
            .where('reward_id', '=', rewardId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        })
    });

export default app;
