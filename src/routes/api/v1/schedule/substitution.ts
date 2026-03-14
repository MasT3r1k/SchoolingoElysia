/**
 * Substitution API Endpoints
 * Manage lesson substitutions and changes
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { validateBody, createSubstitutionSchema } from '../../../../utils/validation.schemas';
import { notificationService } from '../../../../functions/notification.service';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import moment from 'moment';

const app = new Elysia({ prefix: '/schedule' })
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
        const date = query.date || moment('YYYY-MM-DD');
        const endDate = query.endDate;
        const type = query.type;

        let queryBuilder = db
            .selectFrom('substitution')
            .leftJoin('groups', 'groups.group_id', 'substitution.group_id')
            .leftJoin('classes', 'classes.class_id', 'groups.class_id')
            .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
            .leftJoin('subjects', 'subjects.subject_id', 'substitution.subject_id')
            // New room (from substitution)
            .leftJoin('building_rooms as new_room', 'new_room.room_id', 'substitution.room_id')
            // Original lesson from timetable (same group + hour + day)
            // MySQL: WEEKDAY() returns 0 for Monday, so we add 1 to match 1-7 in timetable.day
            .leftJoin('timetable', (join) =>
                join
                    .onRef('timetable.group_id', '=', 'substitution.group_id')
                    .onRef('timetable.hour', '=', 'substitution.start_hour')
                    // .on('timetable.day', '=', sql`WEEKDAY(substitution.start_date)`)
            )
            .leftJoin('subjects as old_subject', 'subjects.subject_id', 'timetable.subject_id')
            // Old room (from timetable)
            .leftJoin('building_rooms as old_room', 'old_room.room_id', 'timetable.room_id')
            .where((eb) => {
                let conditions = [];
                if (endDate) {
                    conditions.push(eb.and([
                        eb('substitution.start_date', '>=', date as any),
                        eb('substitution.start_date', '<=', endDate as any)
                    ]));
                } else {
                    conditions.push(eb('substitution.start_date', '=', date as any));
                }

                if (type && type !== 'all') {
                    if (type === 'cancelled') {
                        conditions.push(eb.or([
                            eb('substitution.subject_id', '=', -1),
                            eb('substitution.teacher_id', '=', -1),
                        ]));
                    } else if (type === 'substitution') {
                        conditions.push(eb.and([
                            eb('substitution.subject_id', '>', 0),
                            eb('substitution.teacher_id', '>', 0),
                        ]));
                    } else if (type === 'room_change') {
                        conditions.push(eb.and([
                            eb('substitution.room_id', 'is not', null),
                            eb('substitution.room_id', '!=', eb.ref('timetable.room_id')),
                            eb('substitution.subject_id', '>', 0),
                            eb('substitution.teacher_id', '>', 0),
                        ]));
                    }
                }

                return eb.and(conditions);
            });

        const rows = await queryBuilder
            .select([
                'substitution.substitution_id',
                'substitution.start_date as date',
                'substitution.start_hour as hour',
                'substitution.type',
                'substitution.room_id as new_room_id',
                'subjects.label as subjectName',
                'new_room.name as newRoomName',
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('className'),
                'old_room.name as oldRoomName',
                'old_subject.label as originalSubjectName',
                'timetable.teacher_id as originalTeacherId',
                'substitution.teacher_id as substituteTeacherId',
            ] as any)
            .orderBy('substitution.start_date', 'asc')
            .orderBy('substitution.start_hour', 'asc')
            .groupBy('substitution.substitution_id')
            .execute();

        // Collect all person IDs that need to be resolved
        const personIds = [
            ...rows.map((r: any) => r.originalTeacherId),
            ...rows.map((r: any) => r.substituteTeacherId),
        ].filter((id): id is number => id != null && !isNaN(Number(id))).map(Number);

        const personMap = await format_person_map_by_ids([...new Set(personIds)]);

        console.log(rows)
        const substitutions = rows.map((row: any) => ({
            substitution_id: row.substitution_id,
            date: row.date,
            hour: row.hour,
            type: row.type,
            subjectName: row.subjectName,
            className: row.className,
            originalTeacher: row.originalTeacherId ? (personMap.get(Number(row.originalTeacherId)) ?? null) : null,
            substituteTeacher: row.substituteTeacherId ? (personMap.get(Number(row.substituteTeacherId)) ?? null) : null,
            oldRoomName: row.oldRoomName ?? null,
            newRoomName: row.newRoomName ?? null,
        }));

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
                start_date: new Date(date),
                start_hour: lessonNumber,
                end_date: new Date(date),
                end_hour: lessonNumber,
                teacher_id: substituteTeacherId || null,
                group_id: classId,
                subject_id: subjectId || null,
                type
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
            for (const userId of userIds) {
                await notificationService.sendNotification('substitution_new', userId, {
                    date: new Date(date),
                    changeType: type as 'cancelled' | 'substitution' | 'room_change',
                    description: note || undefined
                });
            }
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
