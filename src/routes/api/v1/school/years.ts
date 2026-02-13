import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../../src/utils/auth';

const elysiaApp = new Elysia()
  .get('/school/years', async ({ cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    const years = await db.selectFrom('school_years')
      .select(['syId', 'start', 'end', 'midterm', 'current'])
      .orderBy('start', 'desc')
      .execute();

    return Response.json(years);
  })
  .post('/school/years', async ({ body, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });
    // TODO: Add permission check for admin

    const { start, end, midterm, current } = body as any;

    const result = await db.insertInto('school_years')
        .values({
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
            .where('syId', '!=', parseInt(id))
            .execute();
    }

    await db.updateTable('school_years')
        .set({
            start: new Date(start),
            end: new Date(end),
            midterm: new Date(midterm),
            current: !!current
        })
        .where('syId', '=', parseInt(id))
        .execute();

    return Response.json({ success: true });
  })
  .delete('/school/years/:id', async ({ params: { id }, cookie }) => {
    const auth = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!auth) return new Response('Unauthorized', { status: 401 });

    await db.deleteFrom('school_years')
        .where('syId', '=', parseInt(id))
        .execute();

    return Response.json({ success: true });
  });

export default elysiaApp;
