import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const elysiaAp = new Elysia()
  .get('/teachers', async({ cookie, school }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.EMPLOYEES_VIEW);
    if (!perm) return { error: 'no_permission' };
    const result = await db.selectFrom('teachers')
      .leftJoin('users', 'users.person_id', 'teachers.person_id')
      .innerJoin('persons', 'teachers.person_id', 'persons.person_id')
      .where('teachers.school_id', '=', school.school_id)
      .select([
          'teachers.person_id',
          'persons.first_name',
          'persons.last_name'
      ])
      .orderBy('person_id', 'asc')
      .execute();

    const teacher_names = await format_person_map_by_ids(result.map((teacher) => (teacher.person_id)));
    const teachers = result.map((teacher, index) => ({
        teacherId: teacher.person_id,
        teacherName: teacher_names.get(teacher.person_id),
        firstName: teacher.first_name,
        lastName: teacher.last_name,
    })).sort((a, b) => {
        const ln = a.lastName.localeCompare(b.lastName, 'cs');
        if (ln !== 0) return ln;
        return a.firstName.localeCompare(b.firstName, 'cs');
    });

    return Response.json(teachers);

});


export default elysiaAp;
