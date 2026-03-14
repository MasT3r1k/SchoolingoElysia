import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { MessagesConfig } from '../../../../config/message.config';
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
    if (body.message_type !== undefined && MessagesConfig.MESSAGE_TYPE_TARGETS[body.message_type]) {
        const allowedByType = MessagesConfig.MESSAGE_TYPE_TARGETS[body.message_type];
        allowedTargets = allowedTargets.filter(t => allowedByType.includes(t));
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
            .where('person_id', '!=', auth.person_id)
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
        let teacherIds: number[] = [];
        
        if (body.child_id && body.message_type === 2) {
            // Get ONLY class teacher for excuses
            const classTeacher = await db.selectFrom('students')
                .innerJoin('classes', 'classes.class_id', 'students.class_id')
                .select('classes.teacher_id')
                .where('students.person_id', '=', body.child_id)
                .executeTakeFirst();
            
            if (classTeacher?.teacher_id) {
                teacherIds.push(classTeacher.teacher_id);
            }
        }

        let teachersQuery = db.selectFrom('teachers')
            .select(['person_id', 'role'])
            .where('status', '=', 'active')
            .where('role', '=', 'teacher')
            .where('person_id', '!=', auth.person_id);

        if (teacherIds.length > 0) {
            teachersQuery = teachersQuery.where('person_id', 'in', teacherIds);
        } else if (body.child_id && body.message_type === 2) {
            // If it's an excuse but no class teacher found, return empty to avoid sending to all teachers
            teachersQuery = teachersQuery.where('person_id', '=', -1);
        }

        const teachers = await teachersQuery.execute();
            
        if (teachers.length > 0) {
            const ids = teachers.map(t => t.person_id);
            allPersonIds.push(...ids);
            result.push({
                group: 'teacher',
                label: 'Učitel',
                users: teachers.map(t => ({ person_id: t.person_id, role: t.role }))
            });
            result.push({
                group: 'teacher_select',
                label: 'Učitelé - volný výběr',
                users: teachers.map(t => ({ person_id: t.person_id, role: t.role }))
            });
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
            .where('students.person_id', '!=', auth.person_id)
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
            .leftJoin('classes', 'classes.class_id', 'students.class_id')
            .leftJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
            .select(['students.person_id', 'classes.class_id', 'classes.prefix', 'classes.suffix', 'sy.start as sy_start'])
            .where('students.status', '=', 'active')
            .where('students.person_id', '!=', auth.person_id)
            .execute();

        if (students.length > 0) {
            const ids = students.map(s => s.person_id);
            allPersonIds.push(...ids);
            
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const classMap = new Map<number, { name: string, members: number[] }>();

            students.forEach(s => {
                if (!s.class_id || !s.sy_start) return;
                const startYear = new Date(s.sy_start).getFullYear();
                let yearDiff = currentYear - startYear;
                if (currentMonth >= 8) yearDiff++;
                const className = `${s.prefix}${yearDiff}${s.suffix}`;
                
                if (!classMap.has(s.class_id)) classMap.set(s.class_id, { name: className, members: [] });
                classMap.get(s.class_id)?.members.push(s.person_id);
            });

            const classUsers = Array.from(classMap.entries()).map(([cid, data]) => ({
                person_id: -1000 - cid,
                full_name: data.name,
                first_name: '',
                last_name: data.name,
                role: 'class',
                members: data.members
            })).sort((a, b) => a.full_name.localeCompare(b.full_name, 'cs'));

            result.push({
                group: 'student',
                label: 'Žák',
                users: ids.map(id => ({ person_id: id, role: 'student' }))
            });
            result.push({
                group: 'students_class',
                label: 'Žáci - jedna třída',
                users: classUsers
            });
            result.push({
                group: 'students_group',
                label: 'Žáci - skupina tříd',
                users: classUsers
            });
            result.push({
                group: 'students_all',
                label: 'Žáci - všichni',
                users: ids.map(id => ({ person_id: id, role: 'student' }))
            });
            result.push({
                group: 'students_select',
                label: 'Žáci - volný výběr',
                users: ids.map(id => ({ person_id: id, role: 'student' }))
            });
            result.push({
                group: 'students_select_class',
                label: 'Žáci - volný výběr tříd',
                users: classUsers
            });
        }
    }

    // F. PARENTS
    if (allowedTargets.includes('parent')) {
        const parentsData = await db.selectFrom('family_relations')
            .innerJoin('students', 'students.person_id', 'family_relations.source_id')
            .leftJoin('classes', 'classes.class_id', 'students.class_id')
            .leftJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
            .select(['family_relations.source_id as person_id', 'classes.class_id', 'classes.prefix', 'classes.suffix', 'sy.start as sy_start'])
            .execute();
            
        const ids = [...new Set(parentsData.map(p => p.person_id))];
        if (ids.length > 0) {
            allPersonIds.push(...ids);

            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const parentClassMap = new Map<number, { name: string, members: Set<number> }>();

            parentsData.forEach(p => {
                if (!p.class_id || !p.sy_start) return;
                const startYear = new Date(p.sy_start).getFullYear();
                let yearDiff = currentYear - startYear;
                if (currentMonth >= 8) yearDiff++;
                const className = `${p.prefix}${yearDiff}${p.suffix}`;
                
                if (!parentClassMap.has(p.class_id)) parentClassMap.set(p.class_id, { name: className, members: new Set() });
                parentClassMap.get(p.class_id)?.members.add(p.person_id);
            });

            const parentClassUsers = Array.from(parentClassMap.entries()).map(([cid, data]) => ({
                person_id: -2000 - cid,
                full_name: data.name,
                first_name: '',
                last_name: data.name,
                role: 'class',
                members: Array.from(data.members)
            })).sort((a, b) => a.full_name.localeCompare(b.full_name, 'cs'));

            result.push({
                group: 'parents_student',
                label: 'Rodiče - jeden žák',
                users: ids.map(id => ({ person_id: id, role: 'parent' }))
            });
            result.push({
                group: 'parents_class',
                label: 'Rodiče - jedna třída',
                users: parentClassUsers
            });
            result.push({
                group: 'parents_group',
                label: 'Rodiče - skupina tříd',
                users: parentClassUsers
            });
            result.push({
                group: 'parents_all',
                label: 'Rodiče - všichni',
                users: ids.map(id => ({ person_id: id, role: 'parent' }))
            });
            result.push({
                group: 'parents_select',
                label: 'Rodiče - volný výběr',
                users: ids.map(id => ({ person_id: id, role: 'parent' }))
            });
            result.push({
                group: 'parents_select_class',
                label: 'Rodiče - volný výběr tříd',
                users: parentClassUsers
            });
        }
    }

    // 3. Formatting and sorting names
    const uniqueIds = [...new Set(allPersonIds)];
    if (uniqueIds.length > 0) {
        const names = await format_person_map_by_ids(uniqueIds);
        
        // Fetch class info for students
        const studentClassInfo = await db.selectFrom('students')
            .innerJoin('classes', 'classes.class_id', 'students.class_id')
            .innerJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
            .select(['students.person_id', 'classes.prefix', 'classes.suffix', 'sy.start as sy_start'])
            .where('students.person_id', 'in', uniqueIds)
            .execute();
            
        const classMap = new Map<number, string>();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        studentClassInfo.forEach(s => {
            const startYear = new Date(s.sy_start).getFullYear();
            let yearDiff = currentYear - startYear;
            if (currentMonth >= 8) yearDiff++; // Školní rok začíná v září
            
            const className = `${s.prefix}${yearDiff}${s.suffix}`;
            classMap.set(s.person_id, className);
        });

        result.forEach(group => {
            group.users.forEach(u => {
                if (u.role === 'class') return;
                const fullName = names.get(u.person_id) || `Neznámý (${u.person_id})`;
                u.full_name = fullName;
                const parts = fullName.split(' ');
                u.last_name = parts[parts.length - 1] || '';
                u.first_name = parts[0] || '';
                
                // Add class info if it's a student
                if (u.role === 'student' && classMap.has(u.person_id)) {
                    u.role = `${u.role}_${classMap.get(u.person_id)}`;
                }
            });
            group.users.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || '', 'cs'));
        });
    }

    return result;
  }, {
    body: t.Object({
      message_type: t.Optional(t.Number()),
      child_id: t.Optional(t.Number())
    }),
  });

export default app;
