import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value as string)
  }))
  // POST /system/update_school - Aktualizace nastavení školy
  .post('/system/update_school', async ({ user, body }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.is_principal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { 
      name, shortcut, district, lesson_start, lesson_length, break_time, warn_absence, fastlogin, resetPasswordWithEmail, country, red_izo, ico, school_type, izo, 
      modules,
      gdpr_firstname, gdpr_lastname, gdpr_phone, gdpr_email, gdpr_mobile, gdpr_databox, gdpr_web
    } = body;

    // Parse lesson_start (HH:MM) to hours and minutes
    const [startHour, startMinute] = lesson_start.split(':').map(Number);

    // Find district ID
    let districtId: number | null = null;
    if (district) {
      const districtRow = await db.selectFrom('districts')
        .select('district_id')
        .where('district', '=', district)
        .executeTakeFirst();
      districtId = districtRow?.district_id ?? null;
    }

    // Update school
    await db.updateTable('schools')
      .set({
        name,
        short_name: shortcut,
        district_id: districtId ?? undefined,
        country_id: country,
        red_izo,
        ico,
        school_type,
        izo,
        modules,
        start_hour: startHour || 8,
        start_minute: startMinute || 0,
        lesson_hour: lesson_length,
        break_time: break_time,
        warning_absence_percent: warn_absence,
        fastlogin: fastlogin,
        reset_password_with_email: resetPasswordWithEmail,
        gdpr_first_name: gdpr_firstname || '',
        gdpr_last_name: gdpr_lastname || '',
        gdpr_phone: gdpr_phone || '',
        gdpr_email: gdpr_email || '',
        gdpr_mobile: gdpr_mobile || '',
        gdpr_databox: gdpr_databox || '',
        gdpr_web: gdpr_web || ''
      })
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
      name: t.String(),
      shortcut: t.String(),
      district: t.Optional(t.String()),
      country: t.Union([t.Number(), t.Null()]),
      red_izo: t.String(),
      ico: t.String(),
      school_type: t.String(),
      izo: t.String(),
      lesson_start: t.String(),
      lesson_length: t.Number(),
      break_time: t.Number(),
      warn_absence: t.Number(),
      fastlogin: t.Boolean(),
      resetPasswordWithEmail: t.Boolean(),
      modules: t.String(),
      gdpr_firstname: t.Optional(t.Nullable(t.String())),
      gdpr_lastname: t.Optional(t.Nullable(t.String())),
      gdpr_phone: t.Optional(t.Nullable(t.String())),
      gdpr_email: t.Optional(t.Nullable(t.String())),
      gdpr_mobile: t.Optional(t.Nullable(t.String())),
      gdpr_databox: t.Optional(t.Nullable(t.String())),
      gdpr_web: t.Optional(t.Nullable(t.String()))
    })
  });

export default app;
