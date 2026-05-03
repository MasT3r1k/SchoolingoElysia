import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../../src/utils/auth';

const elysiaApp = new Elysia()
  .get('/school/svp', async ({ cookie, school }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const svps = await db.selectFrom('svp')
      .selectAll()
      .where('school_id', '=', school.school_id)
      .execute();

    return Response.json(svps);
  })
  .post('/school/svp', async ({ body, cookie, school }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const { name, valid_from, valid_to } = body as any;

    const result = await db.insertInto('svp')
      .values({
        school_id: school.school_id,
        name,
        valid_from: new Date(valid_from),
        valid_to: valid_to ? new Date(valid_to) : null
      })
      .execute();

    return Response.json({ success: true, svp_id: Number(result[0].insertId) });
  })
  .get('/school/svp/:id', async ({ params: { id }, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const svp = await db.selectFrom('svp')
      .selectAll()
      .where('svp_id', '=', parseInt(id))
      .executeTakeFirst();

    if (!svp) return new Response('Not Found', { status: 404 });

    const subjects = await db.selectFrom('svp_subjects')
      .leftJoin('subjects', 'subjects.subject_id', 'svp_subjects.subject_id')
      .select([
        'svp_subjects.svp_subject_id',
        'svp_subjects.subject_id',
        'svp_subjects.grade',
        'subjects.label as subject_name'
      ])
      .where('svp_id', '=', parseInt(id))
      .execute();

    const subjectsWithTopics = await Promise.all(subjects.map(async (subject) => {
      const topics = await db.selectFrom('svp_topics')
        .selectAll()
        .where('svp_subject_id', '=', subject.svp_subject_id)
        .execute();
      return { ...subject, topics };
    }));

    return Response.json({ ...svp, subjects: subjectsWithTopics });
  })
  .post('/school/svp/subject', async ({ body, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const { svp_id, subject_id, grade } = body as any;

    await db.insertInto('svp_subjects')
      .values({
        svp_id,
        subject_id,
        grade
      })
      .execute();

    return Response.json({ success: true });
  })
  .post('/school/svp/topic', async ({ body, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const { svp_subject_id, name, description, outcomes, hours_allocated } = body as any;

    await db.insertInto('svp_topics')
      .values({
        svp_subject_id,
        name,
        description,
        outcomes,
        hours_allocated
      })
      .execute();

    return Response.json({ success: true });
  })
  .delete('/school/svp/:id', async ({ params: { id }, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    await db.deleteFrom('svp')
      .where('svp_id', '=', parseInt(id))
      .execute();

    return Response.json({ success: true });
  });

export default elysiaApp;
