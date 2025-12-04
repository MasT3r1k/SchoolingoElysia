import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .get('/dashboard/admin', async ({ cookie }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        'tokens.userId',
        'users.person',
        'users.manager',
        'users.principal'
    ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };
    if (auth.manager != -1 && auth.principal == false) return { error: 'no_permission' };

    // === Count of total students ===
    const totalStudents = await db.selectFrom('students')
    .select([
        sql`COUNT(*)`.as('count')
    ])
    .where('students.status', '=', 'active')
    .executeTakeFirst()
    .then(r => Number(r?.count ?? 0));

    // === Limit students ===
    const limitStudents = await db.selectFrom('schools')
    .select([
        'schools.studentsLimit'
    ])
    .executeTakeFirst()
    .then(r => Number(r?.studentsLimit ?? 0));

    // === Average grade ===
    const averageGrade = await db.selectFrom('grades')
    .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
    .select(
        sql`SUM(grades.mark * grades_columns.weight) / NULLIF(SUM(grades_columns.weight),0) AS weighted_average_grade`
    )
    .where('grades.mark', 'is not', null)
    .executeTakeFirst()
    .then(r => Number(r?.weighted_average_grade ?? 0));

    // === Absence rate ===
    const stats = db
    .selectFrom('classbook as c')
    .leftJoin('student_groups as sg', 'sg.groupId', 'c.groupId')
    .leftJoin(
        db
        .selectFrom('absence')
        .select([
            'lesson',
            sql`COUNT(*)`.as('absent_count'),
        ])
        .groupBy('lesson')
        .as('a'),
        'a.lesson',
        'c.cbId'
    )
    .select([
        'c.cbId',
        sql`COUNT(sg.student)`.as('lesson_expected'),
        sql`COALESCE(a.absent_count, 0)`.as('lesson_absent'),
    ])
    .groupBy('c.cbId')
    .as('stats');

    const absenceRate = await db
    .selectFrom(stats)
    .select(sql`
        SUM(stats.lesson_absent) / SUM(stats.lesson_expected)
        `.as('school_absence_rate'))
    .executeTakeFirst()
    .then(r => Number(r?.school_absence_rate ?? 0));

    const atRiskCountQuery = db
    .selectFrom(
        db
        .selectFrom('students as s')
        // JOIN student_groups → přes studentId
        .leftJoin('student_groups as sg', 'sg.student', 's.personId')
        // JOIN classbook → přes groupId z student_groups
        .leftJoin(
            db
            .selectFrom('classbook as c')
            .leftJoin(
                db
                .selectFrom('absence')
                .select(['lesson', sql`COUNT(*)`.as('missed')])
                .groupBy('lesson')
                .as('a2'),
                'a2.lesson',
                'c.cbId'
            )
            .select([
                'c.cbId',
                'c.groupId',
                sql`1`.as('expected'),
                sql`COALESCE(a2.missed,0)`.as('absent')
            ])
            .as('a'),
            'a.groupId',
            'sg.groupId'
        )
        // JOIN pro známky
        .leftJoin(
            db
            .selectFrom('grades as g')
            .leftJoin('grades_columns as gc', 'gc.gcId', 'g.columnId')
            .select([
                'g.studentId',
                sql`SUM(g.mark * gc.weight) / SUM(gc.weight)`.as('weightedAvg')
            ])
            .groupBy('g.studentId')
            .as('g'),
            'g.studentId',
            's.personId'
        )
        .select([
            's.personId',
            // absenceScore
            sql`
            CASE WHEN COALESCE(SUM(a.absent),0) = 0 THEN 0
                ELSE COALESCE(SUM(a.absent),0) / SUM(a.expected) * 40
            END
            `.as('absenceScore'),
            // gradeScore
            sql`
            CASE WHEN COALESCE(g.weightedAvg,0) = 0 THEN 0
                ELSE ((COALESCE(g.weightedAvg,0) - 1)/4*100)*0.4
            END
            `.as('gradeScore'),
            // riskScore = absence + grade
            sql`
            (CASE WHEN COALESCE(SUM(a.absent),0) = 0 THEN 0 ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)*40 END
            +
            CASE WHEN COALESCE(g.weightedAvg,0) = 0 THEN 0 ELSE ((COALESCE(g.weightedAvg,0)-1)/4*100)*0.4 END)
            `.as('riskScore')
        ])
        .groupBy('s.personId')
        .as('riskStats')
    )
    .where(sql`riskStats.riskScore >= 60`)
    .select(sql`COUNT(*)`.as('atRiskStudents'));


    const atRiskStudents = await atRiskCountQuery
    .executeTakeFirst()
    .then(r => Number(r?.atRiskStudents ?? 0));

    const top5AtRiskQuery = db
  .selectFrom(
    db
      .selectFrom('students as s')
      .leftJoin('student_groups as sg', 'sg.student', 's.personId')
      .leftJoin(
        db
          .selectFrom('classbook as c')
          .leftJoin(
            db
              .selectFrom('absence')
              .select(['lesson', sql`COUNT(*)`.as('missed')])
              .groupBy('lesson')
              .as('a2'),
            'a2.lesson',
            'c.cbId'
          )
          .select([
            'c.cbId',
            'c.groupId',
            sql`1`.as('expected'),
            sql`COALESCE(a2.missed,0)`.as('absent')
          ])
          .as('a'),
        'a.groupId',
        'sg.groupId'
      )
      .leftJoin(
        db
          .selectFrom('grades as g')
          .leftJoin('grades_columns as gc', 'gc.gcId', 'g.columnId')
          .select([
            'g.studentId',
            sql`SUM(g.mark * gc.weight) / SUM(gc.weight)`.as('weightedAvg')
          ])
          .groupBy('g.studentId')
          .as('g'),
        'g.studentId',
        's.personId'
      )
      .select([
        's.personId',
        // absenceScore
        sql`
          CASE WHEN COALESCE(SUM(a.absent),0)=0 THEN 0
               ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)*40
          END
        `.as('absenceScore'),
        // gradeScore
        sql`
          CASE WHEN COALESCE(g.weightedAvg,0)=0 THEN 0
               ELSE ((COALESCE(g.weightedAvg,0)-1)/4*100)*0.4
          END
        `.as('gradeScore'),
        // riskScore = absenceScore + gradeScore
        sql`
          (CASE WHEN COALESCE(SUM(a.absent),0)=0 THEN 0 ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)*40 END
          +
          CASE WHEN COALESCE(g.weightedAvg,0)=0 THEN 0 ELSE ((COALESCE(g.weightedAvg,0)-1)/4*100)*0.4 END)
        `.as('riskScore'),
        // průměrná známka
        sql`COALESCE(g.weightedAvg,0)`.as('avgGrade'),
        // absence rate
        sql`
          CASE WHEN COALESCE(SUM(a.expected),0)=0 THEN 0
               ELSE COALESCE(SUM(a.absent),0)/SUM(a.expected)
          END
        `.as('absenceRate')
      ])
      .groupBy('s.personId')
      .as('riskStats')
  )
  .select([
    sql`riskStats.personId AS student_id`,
    'riskStats.absenceScore',
    'riskStats.gradeScore',
    'riskStats.riskScore',
    'riskStats.avgGrade',
    'riskStats.absenceRate'
  ])
  .orderBy('riskStats.riskScore', 'desc')
  .limit(5);

    const top5StudentsData = await top5AtRiskQuery.execute();
    const studentNames = await format_people_by_ids(top5StudentsData.map((student) => (student.student_id)));

    const top5Students = top5StudentsData.map((student, index) => ({
        student_id: student.student_id,
        absence_score: student.absenceScore,
        absence_rate: student.absenceRate,
        grade_score: student.gradeScore,
        grade_average: student.avgGrade,
        risk_score: student.riskScore,
        full_name: studentNames[index]
    }))

    return {
        schoolStats: {
            totalStudents,
            limitStudents,
            averageGrade,
            absenceRate,
            atRiskStudents
        },
        riskStudents: top5Students
    };
  });

export default app;
