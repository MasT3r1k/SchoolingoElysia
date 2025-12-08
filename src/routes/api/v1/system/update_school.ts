import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value)
  }))
  // POST /system/update_school - Aktualizace nastavení školy
  .post('/system/update_school', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { name, shortcut, district, lesson_start, lesson_length, break_time, warn_absence, fastlogin, resetPasswordWithEmail } = body;

    // Parse lesson_start (HH:MM) to hours and minutes
    const [startHour, startMinute] = lesson_start.split(':').map(Number);

    // Find district ID
    let districtId: number | null = null;
    if (district) {
      const districtRow = await db.selectFrom('districts')
        .select('districtId')
        .where('district', '=', district)
        .executeTakeFirst();
      districtId = districtRow?.districtId ?? null;
    }

    // Update school
    await db.updateTable('schools')
      .set({
        name,
        shortName: shortcut,
        district: districtId ?? undefined,
        startHour,
        startMinute: startMinute || 0,
        lessonHour: lesson_length,
        breakTime: break_time,
        warningAbsencePercent: warn_absence,
        fastlogin: fastlogin,
        resetPasswordWithEmail: resetPasswordWithEmail
      })
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
      name: t.String(),
      shortcut: t.String(),
      district: t.Optional(t.String()),
      lesson_start: t.String(),
      lesson_length: t.Number(),
      break_time: t.Number(),
      warn_absence: t.Number(),
      fastlogin: t.Boolean(),
      resetPasswordWithEmail: t.Boolean()
    })
  });

export default app;
