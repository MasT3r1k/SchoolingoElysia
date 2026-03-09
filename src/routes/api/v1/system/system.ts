import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';


const app = new Elysia()
  // GET /system - Načtení všech systémových nastavení
  .get('/system', async ({ cookie, school }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SYSTEM_STATUS);
    if (!perm) return { error: 'no_permission' };
    if (!school) return Response.json({ error: 'no_school' }, { status: 404 });

    const schoolId = school.school_id;

    const [school_info, districts, student_count, subjects, scopes, ldap_config, email_config, countries, domains, evaluation_templates] = await Promise.all([
      // School settings
      db.selectFrom('schools')
        .leftJoin('districts', 'districts.district_id', 'schools.district_id')
        .select([
          'schools.name',
          'schools.short_name',
          'schools.code',
          'districts.district',
          'schools.start_hour',
          'schools.start_minute',
          'schools.lesson_hour',
          'schools.break_time',
          'schools.warning_absence_percent',
          'schools.reset_password_with_email',
          'schools.fastlogin',
          'schools.license_type',
          'schools.license_until',
          'schools.students_limit',
          'schools.modules',
          // Auth Settings
          'schools.auth_classic',
          'schools.auth_ldap',
          'schools.auth_passkeys',
          'schools.session_lifetime_minutes',
          'schools.max_login_attempts',
          'schools.backup_interval',
          'schools.auto_update',
          'schools.auto_update_interval',
          'schools.country_id',
          'schools.red_izo',
          'schools.ico',
          'schools.school_type',
          'schools.izo',
          'schools.gdpr_first_name',
          'schools.gdpr_last_name',
          'schools.gdpr_phone',
          'schools.gdpr_email',
          'schools.gdpr_mobile',
          'schools.gdpr_mobile',
          'schools.gdpr_databox',
          'schools.gdpr_web',
          'schools.msg_max_length',
          'schools.msg_attachments_max_count',
          'schools.msg_attachments_max_size',
          'schools.msg_type_private_active',
          'schools.msg_type_official_active',
          'schools.msg_type_noticeboard_active',
          'schools.noticeboard_max_length',
          'schools.employee_vacation_days_default',
          'schools.employee_vacation_requests_enabled',
          'schools.employee_attendance_enabled',
          'schools.employee_salaries_enabled',
        ])
        .where('schools.school_id', '=', schoolId)
        .limit(1)
        .executeTakeFirst(),

      // Districts
      db.selectFrom('districts')
        .select(['districts.district_id', 'districts.district'])
        .orderBy('district', 'asc')
        .execute(),

      // Student count
      db.selectFrom('students')
        .leftJoin('users', 'users.person_id', 'students.person_id')
        .leftJoin('classes', 'classes.class_id', 'students.class_id')
        .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
        .select(sql`COUNT(*)`.as('count'))
        .where('students.status', '=', 'active')
        .where('scopes.school_id', '=', schoolId)
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0)),

      // Subjects
      db.selectFrom('subjects')
        .select([
          'subjects.subject_id',
          'subjects.label as subject_name',
          'subjects.shortcut'
        ])
        .orderBy('subject_name', 'asc')
        .where('subjects.school_id', '=', schoolId)
        .execute(),

      // Scopes
      db.selectFrom('scopes')
        .select([
          'scopes.scope_id',
          'scopes.name',
          'scopes.code',
          'scopes.shortcut',
          'scopes.years',
          'scopes.number_of_classes',
          'scopes.students_per_class'
        ])
        .where('scopes.school_id', '=', schoolId)
        .orderBy('scopes.name', 'asc')
        .execute(),

      // LDAP Config
      db.selectFrom('ldap_config')
        .selectAll()
        .where('school_id', '=', schoolId)
        .limit(1)
        .executeTakeFirst(),

      // Email Config
      db.selectFrom('email_config')
        .selectAll()
        .where('school_id', '=', schoolId)
        .limit(1)
        .executeTakeFirst(),
      
      // Countries
      db.selectFrom('countries')
        .select(['country_id', 'nationality', 'code2'])
        .orderBy('nationality', 'asc')
        .execute(),
      // School Domains
      db.selectFrom('school_domains')
        .select(['domain_id', 'domain'])
        .where('school_id', '=', schoolId)
        .execute(),
      // Evaluation Templates
      db.selectFrom('school_evaluation_templates')
        .selectAll()
        .where('school_id', '=', schoolId)
        .execute()
    ]);

    if (!school_info) {
      return Response.json({ error: 'invalid_school' }, { status: 500 });
    }

    return Response.json({
      settings: school_info,
      ldap_config: ldap_config || null,
      email_config: email_config || null,
      districts,
      countries: countries,
      student_count,
      subjects,
      scopes,
      domains: domains || [],
      evaluation_templates: evaluation_templates || [],
      communication_permissions: await db.selectFrom('role_communication_permissions').selectAll().execute()
    });
  })

  // GET /system/scope - Načtení předmětů pro konkrétní obor
  .get('/system/scope', async ({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.SYSTEM_STATUS);
    if (!perm) return { error: 'no_permission' };

    if (query.scope_id === undefined) {
      return Response.json({ error: 'invalid_query' }, { status: 400 });
    }

    const scopes_subjects = await db.selectFrom('scopes_subjects')
      .select([
        'scopes_subjects.ss_id',
        'scopes_subjects.subject_id',
        'scopes_subjects.year',
        'scopes_subjects.hours_per_week'
      ])
      .where('scopes_subjects.scope_id', '=', query.scope_id)
      .execute();

    return Response.json(scopes_subjects);
  }, {
    query: t.Object({
      scope_id: t.Optional(t.Number())
    })
  });

export default app;
