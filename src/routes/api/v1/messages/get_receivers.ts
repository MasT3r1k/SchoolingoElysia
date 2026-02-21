import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';
import { sql } from 'kysely';

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

    if (!auth?.person || !auth.role) return { error: 'no_user', details: 'no_db' };

    // Get allowed target roles
    let allowedTargets: string[] = [];
    try {
        const perms = await db.selectFrom('role_communication_permissions')
            .select('role_target')
            .where('role_source', '=', auth.role)
            .execute();
        allowedTargets = perms.map(p => p.role_target);
    } catch (e) {
        // Table might not exist or empty
    }

    // Default permissions logic
    if (allowedTargets.length === 0) {
        if (['teacher', 'management', 'admin_staff'].includes(auth.role)) {
            allowedTargets = ['teacher', 'student', 'parent', 'management', 'admin_staff', 'personnel'];
        } else {
            allowedTargets = ['teacher', 'management'];
        }
    }

    const result: { group: string, label: string, users: any[] }[] = [];
    const allPersonIds: number[] = [];

    // --- Teachers & Staff ---
    if (allowedTargets.some(r => ['teacher', 'management', 'admin_staff'].includes(r))) {
        const teachers = await db
            .selectFrom('teachers')
            .select(['teachers.person_id'])
            .where('teachers.status', '=', 'active')
            .execute();

        const teacherIds = teachers.map(t => t.personId);
        allPersonIds.push(...teacherIds);
        
        if (teacherIds.length > 0) {
            result.push({
                group: 'teachers',
                label: 'Učitelé a zaměstnanci',
                users: teacherIds.map(id => ({ person_id: id, role: 'teacher' })) 
            });
        }
    }

    // --- Students (Grouped by Class) ---
    if (allowedTargets.includes('student')) {
        const students = await db
            .selectFrom('students')
            .innerJoin('classes', 'classes.class_id', 'students.class_id')
            .select(['students.person_id', 'classes.class_id', 'classes.prefix', 'classes.suffix'])
            .where('students.status', '=', 'active')
            .orderBy(['classes.prefix', 'classes.suffix'])
            .execute();

        const studentIds = students.map(s => s.personId);
        allPersonIds.push(...studentIds);

        const classMap = new Map<string, any[]>();
        
        students.forEach(s => {
            const className = `${s.prefix}.${s.suffix}`;
            if (!classMap.has(className)) {
                classMap.set(className, []);
            }
            classMap.get(className)?.push({ person_id: s.personId, role: 'student', class: className });
        });

        for (const [className, users] of classMap.entries()) {
            result.push({
                group: `class_${className}`,
                label: `Třída ${className}`,
                users: users
            });
        }
    }

    // Formatting names
    const uniqueIds = [...new Set(allPersonIds)];
    if (uniqueIds.length > 0) {
        const names = await format_people_by_ids(uniqueIds);
        const nameMap = new Map<number, string>();
        uniqueIds.forEach((id, index) => {
            nameMap.set(id, names[index]);
        });
        
        result.forEach(group => {
            group.users.forEach(u => {
                const fullName = nameMap.get(u.person_id) || '';
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
