import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { getAuthUser } from '../../../../utils/auth';

import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';

const app = new Elysia()
    .post('/timetable/manage', async ({ cookie, body }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.TIMETABLE_EDIT);
        if (!perm) return { error: 'no_permission' };

        const { action, lessonId, day, hour, subjectId, teacherId, teacher2Id, roomId, groupId } = body;

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
                    subject_id: subjectId,
                    teacher_id: teacherId || undefined, // Optional if not assigned
                    teacher2_id: teacher2Id || null,
                    room_id: roomId || undefined,
                    group_id: groupId,
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
            teacher2Id: t.Optional(t.Nullable(t.Number())),
            roomId: t.Optional(t.Number()),
            groupId: t.Optional(t.Number()),
            type: t.Optional(t.Number())
        })
    });

export default app;
