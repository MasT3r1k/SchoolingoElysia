/**
 * Education Measures API Endpoints
 * Manage student educational measures (praise, reprimand, warnings, etc.)
 */
import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { validateBody, createEducationMeasureSchema } from '../../../../utils/validation.schemas';
import { MainConfig } from '../../../../config/main.config';
import { sql } from 'kysely';
import moment from 'moment';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
    // Get education measure behaviour grade
    .get('/measure/student', async({ query, cookie }) => {
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

        if (!auth?.person_id) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const isTeacher = auth.role === 'teacher' || auth.role === 'admin_staff';
        if (!isTeacher) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const school_year = await db.selectFrom('school_years')
        .select([
            'school_years.start',
            'school_years.end'
        ])
        .where('school_years.start', '<=', moment().toDate())
        .where('school_years.end', '>=', moment().toDate())
        .executeTakeFirst();

        console.log(school_year)
        if (!school_year) return;

        const mark = await db.selectFrom('education_measures')
        .select([
            sql`COUNT(*)`.as('count')
        ])
        .where('education_measures.student_id', '=', query.id)
        .where('education_measures.type', '=', 'reduced_behavior')
        .where('education_measures.issued_at', '>=', school_year.start)
        .where('education_measures.issued_at', '<=', school_year.end)
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0));

        let can_have_another_reduced_behaviour = true;
        if (1 + mark >= MainConfig.MAX_BEHAVE_MARK) {
            can_have_another_reduced_behaviour = false
        }

        return Response.json({ mark: 1 + mark, allow_add: can_have_another_reduced_behaviour });
    }, {
        query: t.Object({
            id: t.Number()
        })
    })

    // List education measures
    .get('/measures', async ({ query, cookie }) => {
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

        if (!auth?.person_id) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const isTeacher = auth.role === 'teacher' || auth.role === 'admin_staff';

        let q = db
            .selectFrom('education_measures') // This table can be used for both rewards and measures
            .select([
                'education_measures.em_id as id',
                'education_measures.student_id',
                'education_measures.type',
                'education_measures.category',
                'education_measures.severity',
                'education_measures.reason',
                'education_measures.description',
                'education_measures.issued_by',
                'education_measures.issued_at',
                'education_measures.informed_parents',
                'education_measures.status'
            ])
            .where('education_measures.type', 'in', ['praise', 'reprimand_classteacher', 'reprimand_principal', 'warning', 'reduced_behavior', 'other']);

        // Students only see their own measures
        if (!isTeacher) {
            q = q.where('education_measures.student_id', '=', auth.person_id);
        }

        // Filter by student if specified
        if (query.studentId && isTeacher) {
            q = q.where('education_measures.student_id', '=', parseInt(query.studentId));
        }

        const measures = await q.orderBy('education_measures.issued_at', 'desc').limit(50).execute();

        const personIds = new Set<number>();
        measures.forEach(m => {
            if (m.student_id) personIds.add(m.student_id);
            if (m.issued_by) personIds.add(m.issued_by);
        });

        const namesMap = await format_person_map_by_ids(Array.from(personIds));

        const measuresWithNames = measures.map(m => ({
            ...m,
            student_name: m.student_id ? namesMap.get(m.student_id) || '' : '',
            issued_by_name: m.issued_by ? namesMap.get(m.issued_by) || '' : ''
        }));

        return Response.json({ measures: measuresWithNames });
    })

    // Create education measure (teacher only)
    .post('/measures', async ({ body, cookie }) => {
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

        if (!auth || (auth.role !== 'teacher' && auth.role !== 'admin_staff')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const validation = validateBody(createEducationMeasureSchema, body);
        if (!validation.success) {
            return Response.json({ error: 'validation_failed', details: validation.errors }, { status: 400 });
        }

        const { studentId, type, reason, date, note } = validation.data;

        const result = await db
            .insertInto('education_measures')
            .values({
                student_id: studentId,
                type: type as any,
                reason,
                description: note || null,
                issued_by: auth.user_id
            })
            .execute();

        return Response.json({ measure_id: Number(result[0].insertId), success: true });
    })

    // Update education measure
    .put('/measures/:id', async ({ params, body, cookie }) => {
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

        if (!auth || (auth.role !== 'teacher' && auth.role !== 'admin_staff')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const measureId = parseInt(params.id);
        const { reason, description } = body;

        await db
            .updateTable('education_measures')
            .set({
                reason,
                description
            })
            .where('em_id', '=', measureId)
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            reason: t.Optional(t.String()),
            description: t.Optional(t.String())
        })
    })

    // Delete education measure
    .delete('/measures/:id', async ({ params, cookie }) => {
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

        if (!auth || (auth.role !== 'admin_staff')) {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('education_measures')
            .where('em_id', '=', parseInt(params.id))
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // List education measure types
    .get('/measure/types', async ({ cookie }) => {
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

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const types = await db
            .selectFrom('education_measures_types')
            .selectAll()
            .orderBy('order_index', 'asc')
            .execute();

        return Response.json({ types });
    })

    // Create education measure type (admin only)
    .post('/measure/types', async ({ body, cookie }) => {
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

        if (auth?.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        const result = await db
            .insertInto('education_measures_types')
            .values({
                shortcut: body.shortcut,
                label_1st: body.label_1st,
                label_4th: body.label_4th,
                order_index: body.order || 0
            })
            .execute();

        return Response.json({ emt_id: Number(result[0].insertId), success: true });
    }, {
        body: t.Object({
            shortcut: t.String(),
            label_1st: t.String(),
            label_4th: t.String(),
            order: t.Optional(t.Number())
        })
    })

    // Delete education measure type (admin only)
    .delete('/measure/types/:id', async ({ params, cookie }) => {
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

        if (auth?.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .deleteFrom('education_measures_types')
            .where('emt_id', '=', parseInt(params.id))
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // Update education measure type (admin only)
    .put('/measure/types/:id', async ({ params, body, cookie }) => {
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

        if (auth?.role !== 'admin_staff') {
            return Response.json({ error: 'forbidden' }, { status: 403 });
        }

        await db
            .updateTable('education_measures_types')
            .set({
                shortcut: body.shortcut,
                label_1st: body.label_1st,
                label_4th: body.label_4th,
                order_index: body.order
            })
            .where('emt_id', '=', parseInt(params.id))
            .execute();

        return Response.json({ success: true });
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            shortcut: t.Optional(t.String()),
            label_1st: t.Optional(t.String()),
            label_4th: t.Optional(t.String()),
            order: t.Optional(t.Number())
        })
    })

    // List education measure types
    .get('/measure/templates', async ({ cookie }) => {
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

        if (!auth) {
            return Response.json({ error: 'unauthorized' }, { status: 401 });
        }

        const types = await db
            .selectFrom('education_measures_templates')
            .selectAll()
            .orderBy('template_id', 'asc')
            .execute();

        return Response.json({ types });
    })

export default app;
