import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/marks/student', async ({ cookie, body, query }) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .select(['tokens.userId'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    const { student_id } = body;
    if (!student_id || typeof student_id !== 'number') {
      return Response.json({ error: 'invalid_student_id' });
    }

    const student = await db.selectFrom('students')
      .select(['students.status'])
      .where('students.personId', '=', student_id)
      .limit(1)
      .execute();

    if (!student.length) {
      return Response.json({ error: 'invalid_student' });
    }

    let queryBuilder = db.selectFrom('grades')
      .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
      .leftJoin('subjects', 'subjects.subjectId', 'grades_columns.subjectId')
      .leftJoin('persons as teacher', 'teacher.personId', 'grades.teacherId')
      .select([
        'grades.mark',
        'grades.columnId',
        'grades.teacherId',
        'teacher.firstName as teacherFirst',
        'teacher.lastName as teacherLast',
        'grades_columns.created',
        'grades_columns.topic',
        'grades_columns.weight',
        'grades_columns.type',
        'grades_columns.columnIndex',
        'grades_columns.subjectId',
        'grades_columns.groupId',
        'subjects.label as subjectName'
      ])
      .where('grades.studentId', '=', student_id)
      .where('grades_columns.status', '=', 'active')
      .orderBy('grades_columns.created', 'desc')

    // Použij limit pouze pokud je > 0
    if (query?.limit && query.limit > 0) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    // Offset použij vždy, ale jen pokud existuje
    if (query?.offset) {
      queryBuilder = queryBuilder.offset(query.offset);
    }

    const marks = await queryBuilder.execute();

    const subjectStats: Record<number, { rank: string | null, totalStudents: number, classAvg: string }> = {};
    const processedSubjects = new Set<number>();

    for (const mark of marks) {
      if (!mark.subjectId || processedSubjects.has(mark.subjectId) || !mark.groupId) continue;
      processedSubjects.add(mark.subjectId);

      const groupGrades = await db.selectFrom('grades')
        .leftJoin('grades_columns', 'grades_columns.gcId', 'grades.columnId')
        .select(['grades.studentId', 'grades.mark', 'grades_columns.weight'])
        .where('grades_columns.subjectId', '=', mark.subjectId)
        .where('grades_columns.groupId', '=', mark.groupId)
        .where('grades_columns.type', '=', 0) // Only valid marks
        .where('grades_columns.status', '=', 'active')
        .execute();

      const studentAverages: Record<number, { sum: number, weight: number }> = {};
      
      for (const g of groupGrades) {
        if (!g.mark && g.mark !== 0) continue;
        const sid = g.studentId;
        if (!studentAverages[sid]) studentAverages[sid] = { sum: 0, weight: 0 };
        const w = (g.weight || 0) + 1;
        studentAverages[sid].sum += Number(g.mark) * w;
        studentAverages[sid].weight += w;
      }

      const averages = Object.keys(studentAverages).map(sid => {
        const data = studentAverages[Number(sid)];
        return {
          studentId: Number(sid),
          avg: data.sum / data.weight
        };
      });

      // Sort ascending because lower mark is better (1 is best, 5 is worst)
      averages.sort((a, b) => a.avg - b.avg);

      
      // Calculate rank range
      let rankStr: string | null = null;
      const myData = averages.find(a => a.studentId === student_id);
      
      if (myData) {
        const val = myData.avg;
        // Find matching range
        const first = averages.findIndex(a => Math.abs(a.avg - val) < 0.0001);
        let last = first;
        for(let i = first + 1; i < averages.length; i++) {
            if (Math.abs(averages[i].avg - val) < 0.0001) last = i;
            else break;
        }
        
        if (first === last) {
            rankStr = `${first + 1}.`;
        } else {
            rankStr = `${first + 1}. - ${last + 1}.`;
        }
      }

      const totalAvg = averages.reduce((sum, a) => sum + a.avg, 0);
      const classAvg = averages.length > 0 ? totalAvg / averages.length : 0;

      subjectStats[mark.subjectId] = {
        rank: rankStr,
        totalStudents: averages.length,
        classAvg: classAvg.toFixed(2)
      };
    }

    // --- Per-Mark Statistics ---
    const markStats: Record<number, { rank: string | null, count: number, avg: string }> = {};
    const columnIds = [...new Set(marks.map(m => m.columnId).filter(id => id !== null))];

    if (columnIds.length > 0) {
      // Fetch all grades for these columns to calculate stats
      // Note: We need to perform this potentially heavy query. 
      // Optimization: filter by valid marks only? Assuming all in grades table are valid or check mark value
      const allColumnGrades = await db.selectFrom('grades')
        .select(['columnId', 'studentId', 'mark'])
        .where('columnId', 'in', columnIds)
        .execute();

      // Group by column
      const gradesByColumn: Record<number, { studentId: number, mark: number }[]> = {};
      for (const g of allColumnGrades) {
        if (!gradesByColumn[g.columnId]) gradesByColumn[g.columnId] = [];
        // Ensure mark is treated as number
        gradesByColumn[g.columnId].push({ studentId: g.studentId, mark: Number(g.mark) });
      }

      for (const colId of columnIds) {
        const grades = gradesByColumn[colId];
        if (!grades || grades.length === 0) continue;

        // Calculate average
        const total = grades.reduce((sum, g) => sum + g.mark, 0);
        const avg = total / grades.length;

        // Calculate rank
        // Sort grades (ascending: 1 is best)
        // If sorting logic depends on 'type' (points vs marks), we might need extended logic.
        // Assuming standard marks 1-5 for now or points where Higher is better?
        // Standard Schoolingo: 1-5 (Lower is better), Points (Higher is better).
        // Check column type from 'marks' array (we have it in initial query).
        const colInfo = marks.find(m => m.columnId === colId);
        const isPoints = colInfo?.type === 1; // Assuming type 1 = points (higher is better)

        if (isPoints) {
           grades.sort((a, b) => b.mark - a.mark); // Descending for points
        } else {
           grades.sort((a, b) => a.mark - b.mark); // Ascending for grades
        }

        let rankStr: string | null = null;
        const myGrade = grades.find(g => g.studentId === student_id);
        
        if (myGrade) {
            const val = myGrade.mark;
            const first = grades.findIndex(g => g.mark === val);
            let last = first;
            for(let i = first + 1; i < grades.length; i++) {
                if (grades[i].mark === val) last = i;
                else break;
            }
            
            if (first === last) {
                rankStr = `${first + 1}.`;
            } else {
                rankStr = `${first + 1}. - ${last + 1}.`;
            }
        }

        markStats[colId] = {
          rank: rankStr,
          count: grades.length,
          avg: avg.toFixed(2)
        };
      }
    }

    return Response.json({ status: true, marks, subjectStats, markStats });
  }, {
    body: t.Object({
      student_id: t.Optional(t.Number()),
    }),
    query: t.Optional(t.Object({
      limit: t.Number({ default: 0 }),
      offset: t.Number({ default: 0 }),
    })),
  });

export default app;
