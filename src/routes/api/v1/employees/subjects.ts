import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { getAuthUser } from '../../../../utils/auth';
import { sql } from 'kysely';

export const subjectsRouter = new Elysia({ prefix: '/subjects' })
  // GET / - Get taught subjects, groups, and supervision
  .get('/', async({ cookie, query, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    
    const employeeId = parseInt(params.id);
    if (isNaN(employeeId)) {
      return new Response(JSON.stringify({ error: 'invalid_id' }), { status: 400 });
    }
    const today = new Date().toISOString().split('T')[0];

    // 1. Taught Subjects (Aprobace)
    const taughtSubjects = await db.selectFrom('teachers_subject')
      .innerJoin('subjects', 'subjects.subject_id', 'teachers_subject.subject_id')
      .select([
        'subjects.label as name',
        'subjects.shortcut as code',
        'teachers_subject.description as level'
      ])
      .where('teachers_subject.teacher_id', '=', employeeId)
      .execute();

    // 2. Currently taught groups from timetable
    const taughtGroups = await db.selectFrom('timetable')
      .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
      .innerJoin('subjects', 'subjects.subject_id', 'timetable.subject_id')
      .select([
        sql<string>`concat(groups.name, ' - ', subjects.shortcut)`.as('name'),
        sql<number>`(SELECT count(*) FROM student_groups WHERE student_groups.group_id = groups.group_id)`.as('students'),
        sql<string>`(
          SELECT GROUP_CONCAT(CONCAT(p.last_name, ' ', p.first_name) ORDER BY p.last_name SEPARATOR ', ')
          FROM student_groups sg
          JOIN persons p ON p.person_id = sg.student_id
          WHERE sg.group_id = groups.group_id
        )`.as('studentNames'),
        sql<string>`(
          SELECT COALESCE(ROUND(SUM(g.mark * (gc.weight + 1)) / SUM(gc.weight + 1), 2), '-')
          FROM grades g
          JOIN grades_columns gc ON g.column_id = gc.column_id
          WHERE gc.group_id = groups.group_id
            AND gc.subject_id = subjects.subject_id
            AND gc.status = 'active'
            AND gc.type = 0
        )`.as('average'),
        sql<string>`(
          SELECT COALESCE(DATE_FORMAT(MAX(gc.created), '%d.%m.%Y'), '-')
          FROM grades_columns gc
          WHERE gc.group_id = groups.group_id
            AND gc.subject_id = subjects.subject_id
            AND gc.status = 'active'
        )`.as('lastClassification')
      ])
      .where((eb) => eb.or([
        eb('timetable.teacher_id', '=', employeeId),
        eb('timetable.teacher2_id', '=', employeeId)
      ]))
      .groupBy(['groups.group_id', 'subjects.subject_id'])
      .execute();

    // 3. Supervision schedule
    const supervision = await db.selectFrom('supervisions')
      .innerJoin('supervision_places', 'supervision_places.place_id', 'supervisions.place_id')
      .select([
        'supervisions.day',
        sql<string>`concat(supervisions.hour, '. hodina')`.as('time'),
        'supervision_places.name as location'
      ])
      .where('supervisions.teacher_id', '=', employeeId)
      .execute();

    return Response.json({
        subjects: taughtSubjects,
        groups: taughtGroups,
        supervision: supervision
    });
  });

// End of file
