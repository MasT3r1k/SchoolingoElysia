import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../../src/utils/auth';

const elysiaApp = new Elysia()
  .get('/school/years', async ({ cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const years = await db.selectFrom('school_years')
      .select(['sy_id', 'start', 'end', 'midterm', 'current'])
      .orderBy('start', 'desc')
      .execute();

    return Response.json(years);
  })
  .post('/school/years', async ({ body, cookie, school }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });
    // TODO: Add permission check for admin

    const { start, end, midterm, current } = body as any;

    const result = await db.insertInto('school_years')
        .values({
          school_id: school.school_id,
          start: new Date(start),
          end: new Date(end),
          midterm: new Date(midterm),
          current: !!current
        })
        .execute();

    return Response.json({ success: true });
  })
  .put('/school/years/:id', async ({ params: { id }, body, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const { start, end, midterm, current } = body as any;

    if (current) {
        // Unset other currents if this one is set to current
        await db.updateTable('school_years')
            .set({ current: false })
            .where('sy_id', '!=', parseInt(id))
            .execute();
    }

    await db.updateTable('school_years')
        .set({
            start: new Date(start),
            end: new Date(end),
            midterm: new Date(midterm),
            current: !!current
        })
        .where('sy_id', '=', parseInt(id))
        .execute();

    return Response.json({ success: true });
  })
  .delete('/school/years/:id', async ({ params: { id }, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    await db.deleteFrom('school_years')
        .where('sy_id', '=', parseInt(id))
        .execute();

    return Response.json({ success: true });
  });

export default elysiaApp;
