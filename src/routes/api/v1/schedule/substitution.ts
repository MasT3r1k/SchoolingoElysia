/**
 * Substitution API Endpoints
 * Manage lesson substitutions and changes
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { validateBody, createSubstitutionSchema } from '../../../../utils/validation.schemas';
import { notificationBroadcaster } from '../../../../functions/notification-broadcaster';

const app = new Elysia()
    // List substitutions
    .get('/substitution', async ({ query, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.person_id', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        // Default to today's date
        const date = query.date || new Date().toISOString().split('T')[0];

        const substitutions = await db
            .selectFrom('substitution')
            .leftJoin('groups', 'groups.group_id', 'substitution.group_id')
            .leftJoin('subjects', 'subjects.subject_id', 'substitution.subject_id')
            .leftJoin('persons as original', 'original.person_id', 'substitution.teacher_id')
            .leftJoin('persons as substitute', 'substitute.person_id', 'substitution.teacher_id')
            .select([
                'substitution.substitution_id',
                'substitution.date',
                'substitution.hour',
                'substitution.type',
                'subjects.label as subjectName',
                db.fn('concat', ['original.first_name', db.val(' '), 'original.lastname']).as('originalTeacher'),
                db.fn('concat', ['substitute.first_name', db.val(' '), 'substitute.lastname']).as('substituteTeacher'),
            ])
            .where('substitution.date', '=', date)
            .orderBy('substitution.hour', 'asc')
            .execute();

        return Response.json({ substitutions, date });
    })

    // Create substitution (admin/teacher only)
    .post('/substitution', async ({ body, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || (auth.role !== 'admin_staff' && auth.role !== 'teacher')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const validation = validateBody(createSubstitutionSchema, body);
        if (!validation.success) {
            return Response.json({ error: 'validation_failed', details: validation.errors }, { status: 400 });
        }

        const { date, lessonNumber, originalTeacherId, substituteTeacherId, classId, subjectId, type, note } = validation.data;

        const result = await db
            .insertInto('substitution')
            .values({
                date: new Date(date),
                hour: lessonNumber,
                original_teacher: originalTeacherId,
                substitute_teacher: substituteTeacherId || null,
                class: classId,
                subject_id: subjectId || null,
                type,
                note: note || null
            })
            .execute();

        // Notify affected students
        const students = await db
            .selectFrom('students')
            .leftJoin('users', 'users.person_id', 'students.person_id')
            .select(['users.user_id'])
            .where('students.class_id', '=', classId)
            .execute();

        const userIds = students.map(s => s.user_id).filter(Boolean) as number[];
        
        if (userIds.length > 0) {
            await notificationBroadcaster.notifyScheduleChange(userIds, {
                date: new Date(date),
                changeType: type as 'cancelled' | 'substitution' | 'room_change',
                description: note || undefined
            });
        }

        return Response.json({ substitution_id: Number(result[0].insertId), success: true });
    })

    // Delete substitution
    .delete('/substitution/:id', async ({ params, cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.role'])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth || (auth.role !== 'admin_staff' && auth.role !== 'teacher')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('substitution')
            .where('substitution_id', '=', parseInt(params.id))
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        })
    });

export default app;
