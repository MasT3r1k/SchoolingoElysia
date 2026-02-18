import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .get('/system', async ({ user, school }: any) => {
    if (!user) return { error: 'no_user', details: 'no_cookie' };
    if (!school) return { error: 'no_school', details: 'school_not_found' };

    const auth = user; // Alias for compatibility with existing variable usage if needed, or refactor usages.
    // user object from auth.ts: { userId, person, username, locale, isPrincipal, manager, role, school }
    // existing auth var had: tokens.tokenId, tokens.userId, users.person, users.manager, users.principal, users.school

    if (!auth.person) return { error: 'no_user', details: 'no_db' };
    if (auth.manager != -1 && !auth.isPrincipal) return { error: 'no_permission' };



    const school_advanced_info = await db.selectFrom('schools')
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
        'schools.modules'
    ])
    .where('schools.schoolId', '=', auth.school)
    .limit(1)
    .executeTakeFirst();

    const districts = await db.selectFrom('districts')
    .select([
        'districts.districtId',
        'districts.district'
    ])
    .orderBy('district', 'asc')
    .execute();

    const student_count = await db.selectFrom('students')
        .innerJoin('users', 'users.person', 'students.personId')
        .select(sql`COUNT(*)`.as('count'))
        .where('students.status', '=', 'active')
        .where('users.school', '=', auth.school)
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0));

    if (!school_advanced_info) return { error: 'invalid_school' };

    const subjects = await db.selectFrom('subjects')
    .select([
        'subjects.subjectId',
        'subjects.label as subjectName',
        'subjects.shortcut'
    ])
    .orderBy('subjectName', 'asc')
    .execute();

    const scopes = await db.selectFrom('scopes')
    .select([
        'scopes.scopeId',
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
    .select(['domain', 'domainId'])
    .where('school', '=', auth.school)
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
