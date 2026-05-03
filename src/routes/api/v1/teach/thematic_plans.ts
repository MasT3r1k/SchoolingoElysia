import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../../src/utils/auth';

const elysiaApp = new Elysia()
  .get('/teach/thematic-plans', async ({ cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth || auth.type !== 'teacher') return new Response('Unauthorized', { status: 401 });

    const plans = await db.selectFrom('thematic_plans')
        .leftJoin('subjects', 'subjects.subject_id', 'thematic_plans.subject_id')
        .leftJoin('groups', 'groups.group_id', 'thematic_plans.group_id')
        .leftJoin('classes', 'classes.class_id', 'groups.class_id')
        .select([
            'thematic_plans.thematic_plan_id',
            'thematic_plans.name',
            'thematic_plans.subject_id',
            'subjects.label as subject_name',
            'thematic_plans.group_id',
            'classes.prefix',
            'classes.suffix'
        ])
        .where('teacher_id', '=', auth.user_id)
        .execute();

    return Response.json(plans);
  })
  .post('/teach/thematic-plans', async ({ body, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth || auth.type !== 'teacher') return new Response('Unauthorized', { status: 401 });

    const { name, subject_id, group_id, school_year_id, svp_subject_id } = body as any;

    const result = await db.insertInto('thematic_plans')
        .values({
            teacher_id: auth.user_id,
            name,
            subject_id,
            group_id,
            school_year_id,
            svp_subject_id: svp_subject_id || null
        })
        .execute();

    return Response.json({ success: true, thematic_plan_id: Number(result[0].insertId) });
  })
  .get('/teach/thematic-plans/:id', async ({ params: { id }, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const plan = await db.selectFrom('thematic_plans')
        .selectAll()
        .where('thematic_plan_id', '=', parseInt(id))
        .executeTakeFirst();

    if (!plan) return new Response('Not Found', { status: 404 });

    const items = await db.selectFrom('thematic_plan_items')
        .selectAll()
        .where('thematic_plan_id', '=', parseInt(id))
        .orderBy('item_order', 'asc')
        .execute();

    return Response.json({ ...plan, items });
  })
  .post('/teach/thematic-plans/:id/items', async ({ params: { id }, body, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const items = body as any[];

    // Delete old items and insert new ones (simple approach for now)
    await db.deleteFrom('thematic_plan_items')
        .where('thematic_plan_id', '=', parseInt(id))
        .execute();

    if (items.length > 0) {
        await db.insertInto('thematic_plan_items')
            .values(items.map((item, index) => ({
                thematic_plan_id: parseInt(id),
                item_order: index + 1,
                topic: item.topic,
                description: item.description || null,
                estimated_date: item.estimated_date ? new Date(item.estimated_date) : null,
                period: item.period || null
            })))
            .execute();
    }

    return Response.json({ success: true });
  })
  .get('/teach/thematic-plans/suggestions', async ({ query, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const { groupId, subjectId, date } = query as any;

    let queryBuilder = db.selectFrom('thematic_plan_items')
        .innerJoin('thematic_plans', 'thematic_plans.thematic_plan_id', 'thematic_plan_items.thematic_plan_id')
        .select([
            'thematic_plan_items.topic',
            'thematic_plan_items.description',
            'thematic_plan_items.period'
        ])
        .where('thematic_plans.group_id', '=', parseInt(groupId))
        .where('thematic_plans.subject_id', '=', parseInt(subjectId))
        .where('thematic_plans.teacher_id', '=', auth.user_id)
        .orderBy('thematic_plan_items.item_order', 'asc');

    if (date) {
        const lessonDate = new Date(date);
        const year = await db.selectFrom('school_years')
            .select('sy_id')
            .where('start', '<=', lessonDate)
            .where('end', '>=', lessonDate)
            .executeTakeFirst();
        
        if (year) {
            queryBuilder = queryBuilder.where('thematic_plans.school_year_id', '=', year.sy_id);
        }
    }

    const items = await queryBuilder.execute();

    return Response.json(items);
  });

export default elysiaApp;
