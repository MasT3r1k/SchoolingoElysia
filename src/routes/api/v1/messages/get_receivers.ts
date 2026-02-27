import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .post('/messages/recipients', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select([
        'tokens.user_id',
        'users.person_id',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id || !auth.role) return { error: 'no_user', details: 'no_db' };

    const role = auth.role;

    // 1. Get allowed target roles from role_communication_permissions
    let allowedTargets: string[] = [];
    try {
        const perms = await db.selectFrom('role_communication_permissions')
            .select('role_target')
            .where('role_source', '=', role)
            .execute();
        allowedTargets = perms.map(p => p.role_target);
    } catch (e) {}

    // Fallback if no permissions set
    if (allowedTargets.length === 0) {
        if (['teacher', 'management', 'admin_staff'].includes(role)) {
            allowedTargets = ['teacher', 'student', 'parent', 'management', 'admin_staff', 'personnel'];
        } else {
            allowedTargets = ['teacher', 'management'];
        }
    }

    // --- Message Type Specific Restrictions ---
    if (body.message_type === 3) { // RATESTUDENT
        allowedTargets = allowedTargets.filter(t => ['student', 'parent'].includes(t));
    }

    const result: { group: string, label: string, users: any[] }[] = [];
    const allPersonIds: number[] = [];

    // --- 2. Fetch Users ---

    // A. MANAGEMENT / ADMINISTRATION
    if (allowedTargets.some(r => ['management', 'admin_staff'].includes(r))) {
        const staff = await db.selectFrom('teachers')
            .select(['person_id', 'role'])
            .where('status', '=', 'active')
            .where('role', 'in', ['management', 'admin_staff'])
            .execute();
        
        if (staff.length > 0) {
            const ids = staff.map(s => s.person_id);
            allPersonIds.push(...ids);
            result.push({
                group: 'management',
                label: 'Vedení školy a správa',
                users: staff.map(s => ({ person_id: s.person_id, role: s.role }))
            });
        }
    }

    // B. TEACHERS ALL
    if (allowedTargets.includes('teacher')) {
        const teachers = await db.selectFrom('teachers')
            .select(['person_id', 'role'])
            .where('status', '=', 'active')
            .where('role', '=', 'teacher')
            .execute();
            
        if (teachers.length > 0) {
            const ids = teachers.map(t => t.person_id);
            allPersonIds.push(...ids);
            result.push({
                group: 'teachers_all',
                label: 'Učitelé - všichni',
                users: teachers.map(t => ({ person_id: t.person_id, role: t.role }))
            });
        }
    }

    // C. STUDENTS "MY STUDENTS" (for teachers)
    if (role === 'teacher' && allowedTargets.includes('student')) {
        // Find students in groups taught by this teacher
        const myStudents = await db.selectFrom('students')
            .innerJoin('groups', 'groups.class_id', 'students.class_id')
            .innerJoin('timetable', 'timetable.group_id', 'groups.group_id')
            .select(['students.person_id'])
            .where('timetable.teacher_id', '=', auth.person_id)
            .where('students.status', '=', 'active')
            .execute();

        const ids = [...new Set(myStudents.map(s => s.person_id))];
        if (ids.length > 0) {
            allPersonIds.push(...ids);
            result.push({
                group: 'students_teaching',
                label: 'Žáci - podle úvazků',
                users: ids.map(id => ({ person_id: id, role: 'student' }))
            });
        }
    }

    // D. STUDENTS ALL
    if (allowedTargets.includes('student')) {
        const students = await db.selectFrom('students')
            .select(['person_id'])
            .where('status', '=', 'active')
            .execute();

        if (students.length > 0) {
            const ids = students.map(s => s.person_id);
            allPersonIds.push(...ids);
            result.push({
                group: 'students_all',
                label: 'Žáci - všichni',
                users: ids.map(id => ({ person_id: id, role: 'student' }))
            });
        }

        // E. STUDENTS GROUPED BY CLASS
        const classesWithStudents = await db.selectFrom('students')
            .innerJoin('classes', 'classes.class_id', 'students.class_id')
            .select(['students.person_id', 'classes.prefix', 'classes.suffix'])
            .where('students.status', '=', 'active')
            .orderBy(['classes.prefix', 'classes.suffix'])
            .execute();

        const classMap = new Map<string, any[]>();
        classesWithStudents.forEach(s => {
            const className = `${s.prefix}.${s.suffix}`;
            if (!classMap.has(className)) classMap.set(className, []);
            classMap.get(className)?.push({ person_id: s.person_id, role: 'student', class: className });
        });

        for (const [className, users] of classMap.entries()) {
            result.push({
                group: `class_${className}`,
                label: `Žáci - třída ${className}`,
                users: users
            });
        }
    }

    // F. PARENTS
    if (allowedTargets.includes('parent')) {
        // This requires finding persons who are targets in family_relations
        const parents = await db.selectFrom('family_relations')
            .innerJoin('persons', 'persons.person_id', 'family_relations.source_id') // source_id is the parent? Check roles
            // Wait, usually family_relations: target_id is student, source_id is relative
            .select(['family_relations.source_id as person_id'])
            .execute();
            
        const ids = [...new Set(parents.map(p => p.person_id))];
        if (ids.length > 0) {
            allPersonIds.push(...ids);
            result.push({
                group: 'parents_all',
                label: 'Rodiče - všichni',
                users: ids.map(id => ({ person_id: id, role: 'parent' }))
            });
        }
    }

    // 3. Formatting and sorting names
    const uniqueIds = [...new Set(allPersonIds)];
    if (uniqueIds.length > 0) {
        const names = await format_person_map_by_ids(uniqueIds);
        
        result.forEach(group => {
            group.users.forEach(u => {
                const fullName = names.get(u.person_id) || `Neznámý (${u.person_id})`;
                u.full_name = fullName;
                const parts = fullName.split(' ');
                u.last_name = parts[parts.length - 1] || '';
                u.first_name = parts[0] || '';
            });
            group.users.sort((a, b) => a.last_name.localeCompare(b.last_name, 'cs'));
        });
    }

    return result;
  }, {
    body: t.Object({
      message_type: t.Optional(t.Number())
    }),
  });

export default app;
