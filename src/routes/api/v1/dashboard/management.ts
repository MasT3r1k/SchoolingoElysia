import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .get('/dashboard/admin', async ({ user }) => {
    // Auth Check
    if (!user) return { error: 'no_user', details: 'unauthorized' };
    
    // Permission Check: User must either Not have a manager (manager == -1) AND NOT be principal? 
    // Preserving original logic: if (manager != -1 && principal == false) ERROR.
    // Meaning: You must be Principal OR Independent (No Manager, -1).
    if (user.manager != -1 && user.isPrincipal == false) return { error: 'no_permission' };

    // === Define Queries ===
    
    // Total students
    const totalStudentsQuery = db.selectFrom('students')
        .select([sql`COUNT(*)`.as('count')])
        .where('students.status', '=', 'active')
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0));

    // Limit students
    const limitStudentsQuery = db.selectFrom('schools')
        .select(['schools.studentsLimit'])
        .executeTakeFirst()
        .then(r => Number(r?.studentsLimit ?? 0));

    // Average grade
    const averageGradeQuery = db.selectFrom('grades')
        .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
        .select(sql<number>`SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight),0)`.as('weighted_average_grade'))
        .where('grades.mark', 'is not', null)
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
        .select(['s.personId',
            sql`CASE WHEN COALESCE(SUM(a.absent),0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent),0) / SUM(a.expected) * 40 END`.as('absenceScore'),
            sql`CASE WHEN COALESCE(g.weightedAvg,0) = 0 THEN 0 ELSE ((COALESCE(g.weightedAvg,0) - 1)/4*100)*0.4 END`.as('gradeScore'),
            sql`(CASE WHEN COALESCE(SUM(a.absent),0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)*40 END + CASE WHEN COALESCE(g.weightedAvg,0) = 0 THEN 0 ELSE ((COALESCE(g.weightedAvg,0)-1)/4*100)*0.4 END)`.as('riskScore')
        ])
        .groupBy('s.personId').as('riskStats')
    )
    .where(sql<boolean>`riskStats.riskScore >= 60`)
    .select(sql<number>`COUNT(*)`.as('atRiskStudents'))
    .executeTakeFirst()
    .then(r => Number(r?.atRiskStudents ?? 0));

    // Class Stats
    const classStatsQuery = db.selectFrom('groups')
      .leftJoin('student_groups', 'student_groups.groupId', 'groups.groupId')
      .leftJoin('classbook', 'classbook.groupId', 'groups.groupId')
      .leftJoin('absence', 'absence.lesson', 'classbook.cbId')
      .leftJoin('grades', 'grades.studentId', 'student_groups.student')
      .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
      .select([
        'groups.groupId as class_id',
        'groups.name as class_name',
        sql`COUNT(DISTINCT student_groups.student)`.as('student_count'),
        sql`COALESCE(SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight), 0), 0)`.as('average_grade'),
        sql`CASE WHEN COUNT(DISTINCT classbook.cbId) * COUNT(DISTINCT student_groups.student) = 0 THEN 0 ELSE (COUNT(absence.student) * 100.0) / (COUNT(DISTINCT classbook.cbId) * COUNT(DISTINCT student_groups.student)) END`.as('absence_rate'),
        sql`'stable'`.as('trend')
      ])
      .where('groups.year', '=', 1)
      .groupBy('groups.groupId')
      .execute()
      .then(rows => rows.map(row => ({
        class_id: row.class_id,
        class_name: row.class_name,
        student_count: Number(row.student_count),
        average_grade: Number(row.average_grade),
        absence_rate: Number(row.absence_rate),
        trend: row.trend as 'up' | 'down' | 'stable'
      })));

    // Subject Stats
    const subjectStatsQuery = db.selectFrom('subjects')
      .leftJoin('grades_columns', 'grades_columns.subjectId', 'subjects.subjectId')
      .leftJoin('grades', 'grades.columnId', 'grades_columns.gcId')
      .leftJoin('teachers_subject', 'teachers_subject.subject_id', 'subjects.subjectId')
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
      .innerJoin('persons', 'persons.personId', 'teachers.personId')
      .leftJoin('teachers_subject', 'teachers_subject.teacher_id', 'teachers.personId')
      .leftJoin('subjects', 'subjects.subjectId', 'teachers_subject.subject_id')
      .leftJoin('classbook', 'classbook.teacher', 'teachers.personId')
      .leftJoin('absence', 'absence.lesson', 'classbook.cbId')
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
      .innerJoin('classbook', 'classbook.cbId', 'absence.lesson')
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
            .leftJoin(db.selectFrom('absence').select(['lesson', sql`COUNT(*)`.as('missed')]).groupBy('lesson').as('a2'), 'a2.lesson', 'c.cbId')
            .select(['c.cbId', 'c.groupId', sql`1`.as('expected'), sql`COALESCE(a2.missed,0)`.as('absent')])
            .as('a'), 'a.groupId', 'sg.groupId'
       )
       .leftJoin(
            db.selectFrom('grades as g')
            .leftJoin('grades_columns as gc', 'gc.gcId', 'g.columnId')
            .select(['g.studentId', sql`SUM(g.mark * gc.weight) / SUM(gc.weight)`.as('weightedAvg')])
            .groupBy('g.studentId').as('g'), 'g.studentId', 's.personId'
       )
       .select(['s.personId',
         sql`CASE WHEN COALESCE(SUM(a.absent),0)=0 THEN 0 ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)*40 END`.as('absenceScore'),
         sql`CASE WHEN COALESCE(g.weightedAvg,0)=0 THEN 0 ELSE ((COALESCE(g.weightedAvg,0)-1)/4*100)*0.4 END`.as('gradeScore'),
         sql`(CASE WHEN COALESCE(SUM(a.absent),0)=0 THEN 0 ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)*40 END + CASE WHEN COALESCE(g.weightedAvg,0)=0 THEN 0 ELSE ((COALESCE(g.weightedAvg,0)-1)/4*100)*0.4 END)`.as('riskScore'),
         sql`COALESCE(g.weightedAvg,0)`.as('avgGrade'),
         sql`CASE WHEN COALESCE(SUM(a.expected),0)=0 THEN 0 ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected) END`.as('absenceRate')
       ])
       .groupBy('s.personId')
       .as('riskStats')
    )
    .select([
        sql<number>`riskStats.personId`.as('student_id'),
        'riskStats.absenceScore', 'riskStats.gradeScore', 'riskStats.riskScore', 'riskStats.avgGrade', 'riskStats.absenceRate'
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

    // === EXECUTE ALL IN PARALLEL ===
    const [
        totalStudents, limitStudents, averageGrade, absenceRate, atRiskStudents,
        top5Students, classStats, subjectStats, teacherStats, absenceHeatmap
    ] = await Promise.all([
        totalStudentsQuery, limitStudentsQuery, averageGradeQuery, absenceRateQuery, atRiskCountQuery,
        top5StudentsPromise, classStatsQuery, subjectStatsQuery, teacherStatsQuery, absenceHeatmapQuery
    ]);

    return {
        schoolStats: { totalStudents, limitStudents, averageGrade, absenceRate, atRiskStudents },
        riskStudents: top5Students,
        classStats,
        subjectStats,
        teacherStats,
        absenceHeatmap
    };
  });

export default app;
