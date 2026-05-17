import { Elysia, t } from 'elysia';
import moment from 'moment';
import { db } from '../../../../../database';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .post('/marks/student', async ({ cookie, body, query }: any) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .select(['tokens.user_id'])
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
      .where('students.person_id', '=', student_id)
      .limit(1)
      .execute();

    if (!student.length) {
      return Response.json({ error: 'invalid_student' });
    }

    let queryBuilder = db.selectFrom('grades')
      .leftJoin('grades_columns', 'grades_columns.column_id', 'grades.column_id')
      .leftJoin('subjects', 'subjects.subject_id', 'grades_columns.subject_id')
      .leftJoin('persons as teacher', 'teacher.person_id', 'grades.teacher_id')
      .leftJoin('users as teacherUser', 'teacher.person_id', 'teacherUser.person_id')
      .select([
        'grades.mark',
        'grades.column_id',
        'grades.teacher_id',
        'teacher.first_name as teacher_first_name',
        'teacher.last_name as teacher_last_name',
        'teacherUser.avatar',
        'grades_columns.created',
        'grades_columns.topic',
        'grades_columns.weight',
        'grades_columns.max_points',
        'grades_columns.type',
        'grades_columns.column_index',
        'grades_columns.subject_id',
        'grades_columns.group_id',
        'subjects.label as subject_name'
      ])
      .where('grades.student_id', '=', student_id)
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

    const marks_result = await queryBuilder.execute();

    // Map teacher names
    const teacher_ids = Array.from(new Set(marks_result.map(m => m.teacher_id).filter((id): id is number => id !== null)));
    const teacher_names = await format_person_map_by_ids(teacher_ids);

    const marks = marks_result.map(m => ({
        ...m,
        teacher_full_name: m.teacher_id ? teacher_names.get(m.teacher_id) : `${m.teacher_first_name} ${m.teacher_last_name}`
    }));

    const subject_stats: Record<number, { rank: string | null, total_students: number, class_avg: string }> = {};
    const processed_subjects = new Set<number>();

    for (const mark of marks) {
      if (!mark.subject_id || processed_subjects.has(mark.subject_id) || !mark.group_id) continue;
      processed_subjects.add(mark.subject_id);

      const group_grades = await db.selectFrom('grades')
        .leftJoin('grades_columns', 'grades_columns.column_id', 'grades.column_id')
        .select(['grades.student_id', 'grades.mark', 'grades_columns.weight'])
        .where('grades_columns.subject_id', '=', mark.subject_id)
        .where('grades_columns.group_id', '=', mark.group_id)
        .where('grades_columns.type', '=', 0 as any) // Only valid marks
        .where('grades_columns.status', '=', 'active')
        .execute();

      const student_averages: Record<number, { sum: number, weight: number }> = {};
      
      for (const g of group_grades) {
        if (!g.mark && g.mark !== 0) continue;
        const sid = g.student_id;
        if (!student_averages[sid]) student_averages[sid] = { sum: 0, weight: 0 };
        const w = (g.weight || 0) + 1;
        student_averages[sid].sum += Number(g.mark) * w;
        student_averages[sid].weight += w;
      }

      const averages = Object.keys(student_averages).map(sid => {
        const data = student_averages[Number(sid)];
        return {
          student_id: Number(sid),
          avg: data.sum / data.weight
        };
      });

      // Sort ascending because lower mark is better (1 is best, 5 is worst)
      averages.sort((a, b) => a.avg - b.avg);

      // Calculate rank range
      let rank_str: string | null = null;
      const my_data = averages.find(a => a.student_id === student_id);
      
      if (my_data) {
        const val = my_data.avg;
        // Find matching range
        const first = averages.findIndex(a => Math.abs(a.avg - val) < 0.0001);
        let last = first;
        for(let i = first + 1; i < averages.length; i++) {
            if (Math.abs(averages[i].avg - val) < 0.0001) last = i;
            else break;
        }
        
        if (first === last) {
            rank_str = `${first + 1}.`;
        } else {
            rank_str = `${first + 1}. - ${last + 1}.`;
        }
      }

      const total_avg = averages.reduce((sum, a) => sum + a.avg, 0);
      const class_avg = averages.length > 0 ? total_avg / averages.length : 0;

      subject_stats[mark.subject_id] = {
        rank: rank_str,
        total_students: averages.length,
        class_avg: class_avg.toFixed(2)
      };
    }

    // --- Per-Mark Statistics ---
    const mark_stats: Record<number, { rank: string | null, count: number, avg: string }> = {};
    const column_ids = [...new Set(marks.map(m => m.column_id).filter((id): id is number => id !== null))];

    if (column_ids.length > 0) {
      // Fetch all grades for these columns to calculate stats
      const all_column_grades = await db.selectFrom('grades')
        .select(['column_id', 'student_id', 'mark'])
        .where('column_id', 'in', column_ids)
        .execute();

      // Group by column
      const grades_by_column: Record<number, { student_id: number, mark: number }[]> = {};
      for (const g of all_column_grades) {
        if (g.column_id === null) continue;
        if (!grades_by_column[g.column_id!]) grades_by_column[g.column_id!] = [];
        // Ensure mark is treated as number
        grades_by_column[g.column_id].push({ student_id: g.student_id, mark: Number(g.mark) });
      }

      for (const col_id of column_ids) {
        const grades = grades_by_column[col_id];
        if (!grades || grades.length === 0) continue;

        // Calculate average
        const total = grades.reduce((sum, g) => sum + g.mark, 0);
        const avg = total / grades.length;

        // Calculate rank
        const col_info = marks.find(m => m.column_id === col_id);
        const is_points = col_info?.type === 1; // Assuming type 1 = points (higher is better)

        if (is_points) {
           grades.sort((a, b) => b.mark - a.mark); // Descending for points
        } else {
           grades.sort((a, b) => a.mark - b.mark); // Ascending for grades
        }

        let rank_str: string | null = null;
        const my_grade = grades.find(g => g.student_id === student_id);
        
        if (my_grade) {
            const val = my_grade.mark;
            const first = grades.findIndex(g => g.mark === val);
            let last = first;
            for(let i = first + 1; i < grades.length; i++) {
                if (grades[i].mark === val) last = i;
                else break;
            }
            
            if (first === last) {
                rank_str = `${first + 1}.`;
            } else {
                rank_str = `${first + 1}. - ${last + 1}.`;
            }
        }

        mark_stats[col_id] = {
          rank: rank_str,
          count: grades.length,
          avg: avg.toFixed(2)
        };
      }
    }

    // --- Marking Scales ---
    const marking_scales: Record<string, number[]> = {};
    const unique_subject_group = Array.from(new Set(marks.map(m => `${m.subject_id}_${m.group_id}`)));
    
    if (unique_subject_group.length > 0) {
      const default_scale = await db.selectFrom('marking_scales')
        .select(['grade_1_min', 'grade_2_min', 'grade_3_min', 'grade_4_min'])
        .where('is_default', '=', true)
        .executeTakeFirst();
      
      const default_grades = [
        Number(default_scale?.grade_1_min ?? 85),
        Number(default_scale?.grade_2_min ?? 70),
        Number(default_scale?.grade_3_min ?? 50),
        Number(default_scale?.grade_4_min ?? 30),
        0
      ];

      for (const sg of unique_subject_group) {
        const [sid, gid] = sg.split('_').map(Number);
        
        const scale = await db.selectFrom('marking_scales_groups')
          .leftJoin('marking_scales', 'marking_scales.ms_id', 'marking_scales_groups.ms_id')
          .select(['grade_1_min', 'grade_2_min', 'grade_3_min', 'grade_4_min'])
          .where('marking_scales_groups.subject_id', '=', sid)
          .where('marking_scales_groups.group_id', '=', gid)
          .executeTakeFirst();

        if (scale) {
          marking_scales[sg] = [
            Number(scale.grade_1_min),
            Number(scale.grade_2_min),
            Number(scale.grade_3_min),
            Number(scale.grade_4_min),
            0
          ];
        } else {
          marking_scales[sg] = default_grades;
        }
      }
    }

    return Response.json({ status: true, marks, subject_stats, mark_stats, marking_scales });
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
