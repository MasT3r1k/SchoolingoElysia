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
    if (user.manager != -1 && user.isPrincipal == false) return { error: 'no_permission' };

    // === Define Queries ===
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Total students
    const totalStudentsQuery = db.selectFrom('students')
        .leftJoin('users', 'users.person', 'students.personId')
        .leftJoin('classes', 'classes.classId', 'students.class')
        .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
        .select([sql`COUNT(*)`.as('count')])
        .where('students.status', '=', 'active')
        .where((eb) => eb.or([
          eb('users.school', '=', user.school),
          eb('scopes.school_id', '=', user.school)
        ]))
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0));

    // Limit students
    const limitStudentsQuery = db.selectFrom('schools')
        .select(['schools.studentsLimit'])
        .where('schools.schoolId', '=', user.school)
        .executeTakeFirst()
        .then(r => Number(r?.studentsLimit ?? 0));

    // Average grade
    const averageGradeQuery = db.selectFrom('grades')
        .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
        .leftJoin('users', 'users.person', 'grades.studentId')
        .leftJoin('students', 'students.personId', 'users.person')
        .leftJoin('classes', 'classes.classId', 'students.class')
        .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
        .select(sql<number>`SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight),0)`.as('weighted_average_grade'))
        .where('grades.mark', 'is not', null)
        .where((eb) => eb.or([
          eb('users.school', '=', user.school),
          eb('scopes.school_id', '=', user.school)
        ]))
        .executeTakeFirst()
        .then(r => Number(r?.weighted_average_grade ?? 0));

    // Absence rate logic helpers
    const stats = db.selectFrom('classbook as c')
        .leftJoin('student_groups as sg', 'sg.groupId', 'c.groupId')
        .leftJoin(
            db.selectFrom('absence')
            .select(['lesson', sql`COUNT(*)`.as('absent_count')])
            .groupBy('lesson')
            .as('a'),
            'a.lesson', 'c.cbId'
        )
        .leftJoin('groups', 'groups.groupId', 'c.groupId')
        .leftJoin('classes', 'classes.classId', 'groups.class')
        .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
        .innerJoin('users', 'users.person', 'classes.teacher')
        .where((eb) => eb.or([
          eb('users.school', '=', user.school),
          eb('scopes.school_id', '=', user.school)
        ]))
        .select(['c.cbId', sql`COUNT(sg.student)`.as('lesson_expected'), sql`COALESCE(a.absent_count, 0)`.as('lesson_absent')])
        .groupBy('c.cbId')
        .as('stats');

    // Absence rate
    const absenceRateQuery = db.selectFrom(stats)
        .select(sql`SUM(stats.lesson_absent) / SUM(stats.lesson_expected)`.as('school_absence_rate'))
        .executeTakeFirst()
        .then(r => Number(r?.school_absence_rate ?? 0));

    // At Risk Count
    const atRiskCountQuery = db.selectFrom(
        db.selectFrom('students as s')
            .leftJoin('student_groups as sg', 'sg.student', 's.personId')
            // Tady necháváme jen to, co je potřeba pro výpočet skóre
            .leftJoin(
                db.selectFrom('classbook as c')
                .leftJoin(
                    db.selectFrom('absence').select(['lesson', sql`COUNT(*)`.as('missed')]).groupBy('lesson').as('a2'),
                    'a2.lesson', 'c.cbId'
                )
                .select(['c.cbId', 'c.groupId', sql`1`.as('expected'), sql`COALESCE(a2.missed,0)`.as('absent')])
                .as('a'), 'a.groupId', 'sg.groupId'
            )
            .leftJoin(
                db.selectFrom('grades as g')
                .leftJoin('grades_columns as gc', 'gc.gcId', 'g.columnId')
                .select(['g.studentId', sql`SUM(g.mark * gc.weight) / SUM(gc.weight)`.as('weightedAvg')])
                .groupBy('g.studentId').as('g'),
                'g.studentId', 's.personId'
            )
            .select([
                's.personId',
                's.class', // Přidáno, abychom se na to mohli napojit venku
                sql`CASE WHEN COALESCE(SUM(a.absent),0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent),0) / SUM(a.expected) * 40 END`.as('absenceScore'),
                sql`CASE WHEN COALESCE(g.weightedAvg,0) = 0 THEN 0 ELSE ((COALESCE(g.weightedAvg,0) - 1)/4*100)*0.4 END`.as('gradeScore'),
                sql`(CASE WHEN COALESCE(SUM(a.absent),0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)*40 END + CASE WHEN COALESCE(g.weightedAvg,0) = 0 THEN 0 ELSE ((COALESCE(g.weightedAvg,0)-1)/4*100)*0.4 END)`.as('riskScore')
            ])
            .groupBy(['s.personId', 's.class'])
            .as('riskStats')
    )
    // Joini přesunuty sem, aby byly viditelné pro WHERE
    .leftJoin('users', 'users.person', 'riskStats.personId')
    .leftJoin('classes', 'classes.classId', 'riskStats.class')
    .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
    .where((eb) => eb.and([
        eb('riskStats.riskScore', '>=', 60),
        eb.or([
            eb('users.school', '=', user.school),
            eb('scopes.school_id', '=', user.school)
        ])
    ]))
    .select(sql<number>`COUNT(*)`.as('atRiskStudents'))
    .executeTakeFirst()
    .then(r => Number(r?.atRiskStudents ?? 0));

    // Class Stats
    const classStatsQuery = db.selectFrom('classes')
      .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
      .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
      .leftJoin('students', (join) => join
         .onRef('students.class', '=', 'classes.classId')
         .on('students.status', '=', 'active')
      )
      .leftJoin('grades', 'grades.studentId', 'students.personId')
      .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
      .select([
        'classes.classId',
        sql<string>`concat(classes.prefix, COALESCE(TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, ''), classes.suffix)`.as('className'),
        sql`COUNT(DISTINCT students.personId)`.as('student_count'),
        sql`COALESCE(SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight), 0), 0)`.as('average_grade'),
        sql`COALESCE(SUM(CASE WHEN grades_columns.created < ${currentMonthStart} THEN grades.mark * grades_columns.weight ELSE 0 END) / NULLIF(SUM(CASE WHEN grades_columns.created < ${currentMonthStart} THEN grades_columns.weight ELSE 0 END), 0), 0)`.as('average_grade_last'),
        sql`0`.as('absence_rate')
      ])
      .where('scopes.school_id', '=', user.school)
      .groupBy(['classes.classId', 'classes.prefix', 'classes.suffix', 'school_years.start'])
      .execute()
      .then(rows => rows.map(row => {
        const avg = Number(row.average_grade);
        const avgLast = Number(row.average_grade_last);
        let trend: 'up' | 'down' | 'stable' = 'stable';

        if (avg > avgLast) trend = 'up';
        if (avg < avgLast) trend = 'down';

        return {
            class_id: row.classId,
            class_name: row.className,
            student_count: Number(row.student_count),
            average_grade: avg,
            average_grade_last: avgLast,
            absence_rate: Number(row.absence_rate),
            trend
        }
      }));

    // Subject Stats
    const subjectStatsQuery = db.selectFrom('subjects')
      .leftJoin('grades_columns', 'grades_columns.subjectId', 'subjects.subjectId')
      .leftJoin('grades', 'grades.columnId', 'grades_columns.gcId')
      .leftJoin('teachers_subject', 'teachers_subject.subject_id', 'subjects.subjectId')
      .leftJoin('users', 'users.person', 'teachers_subject.teacher_id')
      .where('subjects.school_id', '=', user.school)
      .select([
        'subjects.subjectId as subject_id',
        'subjects.label as subject_name',
        sql`COALESCE(SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight), 0), 0)`.as('average_grade'),
        sql`COUNT(DISTINCT teachers_subject.teacher_id)`.as('teacher_count'),
        sql`COUNT(DISTINCT grades.studentId)`.as('student_count'),
        sql`5`.as('difficulty_rating')
      ])
      .groupBy('subjects.subjectId')
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
    const teacherStatsQuery = db.selectFrom('teachers')
      .leftJoin('persons', 'persons.personId', 'teachers.personId')
      .leftJoin('users', 'users.person', 'teachers.personId')
      .leftJoin('teachers_subject', 'teachers_subject.teacher_id', 'teachers.personId')
      .leftJoin('subjects', 'subjects.subjectId', 'teachers_subject.subject_id')
      .leftJoin('classbook', 'classbook.teacher', 'teachers.personId')
      .leftJoin('absence', 'absence.lesson', 'classbook.cbId')
      .where('teachers.school_id', '=', user.school)
      .select([
        'teachers.personId as teacher_id',
        sql`CONCAT(persons.firstName, ' ', persons.lastName)`.as('full_name'),
        sql`MAX(subjects.label)`.as('subject'),
        sql`0`.as('class_average'),
        sql`COUNT(DISTINCT classbook.groupId)`.as('student_count'),
        sql`CASE WHEN COUNT(DISTINCT classbook.cbId) = 0 THEN 0 ELSE (COUNT(absence.student) * 100.0) / (COUNT(DISTINCT classbook.cbId) * 20) END`.as('absence_in_classes')
      ])
      .groupBy('teachers.personId')
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
    const absenceHeatmapQuery = db.selectFrom('absence')
      .leftJoin('classbook', 'classbook.cbId', 'absence.lesson')
      .leftJoin('groups', 'groups.groupId', 'classbook.groupId')
      .leftJoin('classes', 'classes.classId', 'groups.class')
      .leftJoin('users', 'users.person', 'classes.teacher')
      .where('users.school', '=', user.school)
      .select([sql`DAYOFWEEK(classbook.date)`.as('day'), 'classbook.dayHour as hour', sql`COUNT(*)`.as('count')])
      .groupBy(['day', 'hour'])
      .execute()
      .then(rows => rows.map(row => ({
        day: Number(row.day) - 1,
        hour: row.hour,
        count: Number(row.count)
      })));

    // Top 5 Risk Query (Complex query definition)
    const top5AtRiskQuery = db.selectFrom(
        db.selectFrom('students as s')
            .leftJoin('student_groups as sg', 'sg.student', 's.personId')
            .leftJoin(
                db.selectFrom('classbook as c')
                    .leftJoin(
                        db.selectFrom('absence')
                            .select(['lesson', sql`COUNT(*)`.as('missed')])
                            .groupBy('lesson')
                            .as('a2'), 
                        'a2.lesson', 'c.cbId'
                    )
                    .select([
                        'c.cbId', 
                        'c.groupId', 
                        sql`1`.as('expected'), 
                        sql`COALESCE(a2.missed, 0)`.as('absent')
                    ])
                    .as('a'), 
                'a.groupId', 'sg.groupId'
            )
            .leftJoin(
                db.selectFrom('grades as g')
                    .leftJoin('grades_columns as gc', 'gc.gcId', 'g.columnId')
                    .select([
                        'g.studentId', 
                        sql`SUM(g.mark * gc.weight) / SUM(gc.weight)`.as('weightedAvg')
                    ])
                    .groupBy('g.studentId')
                    .as('g'), 
                'g.studentId', 's.personId'
            )
            .select([
                's.personId',
                's.class', // Nutné pro pozdější join na školu
                sql`CASE WHEN COALESCE(SUM(a.absent), 0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent), 0) / SUM(a.expected) * 40 END`.as('absenceScore'),
                sql`CASE WHEN COALESCE(g.weightedAvg, 0) = 0 THEN 0 ELSE ((COALESCE(g.weightedAvg, 0) - 1) / 4 * 100) * 0.4 END`.as('gradeScore'),
                sql`(CASE WHEN COALESCE(SUM(a.absent), 0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent), 0) / SUM(a.expected) * 40 END + CASE WHEN COALESCE(g.weightedAvg, 0) = 0 THEN 0 ELSE ((COALESCE(g.weightedAvg, 0) - 1) / 4 * 100) * 0.4 END)`.as('riskScore'),
                sql`COALESCE(g.weightedAvg, 0)`.as('avgGrade'),
                sql`CASE WHEN COALESCE(SUM(a.expected), 0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent), 0) / SUM(a.expected) END`.as('absenceRate')
            ])
            .groupBy(['s.personId', 's.class'])
            .as('riskStats')
    )
    .leftJoin('users', 'users.person', 'riskStats.personId')
    .leftJoin('classes', 'classes.classId', 'riskStats.class')
    .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
    .where((eb) => eb.or([
        eb('users.school', '=', user.school),
        eb('scopes.school_id', '=', user.school)
    ]))
    .select([
        'riskStats.personId as student_id',
        'riskStats.absenceScore',
        'riskStats.gradeScore',
        'riskStats.riskScore',
        'riskStats.avgGrade',
        'riskStats.absenceRate'
    ])
    .orderBy('riskStats.riskScore', 'desc')
    .limit(5);

    // Execute Top 5 Students separate promise because formatting depends on it
    const top5StudentsPromise = top5AtRiskQuery.execute().then(async (top5StudentsData) => {
        const studentNames = await format_people_by_ids(top5StudentsData.map((student) => (student.student_id)));
        return top5StudentsData.map((student, index) => ({
            student_id: student.student_id,
            absence_score: student.absenceScore,
            absence_rate: student.absenceRate,
            grade_score: student.gradeScore,
            grade_average: student.avgGrade,
            risk_score: student.riskScore,
            full_name: studentNames[index]
        }));
    });

    // Class Info & Trends
    const classInfoPromise = (async () => {
        const cls = await db.selectFrom('classes')
            .leftJoin('students', (join) => join
                .onRef('students.class', '=', 'classes.classId')
                .on('students.status', '=', 'active')
            )
            .select(['classes.classId', 'classes.prefix', 'classes.suffix', sql<number>`count(students.personId)`.as('studentCount')])
            .where('classes.teacher', '=', user.person)
            .groupBy(['classes.classId', 'classes.prefix', 'classes.suffix'])
            .executeTakeFirst();

        if (!cls) return null;

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const getAbsence = async (start: Date, end: Date) => {
            const res = await db.selectFrom('absence')
                .innerJoin('classbook', 'classbook.cbId', 'absence.lesson')
                .innerJoin('students', 'students.personId', 'absence.student')
                .select(sql<number>`SUM(COALESCE(absence.minutes, 45))`.as('minutes'))
                .where('students.class', '=', cls.classId)
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
            classId: cls.classId,
            className: `${cls.prefix}. ${cls.suffix}`,
            studentCount: Number(cls.studentCount),
            absence: {
                currentMonth: current,
                lastMonth: last,
                trend: current - last
            }
        };
    })();

    // === EXECUTE ALL IN PARALLEL ===
    const [
        totalStudents, limitStudents, averageGrade, absenceRate, atRiskStudents,
        top5Students, classStats, subjectStats, teacherStats, absenceHeatmap, classInfo
    ] = await Promise.all([
        totalStudentsQuery, limitStudentsQuery, averageGradeQuery, absenceRateQuery, atRiskCountQuery,
        top5StudentsPromise, classStatsQuery, subjectStatsQuery, teacherStatsQuery, absenceHeatmapQuery, classInfoPromise
    ]);

    return {
        schoolStats: { totalStudents, limitStudents, averageGrade, absenceRate, atRiskStudents },
        riskStudents: top5Students,
        classStats,
        subjectStats,
        teacherStats,
        absenceHeatmap,
        classInfo
    };
  })
  .get('/admin/management/class/:classId', async ({ user, params }: any) => {
    // Auth Check
    if (!user) return { error: 'no_user', details: 'unauthorized' };
    if (user.manager != -1 && user.isPrincipal == false) return { error: 'no_permission' };
    
    const classId = Number(params.classId);

    // Get Class Details
    const classDetails = await db.selectFrom('classes')
        .leftJoin('school_years', 'school_years.syId', 'classes.yearId')
        .leftJoin('scopes', 'scopes.scopeId', 'classes.scopeId')
        .select([
            'classes.classId',
            'classes.teacher',
            sql<string>`concat(classes.prefix, COALESCE(TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, ''), classes.suffix)`.as('className'),
            'school_years.start' 
        ])
        .where('scopes.school_id', '=', user.school)
        .where('classes.classId', '=', classId)
        .executeTakeFirst();

    if (!classDetails) return { error: 'class_not_found' };

    const teacherName = (await format_people_by_ids([classDetails.teacher]))[0];

    // Group Statistics (active only)
    const groupsStats = await db.selectFrom('groups')
        .innerJoin('classes', 'classes.classId', 'groups.class')
        .innerJoin('school_years', 'school_years.syId', 'groups.year')
        .leftJoin('student_groups', 'student_groups.groupId', 'groups.groupId')
        .leftJoin('classbook', 'classbook.groupId', 'groups.groupId')
        .leftJoin('absence', 'absence.lesson', 'classbook.cbId')
        .leftJoin('grades', 'grades.studentId', 'student_groups.student')
        .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
        .select([
            'groups.groupId',
            'groups.name as groupName',
            'groups.num as groupNum',
            sql<number>`COUNT(DISTINCT student_groups.student)`.as('studentCount'),
            sql<number>`COALESCE(SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight), 0), 0)`.as('averageGrade'),
             sql<number>`CASE WHEN COUNT(DISTINCT classbook.cbId) * COUNT(DISTINCT student_groups.student) = 0 THEN 0 ELSE (COUNT(absence.student) * 100.0) / (COUNT(DISTINCT classbook.cbId) * COUNT(DISTINCT student_groups.student)) END`.as('absenceRate')
        ])
        .where('groups.class', '=', classId)
        .where('school_years.current', '=', true)
        .groupBy(['groups.groupId', 'groups.name', 'groups.num'])
        .execute();

    return {
        classDetails: {
            ...classDetails,
            teacherName
        },
        groupsStats: groupsStats.map(g => ({
            ...g,
            studentCount: Number(g.studentCount),
            averageGrade: Number(g.averageGrade),
            absenceRate: Number(g.absenceRate)
        }))
    };
  });

export default app;
