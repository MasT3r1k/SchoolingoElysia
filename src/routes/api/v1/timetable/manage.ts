import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
    .derive(async ({ cookie }) => ({
        user: await getAuthUser(cookie?.token?.value as string)
    }))

    .post('/timetable/manage', async ({ body, user }) => {
        if (!user || (!user.is_principal && user.manager != -1)) { 
            if (!user) return { error: 'unauthorized', status: 401 };
        }

        const { action, lessonId, day, hour, subjectId, teacherId, roomId, groupId } = body;

        try {
            if (action === 'delete') {
                if (!lessonId) return { error: 'missing_id' };
                
                await db.deleteFrom('timetable')
                    .where('lesson_id', '=', lessonId)
                    .execute();
                
                return { success: true, action: 'deleted' };
            }
            
            if (action === 'create' || action === 'update') {
                // Validation
                if (day === undefined || hour === undefined || subjectId == undefined || groupId == undefined) {
                    return { error: 'missing_fields' };
                }

                const type = body.type ?? 0;

                const lessonData = {
                    day,
                    hour,
                    subject: subjectId,
                    teacher: teacherId || undefined, // Optional if not assigned
                    room: roomId || undefined,
                    groupId,
                    type // Default Normal or provided
                };

                // Check if lesson in this slot already exists
                const existing = await db.selectFrom('timetable')
                    .select('lesson_id')
                    .where('day', '=', day)
                    .where('hour', '=', hour)
                    .where('group_id', '=', groupId)
                    .where('type', '=', type)
                    .executeTakeFirst();

                if (existing) {
                    await db.updateTable('timetable')
                        .set(lessonData)
                        .where('lesson_id', '=', existing.lesson_id)
                        .execute();
                    
                    if (lessonId && lessonId != existing.lesson_id) {
                         await db.deleteFrom('timetable')
                             .where('lesson_id', '=', lessonId)
                             .execute();
                    }

                    return { success: true, action: 'updated', lessonId: existing.lesson_id };
                } else {
                    if (lessonId) {
                        // Move existing lesson to empty slot
                        await db.updateTable('timetable')
                            .set(lessonData)
                            .where('lesson_id', '=', lessonId)
                            .execute();
                        return { success: true, action: 'updated' };
                    } else {
                        // Create new lesson in empty slot
                        const result = await db.insertInto('timetable')
                            // @ts-ignore - Kysely types might complain about auto-increment omitted
                            .values(lessonData)
                            .executeTakeFirst();
                        return { success: true, action: 'created', id: Number(result.insertId) };
                    }
                }
            }
        
            return { error: 'invalid_action' };

        } catch (e) {
            console.error(e);
            return { error: 'db_error', details: e };
        }

    }, {
        body: t.Object({
            action: t.String(), // 'create', 'update', 'delete'
            lessonId: t.Optional(t.Nullable(t.Number())),
            day: t.Optional(t.Number()),
            hour: t.Optional(t.Number()),
            subjectId: t.Optional(t.Number()),
            teacherId: t.Optional(t.Number()),
            roomId: t.Optional(t.Number()),
            groupId: t.Optional(t.Number()),
            type: t.Optional(t.Number())
        })
    });

export default app;
