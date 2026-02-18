import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  // GET /system - Načtení všech systémových nastavení
  .get('/system', async ({ user, school }: any) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (!school) return Response.json({ error: 'no_school' }, { status: 404 });
    
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const schoolId = school.schoolId;

    const [school_info, districts, student_count, subjects, scopes, ldap_config, email_config, countries, domains] = await Promise.all([
      // School settings
      db.selectFrom('schools')
        .leftJoin('districts', 'districts.districtId', 'schools.district')
        .select([
          'schools.name',
          'schools.shortName',
          'schools.code',
          'districts.district',
          'schools.startHour',
          'schools.startMinute',
          'schools.lessonHour',
          'schools.breakTime',
          'schools.warningAbsencePercent',
          'schools.resetPasswordWithEmail',
          'schools.fastlogin',
          'schools.license_type',
          'schools.license_until',
          'schools.studentsLimit',
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
          'schools.country',
          'schools.red_izo',
          'schools.ico',
          'schools.school_type',
          'schools.izo',
          'schools.gdpr_firstname',
          'schools.gdpr_lastname',
          'schools.gdpr_phone',
          'schools.gdpr_email',
          'schools.gdpr_mobile',
          'schools.gdpr_databox',
          'schools.gdpr_web',
        ])
        .where('schools.schoolId', '=', schoolId)
        .limit(1)
        .executeTakeFirst(),

      // Districts
      db.selectFrom('districts')
        .select(['districts.districtId', 'districts.district'])
        .orderBy('district', 'asc')
        .execute(),

      // Student count
      db.selectFrom('students')
        .innerJoin('users', 'users.person', 'students.personId')
        .select(sql`COUNT(*)`.as('count'))
        .where('students.status', '=', 'active')
        .where('users.school', '=', schoolId)
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0)),

      // Subjects
      db.selectFrom('subjects')
        .select([
          'subjects.subjectId',
          'subjects.label as subjectName',
          'subjects.shortcut'
        ])
        .orderBy('subjectName', 'asc')
        .where('subjects.school_id', '=', schoolId)
        .execute(),

      // Scopes
      db.selectFrom('scopes')
        .select([
          'scopes.scopeId',
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
        .select(['countryId', 'nationality', 'code2'])
        .orderBy('nationality', 'asc')
        .execute(),
      // School Domains
      db.selectFrom('school_domains')
        .select(['domainId', 'domain'])
        .where('school', '=', schoolId)
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
      domains: domains || []
    });
  })

  // GET /system/scope - Načtení předmětů pro konkrétní obor
  .get('/system/scope', async ({ user, query }: any) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

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
