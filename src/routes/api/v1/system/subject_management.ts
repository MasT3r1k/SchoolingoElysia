import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';
import { format_person_by_id } from '../../../../functions/format_person_by_id'; // Assuming this exists given index.ts used it
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
    .derive(async ({ cookie }) => ({
        user: await getAuthUser(cookie?.token?.value as string)
    }))
    // POST /system/update_subject - Create or update subject
    .post('/system/update_subject', async ({ user, body }) => {
        if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
        if (user.manager === -1 && !user.is_principal && user.role !== 'admin_staff') {
            return Response.json({ error: 'no_permission' }, { status: 403 });
        }

        const { subjectId, subjectName, shortcut } = body;

        let result;
        let newId = subjectId;

        if (subjectId) {
            // Update
            await db.updateTable('subjects')
                .set({
                    label: subjectName,
                    shortcut: shortcut
                })
                .where('subject_id', '=', subjectId)
                .executeTakeFirst();
        } else {
            // Create
            result = await db.insertInto('subjects')
                .values({
                    label: subjectName,
                    shortcut: shortcut,
                    school_id: user.school_id as number,
                    is_main: true, // Default value
                    primary_hours: '' // Default value
                })
                .executeTakeFirst();
            
            if (result.insertId) {
                newId = Number(result.insertId);
            }
        }

        return Response.json({ success: true, subjectId: newId });

    }, {
        body: t.Object({
            subjectId: t.Optional(t.Nullable(t.Number())),
            subjectName: t.String(),
            shortcut: t.String()
        })
    })

    // GET /system/subject_teachers - Get teachers for a subject
    .get('/system/subject_teachers', async ({ user, query }) => {
        if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
        if (user.manager === -1 && !user.is_principal && user.role !== 'admin_staff') {
            return Response.json({ error: 'no_permission' }, { status: 403 });
        }

        const teachers = await db.selectFrom('teachers_subject')
            .leftJoin('persons', 'persons.person_id', 'teachers_subject.teacher_id')
            .leftJoin('teachers', 'teachers.person_id', 'teachers_subject.teacher_id')
            .select([
                'teachers_subject.teacher_id',
                'persons.first_name',
                'persons.last_name'
            ])
            .where('teachers_subject.subject_id', '=', query.subjectId)
            .where('teachers.school_id', '=', user.school_id)
            .execute();

        const peopleNames = await format_person_map_by_ids(teachers.map((teacher) => (teacher.teacher_id)));

        // Use helper to format name consistently if needed, or just return first/last
        const formatted = teachers.map(t => ({
            teacherId: t.teacher_id,
            firstName: t.first_name,
            lastName: t.last_name,
            fullName: peopleNames.get(t.teacher_id) // Basic formatting
        }));

        return Response.json(formatted);
    }, {
        query: t.Object({
            subjectId: t.Numeric()
        })
    })

    // POST /system/subject_teachers/add
    .post('/system/subject_teachers/add', async ({ user, body }) => {
        if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
        if (user.manager === -1 && !user.is_principal && user.role !== 'admin_staff') {
            return Response.json({ error: 'no_permission' }, { status: 403 });
        }

        // Verify teacher belongs to current school
        const teacherUser = await db.selectFrom('teachers')
            .select('teachers.person_id')
            .where('teachers.person_id', '=', body.teacherId)
            .where('teachers.school_id', '=', user.school_id)
            .executeTakeFirst();
        
        if (!teacherUser) {
            return Response.json({ error: 'invalid_teacher', message: 'Teacher not found in your school' }, { status: 400 });
        }

        // Check if already exists
        const exists = await db.selectFrom('teachers_subject')
            .select('teacher_id')
            .where('subject_id', '=', body.subjectId)
            .where('teacher_id', '=', body.teacherId)
            .executeTakeFirst();

        if (exists) {
            return Response.json({ success: true, message: 'already_exists' });
        }

        await db.insertInto('teachers_subject')
            .values({
                subject_id: body.subjectId,
                teacher_id: body.teacherId
            })
            .execute();

        return Response.json({ success: true });
    }, {
        body: t.Object({
            subjectId: t.Numeric(),
            teacherId: t.Numeric()
        })
    })

    // POST /system/subject_teachers/remove
    .post('/system/subject_teachers/remove', async ({ user, body }) => {
        if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
        if (user.manager === -1 && !user.is_principal && user.role !== 'admin_staff') {
            return Response.json({ error: 'no_permission' }, { status: 403 });
        }

        // Verify teacher belongs to current school
        const teacherUser = await db.selectFrom('teachers')
            .select('teachers.person_id')
            .where('teachers.person_id', '=', body.teacherId)
            .where('teachers.school_id', '=', user.school_id)
            .executeTakeFirst();
        
        if (!teacherUser) {
            return Response.json({ error: 'invalid_teacher', message: 'Teacher not found in your school' }, { status: 400 });
        }

        await db.deleteFrom('teachers_subject')
            .where('subject_id', '=', body.subjectId)
            .where('teacher_id', '=', body.teacherId)
            .execute();

        return Response.json({ success: true });
    }, {
        body: t.Object({
            subjectId: t.Numeric(),
            teacherId: t.Numeric()
        })
    });

export default app;
