import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';

const elysiaApp = new Elysia({ prefix: '/schedule' })
  .get('/template_subjects', async ({ cookie }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user' };

    // Check permissions (assume only admin/scheduler can access)
    // For now assuming basic auth check passes if token is valid
    // In real implementation, check role

    const subjects = await db.selectFrom('subjects')
      .select(['subject_id', 'label', 'shortcut', 'is_main', 'primary_hours'])
      .orderBy('label', 'asc')
      .execute();
      
    // Format response if needed
    // primaryHours stored as string "1,2,3" -> array [1,2,3]
    return subjects.map(s => ({
      ...s,
      primaryHours: s.primary_hours ? s.primary_hours.split(',').map(Number) : []
    }));
  })

  .put('/template_subjects/:id', async ({ cookie, params, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user' };

    // Update subject 
    const { id } = params;
    const { isMain, primaryHours } = body as { isMain: boolean, primaryHours: number[] };

    await db.updateTable('subjects')
      .set({
        is_main: isMain,
        primary_hours: primaryHours.join(',')
      })
      .where('subject_id', '=', Number(id))
      .execute();

    return { success: true };
  });

export default elysiaApp;
