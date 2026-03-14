import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  // POST /system/update_school - Aktualizace nastavení školy
  .post('/system/update_school', async ({ cookie, school, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SCHOOL_EDIT);
    if (!perm) return { error: 'no_permission' };
    
    if (!school) return Response.json({ error: 'no_school' }, { status: 404 });

    const {
      name, shortcut, district, lesson_start, lesson_length, break_time, warn_absence, fastlogin, resetPasswordWithEmail, country, red_izo, ico, school_type, izo,
      modules,
      gdpr_firstname, gdpr_lastname, gdpr_phone, gdpr_email, gdpr_mobile, gdpr_databox, gdpr_web,
      msg_max_length, msg_attachments_max_count, msg_attachments_max_size, msg_type_private_active, msg_type_official_active, msg_type_noticeboard_active, noticeboard_max_length,
      employee_vacation_days_default, employee_vacation_requests_enabled, employee_attendance_enabled, employee_salaries_enabled,
      documents_enabled, traineeship_enabled, online_enabled, noticeboard_student_enabled, noticeboard_teacher_enabled, tests_enabled, rewards_enabled, demo_enabled
    } = body;

    // Parse lesson_start (HH:MM) to hours and minutes
    const [startHour, startMinute] = (lesson_start || '00:00').split(':').map(Number);

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
        gdpr_web: gdpr_web || '',
        // Message settings
        msg_max_length: msg_max_length ?? 3000,
        msg_attachments_max_count: msg_attachments_max_count ?? 10,
        msg_attachments_max_size: msg_attachments_max_size ?? 20,
        msg_type_private_active: msg_type_private_active ? 1 : 0,
        msg_type_official_active: msg_type_official_active ? 1 : 0,
        msg_type_noticeboard_active: msg_type_noticeboard_active ? 1 : 0,
        noticeboard_max_length: noticeboard_max_length ?? 5000,
        employee_vacation_days_default: employee_vacation_days_default ?? 25,
        employee_vacation_requests_enabled: employee_vacation_requests_enabled ? 1 : 0,
        employee_attendance_enabled: employee_attendance_enabled ? 1 : 0,
        employee_salaries_enabled: employee_salaries_enabled ? 1 : 0,
        documents_enabled: documents_enabled ? 1 : 0,
        traineeship_enabled: traineeship_enabled ? 1 : 0,
        online_enabled: online_enabled ? 1 : 0,
        noticeboard_student_enabled: noticeboard_student_enabled ? 1 : 0,
        noticeboard_teacher_enabled: noticeboard_teacher_enabled ? 1 : 0,
        tests_enabled: tests_enabled ? 1 : 0,
        rewards_enabled: rewards_enabled ? 1 : 0,
        demo_enabled: demo_enabled ? 1 : 0
      })
      .where('school_id', '=', school.school_id)
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
      gdpr_web: t.Optional(t.Nullable(t.String())),
      // Message settings
      msg_max_length: t.Optional(t.Number()),
      msg_attachments_max_count: t.Optional(t.Number()),
      msg_attachments_max_size: t.Optional(t.Number()),
      msg_type_private_active: t.Optional(t.Boolean()),
      msg_type_official_active: t.Optional(t.Boolean()),
      msg_type_noticeboard_active: t.Optional(t.Boolean()),
      noticeboard_max_length: t.Optional(t.Number()),
      employee_vacation_days_default: t.Optional(t.Number()),
      employee_vacation_requests_enabled: t.Optional(t.Boolean()),
      employee_attendance_enabled: t.Optional(t.Boolean()),
      employee_salaries_enabled: t.Optional(t.Boolean()),
      documents_enabled: t.Optional(t.Boolean()),
      traineeship_enabled: t.Optional(t.Boolean()),
      online_enabled: t.Optional(t.Boolean()),
      noticeboard_student_enabled: t.Optional(t.Boolean()),
      noticeboard_teacher_enabled: t.Optional(t.Boolean()),
      tests_enabled: t.Optional(t.Boolean()),
      rewards_enabled: t.Optional(t.Boolean()),
      demo_enabled: t.Optional(t.Boolean())
    })
  });

export default app;
