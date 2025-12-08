/**
 * System Archive API Endpoints
 * View historical/archived data
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
    // Get archived school years
    .get('/years', async ({ cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .select(['tokens.userId'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const years = await db
            .selectFrom('school_years')
            .selectAll()
            .orderBy('start_date', 'desc')
            .execute();

        return Response.json({ years });
    })

    // Get archived grades for a school year
    .get('/grades/:yearId', async ({ params, query, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .leftJoin('students', 'students.person', 'users.person')
            .select(['tokens.userId', 'users.person', 'students.student'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const yearId = parseInt(params.yearId);

        // Get semester grades for the year
        const grades = await db
            .selectFrom('semester_grades')
            .leftJoin('subjects', 'subjects.subject_id', 'semester_grades.subject')
            .select([
                'semester_grades.semester_grade_id',
                'semester_grades.subject',
                'subjects.name as subjectName',
                'semester_grades.grade',
                'semester_grades.semester',
                'semester_grades.year'
            ])
            .where('semester_grades.student', '=', auth.student || 0)
            .where('semester_grades.year', '=', yearId)
            .orderBy('subjects.name', 'asc')
            .execute();

        return Response.json({ grades });
    }, {
        params: t.Object({ yearId: t.String() })
    })

    // Get archived classbooks
    .get('/classbook/:yearId', async ({ params, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.manager'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const yearId = parseInt(params.yearId);

        // Get classbook entries for the year
        const entries = await db
            .selectFrom('classbook')
            .leftJoin('classes', 'classes.class', 'classbook.class')
            .leftJoin('subjects', 'subjects.subject_id', 'classbook.subject')
            .select([
                'classbook.classbook_id',
                'classbook.date',
                'classbook.hour',
                'classes.name as className',
                'subjects.name as subjectName',
                'classbook.content',
                'classbook.note'
            ])
            .where('classbook.year', '=', yearId)
            .orderBy('classbook.date', 'desc')
            .limit(100)
            .execute();

        return Response.json({ entries });
    }, {
        params: t.Object({ yearId: t.String() })
    })

    // Get audit log (admin only)
    .get('/auditlog', async ({ query, cookie: { token } }) => {
        if (!token?.value) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const auth = await db
            .selectFrom('tokens')
            .leftJoin('users', 'users.userId', 'tokens.userId')
            .select(['tokens.userId', 'users.manager'])
            .where('tokens.token', '=', token.value)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        const offset = (page - 1) * limit;

        const logs = await db
            .selectFrom('auditlog')
            .leftJoin('users', 'users.userId', 'auditlog.userId')
            .leftJoin('persons', 'persons.person', 'users.person')
            .select([
                'auditlog.auditId',
                'auditlog.type',
                'auditlog.data',
                'auditlog.ip',
                'auditlog.created',
                db.fn('concat', ['persons.firstname', db.val(' '), 'persons.lastname']).as('userName')
            ])
            .orderBy('auditlog.created', 'desc')
            .offset(offset)
            .limit(limit)
            .execute();

        const total = await db
            .selectFrom('auditlog')
            .select(db.fn.count('auditId').as('count'))
            .executeTakeFirst();

        return Response.json({
            logs,
            pagination: {
                page,
                limit,
                total: Number(total?.count || 0)
            }
        });
    });

export default app;
