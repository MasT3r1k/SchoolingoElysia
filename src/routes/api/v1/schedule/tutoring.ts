/**
 * Tutoring API Endpoints
 * Manage tutoring sessions (doučování)
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia({ prefix: '/schedule' })
    // List available tutoring sessions
    .get('/tutoring', async ({ user, school }: any) => {
        if (!user || !school) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let query = db
            .selectFrom('tutoring_sessions')
            .leftJoin('subjects', 'subjects.subject_id', 'tutoring_sessions.subject_id')
            .leftJoin('persons', 'persons.person_id', 'tutoring_sessions.teacher_id')
            .leftJoin('classes', 'classes.class_id', 'tutoring_sessions.class_id')
            .leftJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'tutoring_sessions.room_id')
            .select([
                'tutoring_sessions.session_id as sessionId',
                'tutoring_sessions.title',
                'tutoring_sessions.description',
                'tutoring_sessions.date',
                'tutoring_sessions.room_id as roomId',
                'building_rooms.name as roomName',
                'tutoring_sessions.max_students as maxStudents',
                'tutoring_sessions.class_id as classId',
                sql<string>`CASE WHEN classes.class_id IS NOT NULL THEN concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix) ELSE NULL END`.as('classLabel'),
                'subjects.label as subject',
                sql<string>`CONCAT(persons.first_name, ' ', persons.last_name)`.as('teacher'),
                (eb) => eb.selectFrom('tutoring_signups')
                    .select(eb.fn.countAll<number>().as('count'))
                    .whereRef('tutoring_signups.session_id', '=', 'tutoring_sessions.session_id')
                    .as('signedUpCount'),
                (eb) => eb.selectFrom('tutoring_signups')
                    .select('signup_id')
                    .whereRef('tutoring_signups.session_id', '=', 'tutoring_sessions.session_id')
                    .where('student_id', '=', user.person_id || 0)
                    .as('isSignedUp')
            ])
            .where('tutoring_sessions.school_id', '=', school.school_id)
            .where('tutoring_sessions.date', '>=', today)
            .orderBy('tutoring_sessions.date', 'asc');

        // If student, filter by class or public sessions (class_id is null)
        if (user.role === 'student') {
            const student = await db.selectFrom('students')
                .select('class_id')
                .where('person_id', '=', user.person_id!)
                .executeTakeFirst();
            
            if (student) {
                query = query.where(eb => eb.or([
                    eb('tutoring_sessions.class_id', '=', student.class_id),
                    eb('tutoring_sessions.class_id', 'is', null)
                ]));
            }
        }

        const sessions = await query.execute();

        return Response.json({ sessions });
    })

    // Create tutoring session (teacher only)
    .post('/tutoring', async ({ body, user, school }: any) => {
        if (!user || !school) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        if (user.role != "teacher" && user.role != "admin_staff") {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const { subjectId, classId, title, description, date, maxStudents, roomId } = body;

        // Verify room capacity if roomId is provided
        if (roomId) {
            const room = await db.selectFrom('building_rooms')
                .select('capacity')
                .where('room_id', '=', roomId)
                .executeTakeFirst();
            
            if (room && maxStudents && maxStudents > room.capacity) {
                return Response.json({ error: `Kapacita místnosti je pouze ${room.capacity} studentů.` }, { status: 400 });
            }
        }

        const result = await db.insertInto('tutoring_sessions')
            .values({
                school_id: school.school_id,
                teacher_id: user.person_id!,
                subject_id: subjectId || null,
                class_id: classId || null,
                title,
                description: description || null,
                date: new Date(date),
                room_id: roomId || null,
                max_students: maxStudents || 10
            })
            .executeTakeFirst();

        return Response.json({ sessionId: Number(result.insertId), success: true });
    }, {
        body: t.Object({
            subjectId: t.Optional(t.Number()),
            classId: t.Optional(t.Number()),
            title: t.String(),
            description: t.Optional(t.String()),
            date: t.String(),
            maxStudents: t.Optional(t.Number()),
            roomId: t.Optional(t.Number())
        })
    })

    // Sign up for session (student only)
    .post('/tutoring/:id/signup', async ({ params, user }: any) => {
        if (!user || user.role !== 'student') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const sessionId = parseInt(params.id);

        // Check if session exists and has space
        const session = await db.selectFrom('tutoring_sessions')
            .select(['max_students', 'class_id'])
            .where('session_id', '=', sessionId)
            .executeTakeFirst();

        if (!session) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        // Check class if restricted
        if (session.class_id) {
            const student = await db.selectFrom('students')
                .select('class_id')
                .where('person_id', '=', user.person_id!)
                .executeTakeFirst();
            if (!student || student.class_id !== session.class_id) {
                return Response.json({ error: 'Not eligible for this class' }, { status: 403 });
            }
        }

        // Check capacity
        const countResult = await db.selectFrom('tutoring_signups')
            .select(eb => eb.fn.countAll<number>().as('count'))
            .where('session_id', '=', sessionId)
            .executeTakeFirst();
        
        const count = Number(countResult?.count || 0);
        if (session.max_students && count >= session.max_students) {
            return Response.json({ error: 'Session is full' }, { status: 400 });
        }

        // Sign up
        try {
            await db.insertInto('tutoring_signups')
                .values({
                    session_id: sessionId,
                    student_id: user.person_id!
                })
                .execute();
            return Response.json({ success: true });
        } catch (e) {
            return Response.json({ error: 'Already signed up' }, { status: 400 });
        }
    }, {
        params: t.Object({ id: t.String() })
    })

    // Sign out from session
    .delete('/tutoring/:id/signup', async ({ params, user }: any) => {
        if (!user || user.role !== 'student') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const sessionId = parseInt(params.id);

        await db.deleteFrom('tutoring_signups')
            .where('session_id', '=', sessionId)
            .where('student_id', '=', user.person_id!)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() })
    })

    // Cancel tutoring session
    .delete('/tutoring/:id', async ({ params, user }: any) => {
        if (!user || (user.role !== 'teacher' && user.role !== 'admin_staff')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const sessionId = parseInt(params.id);

        // Verify ownership (if teacher)
        if (user.role === 'teacher') {
            const session = await db
                .selectFrom('tutoring_sessions')
                .select(['teacher_id'])
                .where('session_id', '=', sessionId)
                .executeTakeFirst();

            if (!session || session.teacher_id !== user.person_id) {
                return Response.json({ error: 'forbidden' }, { status: 403 });
            }
        }

        // Delete signups first
        await db.deleteFrom('tutoring_signups')
            .where('session_id', '=', sessionId)
            .execute();

        await db
            .deleteFrom('tutoring_sessions')
            .where('session_id', '=', sessionId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({ id: t.String() })
    });

export default app;
