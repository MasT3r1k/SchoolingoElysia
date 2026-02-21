import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/system', async ({ user, school }: any) => {
    if (!user) return { error: 'no_user', details: 'no_cookie' };
    if (!school) return { error: 'no_school', details: 'school_not_found' };

    const auth = user; // Alias for compatibility with existing variable usage if needed, or refactor usages.
    // user object from auth.ts: { userId, person, username, locale, isPrincipal, manager, role, school }
    // existing auth var had: tokens.token_id, tokens.user_id, users.person_id, users.manager, users.principal, users.school

    if (!auth.person_id) return { error: 'no_user', details: 'no_db' };
    if (auth.manager != -1 && !auth.isPrincipal) return { error: 'no_permission' };



    const school_advanced_info = await db.selectFrom('schools')
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
        'schools.modules'
    ])
    .where('schools.school_id', '=', auth.school_id)
    .limit(1)
    .executeTakeFirst();

    const districts = await db.selectFrom('districts')
    .select([
        'districts.district_id',
        'districts.district'
    ])
    .orderBy('district', 'asc')
    .execute();

    const student_count = await db.selectFrom('students')
        .innerJoin('users', 'users.person_id', 'students.person_id')
        .select(sql`COUNT(*)`.as('count'))
        .where('students.status', '=', 'active')
        .where('users.school_id', '=', auth.school_id)
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0));

    if (!school_advanced_info) return { error: 'invalid_school' };

    const subjects = await db.selectFrom('subjects')
    .select([
        'subjects.subject_id',
        'subjects.label as subject_name',
        'subjects.shortcut'
    ])
    .orderBy('subject_name', 'asc')
    .execute();

    const scopes = await db.selectFrom('scopes')
    .select([
        'scopes.scope_id',
        'scopes.name',
        'scopes.code',
        'scopes.shortcut',
        'scopes.years',
        'scopes.number_of_classes',
        'scopes.students_per_class'
    ])
    .orderBy('scopes.name', 'asc')
    .execute();

    const domains = await db.selectFrom('school_domains')
    .select(['domain', 'domain_id'])
    .where('school_id', '=', auth.school_id)
    .execute();

    return {
        settings: { ...school_advanced_info, domains },
        districts,
        student_count,
        subjects,
        scopes
    };
  });

export default app;
