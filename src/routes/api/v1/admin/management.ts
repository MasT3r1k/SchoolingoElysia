import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .get('/admin/management', async ({ user }: any) => {
    // Auth Check
    if (!user) return { error: 'no_user', details: 'unauthorized' };
    
    // Permission Check: User must either Not have a manager (manager == -1) AND NOT be principal? 
    // Preserving original logic: if (manager != -1 && principal == false) ERROR.
    // Meaning: You must be Principal OR Independent (No Manager, -1).
    if (user.manager != -1 && user.is_principal == false) return { error: 'no_permission' };

    // === Define Queries ===
    const now = new Date();
    const current_month_start = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Total students
    const total_students_query = db.selectFrom('students')
    .leftJoin('users', 'users.person_id', 'students.person_id')
    .leftJoin('classes', 'classes.class_id', 'students.class_id')
    .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
    .select([sql`COUNT(*)`.as('count')])
    .where('students.status', '=', 'active')
    .where((eb) => eb.or([
      eb('users.school_id', '=', user.school_id),
      eb('scopes.school_id', '=', user.school_id)
    ]))
    .executeTakeFirst()
    .then(r => Number(r?.count ?? 0));

    // Limit students
    const limit_students_query = db.selectFrom('schools')
        .select(['schools.students_limit'])
        .where('schools.school_id', '=', user.school_id)
        .executeTakeFirst()
        .then(r => Number(r?.students_limit ?? 0));

    // Average grade
    const average_grade_query = db.selectFrom('grades')
        .leftJoin('grades_columns', 'grades_columns.column_id', 'grades.column_id')
        .leftJoin('users', 'users.person_id', 'grades.student_id')
        .leftJoin('students', 'students.person_id', 'users.person_id')
        .leftJoin('classes', 'classes.class_id', 'students.class_id')
        .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
        .select(sql<number>`SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight),0)`.as('weighted_average_grade'))
        .where('grades.mark', 'is not', null)
        .where((eb) => eb.or([
          eb('users.school_id', '=', user.school_id),
          eb('scopes.school_id', '=', user.school_id)
        ]))
        .executeTakeFirst()
        .then(r => Number(r?.weighted_average_grade ?? 0));

    // Absence rate logic helpers
    const stats = db.selectFrom('classbook as c')
        .leftJoin('student_groups as sg', 'sg.group_id', 'c.group_id')
        .leftJoin(
            db.selectFrom('absence')
            .select(['lesson_id', sql`COUNT(*)`.as('absent_count')])
            .groupBy('lesson_id')
            .as('a'),
            'a.lesson_id', 'c.classbook_id'
        )
        .leftJoin('groups', 'groups.group_id', 'c.group_id')
        .leftJoin('classes', 'classes.class_id', 'groups.class_id')
        .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
        .innerJoin('users', 'users.person_id', 'classes.teacher_id')
        .where((eb) => eb.or([
          eb('users.school_id', '=', user.school_id),
          eb('scopes.school_id', '=', user.school_id)
        ]))
        .select(['c.classbook_id', sql`COUNT(sg.student_id)`.as('lesson_expected'), sql`COALESCE(a.absent_count, 0)`.as('lesson_absent')])
        .groupBy('c.classbook_id')
        .as('stats');

    // Absence rate
    const absence_rate_query = db.selectFrom(stats)
        .select(sql`SUM(stats.lesson_absent) / SUM(stats.lesson_expected)`.as('school_absence_rate'))
        .executeTakeFirst()
        .then(r => Number(r?.school_absence_rate ?? 0));

    // At Risk Count
    const at_risk_count_query = db.selectFrom(
        db.selectFrom('students as s')
            .leftJoin('student_groups as sg', 'sg.student_id', 's.person_id')
            // Tady necháváme jen to, co je potřeba pro výpočet skóre
            .leftJoin(
                db.selectFrom('classbook as c')
                .leftJoin(
                    db.selectFrom('absence').select([
                        'lesson_id',
                        sql`COUNT(*)`.as('missed')
                    ])
                    .groupBy('lesson_id').as('a2'),
                    'a2.lesson_id', 'c.classbook_id'
                )
                .select(['c.classbook_id', 'c.group_id', sql`1`.as('expected'), sql`COALESCE(a2.missed,0)`.as('absent')])
                .as('a'), 'a.group_id', 'sg.group_id'
            )
            .leftJoin(
                db.selectFrom('grades as g')
                .leftJoin('grades_columns as gc', 'gc.column_id', 'g.column_id')
                .select(['g.student_id', sql`SUM(g.mark * gc.weight) / SUM(gc.weight)`.as('weighted_avg')])
                .groupBy('g.student_id').as('g'),
                'g.student_id', 's.person_id'
            )
            .select([
                's.person_id',
                's.class_id', // Přidáno, abychom se na to mohli napojit venku
                sql`CASE WHEN COALESCE(SUM(a.absent),0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent),0) / SUM(a.expected) * 40 END`.as('absence_score'),
                sql`CASE WHEN COALESCE(g.weighted_avg,0) = 0 THEN 0 ELSE ((COALESCE(g.weighted_avg,0) - 1)/4*100)*0.4 END`.as('grade_score'),
                sql`(CASE WHEN COALESCE(SUM(a.absent),0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)*40 END + CASE WHEN COALESCE(g.weighted_avg,0) = 0 THEN 0 ELSE ((COALESCE(g.weighted_avg,0)-1)/4*100)*0.4 END)`.as('risk_score')
            ])
            .groupBy(['s.person_id', 's.class_id'])
            .as('risk_stats')
    )
    // Joini přesunuty sem, aby byly viditelné pro WHERE
    .leftJoin('users', 'users.person_id', 'risk_stats.person_id')
    .leftJoin('classes', 'classes.class_id', 'risk_stats.class_id')
    .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
    .where((eb) => eb.and([
        eb('risk_stats.risk_score', '>=', 60),
        eb.or([
            eb('users.school_id', '=', user.school_id),
            eb('scopes.school_id', '=', user.school_id)
        ])
    ]))
    .select(sql<number>`COUNT(*)`.as('at_risk_students'))
    .executeTakeFirst()
    .then(r => Number(r?.at_risk_students ?? 0));

    // Class Stats
    const class_stats_query = db.selectFrom('classes')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
      .leftJoin('students', (join) => join
         .onRef('students.class_id', '=', 'classes.class_id')
         .on('students.status', '=', 'active')
      )
      .leftJoin('grades', 'grades.student_id', 'students.person_id')
      .leftJoin('grades_columns', 'grades_columns.column_id', 'grades.column_id')
      .select([
        'classes.class_id',
        sql<string>`concat(classes.prefix, COALESCE(TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, ''), classes.suffix)`.as('class_name'),
        sql`COUNT(DISTINCT students.person_id)`.as('student_count'),
        sql`COALESCE(SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight), 0), 0)`.as('average_grade'),
        sql`COALESCE(SUM(CASE WHEN grades_columns.created < ${current_month_start} THEN grades.mark * grades_columns.weight ELSE 0 END) / NULLIF(SUM(CASE WHEN grades_columns.created < ${current_month_start} THEN grades_columns.weight ELSE 0 END), 0), 0)`.as('average_grade_last'),
        sql`0`.as('absence_rate')
      ])
      .where('scopes.school_id', '=', user.school_id)
      .groupBy(['classes.class_id', 'classes.prefix', 'classes.suffix', 'school_years.start'])
      .execute()
      .then(rows => rows.map(row => {
        const avg = Number(row.average_grade);
        const avgLast = Number(row.average_grade_last);
        let trend: 'up' | 'down' | 'stable' = 'stable';

        if (avg > avgLast) trend = 'up';
        if (avg < avgLast) trend = 'down';

        return {
            class_id: row.class_id,
            class_name: row.class_name,
            student_count: Number(row.student_count),
            average_grade: avg,
            average_grade_last: avgLast,
            absence_rate: Number(row.absence_rate),
            trend
        }
      }));

    // Subject Stats
    const subject_stats_query = db.selectFrom('subjects')
      .leftJoin('grades_columns', 'grades_columns.subject_id', 'subjects.subject_id')
      .leftJoin('grades', 'grades.column_id', 'grades_columns.column_id')
      .leftJoin('teachers_subject', 'teachers_subject.subject_id', 'subjects.subject_id')
      .leftJoin('users', 'users.person_id', 'teachers_subject.teacher_id')
      .where('subjects.school_id', '=', user.school_id)
      .select([
        'subjects.subject_id as subject_id',
        'subjects.label as subject_name',
        sql`COALESCE(SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight), 0), 0)`.as('average_grade'),
        sql`COUNT(DISTINCT teachers_subject.teacher_id)`.as('teacher_count'),
        sql`COUNT(DISTINCT grades.student_id)`.as('student_count'),
        sql`5`.as('difficulty_rating')
      ])
      .groupBy('subjects.subject_id')
      .execute()
      .then(rows => rows.map(row => ({
        subject_id: row.subject_id,
        subject_name: row.subject_name,
        average_grade: Number(row.average_grade),
        teacher_count: Number(row.teacher_count),
        student_count: Number(row.student_count),
        difficulty_rating: Number(row.difficulty_rating)
      })));

    // Teacher Stats
    const teacher_stats_query = db.selectFrom('teachers')
      .leftJoin('persons', 'persons.person_id', 'teachers.person_id')
      .leftJoin('users', 'users.person_id', 'teachers.person_id')
      .leftJoin('teachers_subject', 'teachers_subject.teacher_id', 'teachers.person_id')
      .leftJoin('subjects', 'subjects.subject_id', 'teachers_subject.subject_id')
      .leftJoin('classbook', 'classbook.teacher_id', 'teachers.person_id')
      .leftJoin('absence', 'absence.lesson_id', 'classbook.classbook_id')
      .where('teachers.school_id', '=', user.school_id)
      .select([
        'teachers.person_id as teacher_id',
        sql`CONCAT(persons.first_name, ' ', persons.last_name)`.as('full_name'),
        sql`MAX(subjects.label)`.as('subject'),
        sql`0`.as('class_average'),
        sql`COUNT(DISTINCT classbook.group_id)`.as('student_count'),
        sql`CASE WHEN COUNT(DISTINCT classbook.classbook_id) = 0 THEN 0 ELSE (COUNT(absence.student_id) * 100.0) / (COUNT(DISTINCT classbook.classbook_id) * 20) END`.as('absence_in_classes')
      ])
      .groupBy('teachers.person_id')
      .execute()
      .then(rows => rows.map(row => ({
        teacher_id: row.teacher_id,
        full_name: row.full_name as string,
        subject: row.subject as string || 'N/A',
        class_average: Number(row.class_average),
        student_count: Number(row.student_count),
        absence_in_classes: Number(row.absence_in_classes)
      })));

    // Absence Heatmap
    const absence_heatmap_query = db.selectFrom('absence')
      .leftJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
      .leftJoin('groups', 'groups.group_id', 'classbook.group_id')
      .leftJoin('classes', 'classes.class_id', 'groups.class_id')
      .leftJoin('users', 'users.person_id', 'classes.teacher_id')
      .where('users.school_id', '=', user.school_id)
      .select([sql`DAYOFWEEK(classbook.date)`.as('day'), 'classbook.day_hour as hour', sql`COUNT(*)`.as('count')])
      .groupBy(['day', 'hour'])
      .execute()
      .then(rows => rows.map(row => ({
        day: Number(row.day) - 1,
        hour: row.hour,
        count: Number(row.count)
      })));

    // Top 5 Risk Query (Complex query definition)
    const top_5_at_risk_query = db.selectFrom(
        db.selectFrom('students as s')
            .leftJoin('student_groups as sg', 'sg.student_id', 's.person_id')
            .leftJoin(
                db.selectFrom('classbook as c')
                    .leftJoin(
                        db.selectFrom('absence')
                            .select(['lesson_id', sql`COUNT(*)`.as('missed')])
                            .groupBy('lesson_id')
                            .as('a2'), 
                        'a2.lesson_id', 'c.classbook_id'
                    )
                    .select([
                        'c.classbook_id', 
                        'c.group_id', 
                        sql`1`.as('expected'), 
                        sql`COALESCE(a2.missed, 0)`.as('absent')
                    ])
                    .as('a'), 
                'a.group_id', 'sg.group_id'
            )
            .leftJoin(
                db.selectFrom('grades as g')
                    .leftJoin('grades_columns as gc', 'gc.column_id', 'g.column_id')
                    .select([
                        'g.student_id', 
                        sql`SUM(g.mark * gc.weight) / SUM(gc.weight)`.as('weighted_avg')
                    ])
                    .groupBy('g.student_id')
                    .as('g'), 
                'g.student_id', 's.person_id'
            )
            .select([
                's.person_id',
                's.class_id', // Nutné pro pozdější join na školu
                sql`CASE WHEN COALESCE(SUM(a.absent), 0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent), 0) / SUM(a.expected) * 40 END`.as('absence_score'),
                sql`CASE WHEN COALESCE(g.weighted_avg, 0) = 0 THEN 0 ELSE ((COALESCE(g.weighted_avg, 0) - 1) / 4 * 100) * 0.4 END`.as('grade_score'),
                sql`(CASE WHEN COALESCE(SUM(a.absent), 0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent), 0) / SUM(a.expected) * 40 END + CASE WHEN COALESCE(g.weighted_avg, 0) = 0 THEN 0 ELSE ((COALESCE(g.weighted_avg, 0) - 1) / 4 * 100) * 0.4 END)`.as('risk_score'),
                sql`COALESCE(g.weighted_avg, 0)`.as('avg_grade'),
                sql`CASE WHEN COALESCE(SUM(a.expected), 0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent), 0) / SUM(a.expected) END`.as('absence_rate')
            ])
            .groupBy(['s.person_id', 's.class_id'])
            .as('risk_stats')
    )
    .leftJoin('users', 'users.person_id', 'risk_stats.person_id')
    .leftJoin('classes', 'classes.class_id', 'risk_stats.class_id')
    .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
    .where((eb) => eb.or([
        eb('users.school_id', '=', user.school_id),
        eb('scopes.school_id', '=', user.school_id)
    ]))
    .select([
        'risk_stats.person_id as student_id',
        'risk_stats.absence_score',
        'risk_stats.grade_score',
        'risk_stats.risk_score',
        'risk_stats.avg_grade',
        'risk_stats.absence_rate'
    ])
    .orderBy('risk_stats.risk_score', 'desc')
    .limit(5);

    // Execute Top 5 Students separate promise because formatting depends on it
    const top_5_students_promise = top_5_at_risk_query.execute().then(async (top5StudentsData) => {
        const student_names = await format_people_by_ids(top5StudentsData.map((student) => (student.student_id)));
        return top5StudentsData.map((student, index) => ({
            student_id: student.student_id,
            absence_score: student.absence_score,
            absence_rate: student.absence_rate,
            grade_score: student.grade_score,
            grade_average: student.avg_grade,
            risk_score: student.risk_score,
            full_name: student_names[index]
        }));
    });

    // Class Info & Trends
    const class_info_promise = (async () => {
        const cls = await db.selectFrom('classes')
            .leftJoin('students', (join) => join
                .onRef('students.class_id', '=', 'classes.class_id')
                .on('students.status', '=', 'active')
            )
            .select(['classes.class_id', 'classes.prefix', 'classes.suffix', sql<number>`count(students.person_id)`.as('student_count')])
            .where('classes.teacher_id', '=', user.person_id)
            .groupBy(['classes.class_id', 'classes.prefix', 'classes.suffix'])
            .executeTakeFirst();

        if (!cls) return null;

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const getAbsence = async (start: Date, end: Date) => {
            const res = await db.selectFrom('absence')
                .innerJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
                .innerJoin('students', 'students.person_id', 'absence.student_id')
                .select(sql<number>`SUM(COALESCE(absence.minutes, 45))`.as('minutes'))
                .where('students.class_id', '=', cls.class_id)
                .where('classbook.date', '>=', start)
                .where('classbook.date', '<', end)
                .executeTakeFirst();
            return Number(res?.minutes ?? 0);
        };

        const [current, last] = await Promise.all([
            getAbsence(currentMonthStart, nextMonthStart),
            getAbsence(lastMonthStart, currentMonthStart)
        ]);

        return {
            class_id: cls.class_id,
            class_name: `${cls.prefix}. ${cls.suffix}`,
            student_count: Number(cls.student_count),
            absence: {
                current_month: current,
                last_month: last,
                trend: current - last
            }
        };
    })();

    // === EXECUTE ALL IN PARALLEL ===
    const [
        total_students, limit_students, average_grade, absence_rate, at_risk_students,
        risk_students, class_stats, subject_stats, teacher_stats, absence_heatmap, class_info
    ] = await Promise.all([
        total_students_query, limit_students_query, average_grade_query, absence_rate_query, at_risk_count_query,
        top_5_students_promise, class_stats_query, subject_stats_query, teacher_stats_query, absence_heatmap_query, class_info_promise
    ]);

    return {
        school_stats: { total_students, limit_students, average_grade, absence_rate, at_risk_students },
        risk_students,
        class_stats,
        subject_stats,
        teacher_stats,
        absence_heatmap,
        class_info
    };
  })
  .get('/admin/management/class/:classId', async ({ user, params }: any) => {
    // Auth Check
    if (!user) return { error: 'no_user', details: 'unauthorized' };
    if (user.manager != -1 && user.is_principal == false) return { error: 'no_permission' };
    
    const class_id = Number(params.classId);

    // Get Class Details
    const class_details = await db.selectFrom('classes')
        .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
        .leftJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
        .select([
            'classes.class_id',
            'classes.teacher_id',
            sql<string>`concat(classes.prefix, COALESCE(TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, ''), classes.suffix)`.as('class_name'),
            'school_years.start' 
        ])
        .where('scopes.school_id', '=', user.school_id)
        .where('classes.class_id', '=', class_id)
        .executeTakeFirst();

    if (!class_details) return { error: 'class_not_found' };

    const teacher_name = (await format_people_by_ids([class_details.teacher_id]))[0];

    // Group Statistics (active only)
    const groups_stats_result = await db.selectFrom('groups')
        .innerJoin('classes', 'classes.class_id', 'groups.class_id')
        .innerJoin('school_years', 'school_years.sy_id', 'groups.year_id')
        .leftJoin('student_groups', 'student_groups.group_id', 'groups.group_id')
        .leftJoin('classbook', 'classbook.group_id', 'groups.group_id')
        .leftJoin('absence', 'absence.lesson_id', 'classbook.classbook_id')
        .leftJoin('grades', 'grades.student_id', 'student_groups.student_id')
        .leftJoin('grades_columns', 'grades_columns.column_id', 'grades.column_id')
        .select([
            'groups.group_id',
            'groups.name as group_name',
            'groups.num as group_num',
            sql<number>`COUNT(DISTINCT student_groups.student_id)`.as('student_count'),
            sql<number>`COALESCE(SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight), 0), 0)`.as('average_grade'),
             sql<number>`CASE WHEN COUNT(DISTINCT classbook.classbook_id) * COUNT(DISTINCT student_groups.student_id) = 0 THEN 0 ELSE (COUNT(absence.student_id) * 100.0) / (COUNT(DISTINCT classbook.classbook_id) * COUNT(DISTINCT student_groups.student_id)) END`.as('absence_rate')
        ])
        .where('groups.class_id', '=', class_id)
        .where('school_years.current', '=', true)
        .groupBy(['groups.group_id', 'groups.name', 'groups.num'])
        .execute();

    return {
        class_details: {
            ...class_details,
            teacher_name
        },
        groups_stats: groups_stats_result.map(g => ({
            ...g,
            student_count: Number(g.student_count),
            average_grade: Number(g.average_grade),
            absence_rate: Number(g.absence_rate)
        }))
    };
  });

export default app;
