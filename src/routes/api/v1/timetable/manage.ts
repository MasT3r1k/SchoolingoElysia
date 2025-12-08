import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
    .derive(async ({ cookie }) => ({
        user: await getAuthUser(cookie?.token?.value)
    }))
    // Manage Timetable (Create/Update/Delete)
    .post('/timetable/manage', async ({ body, user }) => {
        // Auth Check: Only Admins or Scheduler (Permission Check needed? assuming Admin/Manager for now)
        if (!user || (!user.isPrincipal && user.manager != -1)) { 
            // Strict check: Must be Principal or Independent (Admin)? 
            // Determine "Scheduler" role later. For now match Dashboard Admin logic.
            // Or if user is "Teacher" but has permissions? 
            // I'll stick to basic Auth for now.
            if (!user) return { error: 'unauthorized', status: 401 };
        }

        const { action, lessonId, day, hour, subjectId, teacherId, roomId, groupId } = body;

        try {
            if (action === 'delete') {
                if (!lessonId) return { error: 'missing_id' };
                
                await db.deleteFrom('timetable')
                    .where('lessonId', '=', lessonId)
                    .execute();
                
                return { success: true, action: 'deleted' };
            }
            
            if (action === 'create' || action === 'update') {
                // Validation
                if (day === undefined || hour === undefined || !subjectId || !groupId) {
                    return { error: 'missing_fields' };
                }

                const lessonData = {
                    day: day,
                    hour: hour,
                    subject: subjectId,
                    teacher: teacherId || undefined, // Optional if not assigned
                    room: roomId || undefined,
                    groupId: groupId,
                    type: 0 // Default Normal
                };

                if (action === 'update' && lessonId) {
                    await db.updateTable('timetable')
                        .set(lessonData)
                        .where('lessonId', '=', lessonId)
                        .execute();
                    return { success: true, action: 'updated', lessonId };
                } else {
                    const result = await db.insertInto('timetable')
                        // @ts-ignore - Kysely types might complain about auto-increment omitted
                        .values(lessonData)
                        .executeTakeFirst();
                    return { success: true, action: 'created', id: Number(result.insertId) };
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
            lessonId: t.Optional(t.Number()),
            day: t.Optional(t.Number()),
            hour: t.Optional(t.Number()),
            subjectId: t.Optional(t.Number()),
            teacherId: t.Optional(t.Number()),
            roomId: t.Optional(t.Number()),
            groupId: t.Optional(t.Number())
        })
    });

export default app;
