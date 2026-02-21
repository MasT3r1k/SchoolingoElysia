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
            .select(['tokens.user_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const years = await db
            .selectFrom('school_years')
            .selectAll()
            .orderBy('start', 'desc')
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
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .leftJoin('students', 'students.person_id', 'users.person_id')
            .select(['tokens.user_id', 'users.person_id', 'students.person_id'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const yearId = parseInt(params.yearId);

        // Get semester grades for the year
        const grades = await db
            .selectFrom('semester_grades')
            .leftJoin('subjects', 'subjects.subject_id', 'semester_grades.subject_id')
            .select([
                'semester_grades.s_g_id',
                'semester_grades.subject_id',
                'subjects.label as subjectName',
                'semester_grades.grade',
                'semester_grades.semester',
                'semester_grades.year'
            ])
            .where('semester_grades.student_id', '=', auth.person_id || 0)
            .where('semester_grades.year', '=', yearId)
            .orderBy('subjects.label', 'asc')
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
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value as string)
            .where('tokens.expires', '>=', new Date())
            .executeTakeFirst();

        if (!auth) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const yearId = parseInt(params.yearId);

        // Get classbook entries for the year
        const entries = await db
            .selectFrom('classbook')
            .leftJoin('subjects', 'subjects.subject_id', 'classbook.subject_id')
            .leftJoin('groups', 'groups.group_id', 'classbook.group_id')
            .select([
                'classbook.classbook_id',
                'classbook.date',
                'classbook.day_hour',
                'subjects.label as subjectName'
            ])
            .where('groups.year_id', '=', yearId)
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
            .leftJoin('users', 'users.user_id', 'tokens.user_id')
            .select(['tokens.user_id', 'users.manager'])
            .where('tokens.token', '=', token.value as string)
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
            .leftJoin('users', 'users.user_id', 'auditlog.user_id')
            .leftJoin('persons', 'persons.person_id', 'users.person_id')
            .select([
                'auditlog.audit_id',
                'auditlog.type',
                'auditlog.data',
                'auditlog.ip',
                'auditlog.created',
                db.fn('concat', ['persons.first_name', db.val(' '), 'persons.last_name']).as('userName')
            ])
            .orderBy('auditlog.created', 'desc')
            .offset(offset)
            .limit(limit)
            .execute();

        const total = await db
            .selectFrom('auditlog')
            .select(db.fn.count('audit_id').as('count'))
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
