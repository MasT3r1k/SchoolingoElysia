import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { MainConfig } from '../../../../config/main.config';
import moment from 'moment';

const app = new Elysia()
  .post('/marks/teacher/group', async ({ cookie, body }: any) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    if (!body?.group_id) return { error: 'invalid_group_id' };
    if (!body?.subject_id) return { error: 'invalid_subject_id' };

    // Get current school year
    const now = moment();
    const currentYear = now.month() >= MainConfig.SEMESTER_START_MONTH ? now.year() : now.year() - 1;

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
      .limit(1)
      .executeTakeFirst();

    if (!auth) return { error: 'no_user', details: 'no_db' };
    if (auth.role != "teacher") return { error: 'no_permission' };

    const students_ids_rows = await db
      .selectFrom('student_groups')
      .leftJoin('users', 'users.person_id', 'student_groups.student_id')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .select(['student_groups.student_id'])
      .where('student_groups.group_id', '=', body.group_id)
      .orderBy('persons.last_name', 'asc')
      .orderBy('persons.first_name', 'asc')
      .execute();

    const student_ids = students_ids_rows.map(row => row.student_id).filter((id): id is number => id !== null);
    const student_names = await format_person_map_by_ids(student_ids);

    const gradeColumns = await db
      .selectFrom('grades_columns')
      .select([
        'column_index',
        'column_id',
        'topic',
        'type',
        'weight',
        'max_points',
        'created'
      ])
      .where('grades_columns.group_id', '=', body.group_id)
      .where('grades_columns.subject_id', '=', body.subject_id)
      .orderBy('column_index')
      .execute();

    let grades: any[] = [];
    if (gradeColumns.length) {
      grades = await db
        .selectFrom('grades')
        .select(['mark', 'student_id', 'column_id'])
        .where('grades.column_id', 'in', gradeColumns.map((c: any) => c.column_id))
        .execute();
    }

    const semester_grades = await db
      .selectFrom('semester_grades')
      .select([
        'semester_grades.student_id',
        'semester_grades.semester as quarter',
        'semester_grades.grade',
        'semester_grades.verbal_assessment',
        'semester_grades.year'
      ])
      .where('semester_grades.student_id', 'in', student_ids)
      .where('semester_grades.subject_id', '=', body.subject_id)
      .where('semester_grades.year', '=', currentYear)
      .execute();

    // Připravíme strukturu pro výsledky
    const columns = gradeColumns.map((c: any) => ({
      column_id: c.column_id,
      topic: c.topic,
      type: c.type,
      weight: c.weight,
      max_points: c.max_points,
      created: c.created,
    }));

    const exemptions = await db
      .selectFrom('student_subject_exemptions')
      .select(['student_id', 'valid_from', 'valid_to', 'note'])
      .where('student_id', 'in', student_ids)
      .where((eb) => eb.or([
        eb('subject_id', '=', body.subject_id),
        eb('subject_id', 'is', null)
      ]))
      .execute();

    const studentsWithMarks = student_ids.map((student_id: number) => {
      const studentMarks = gradeColumns.map((col: any) => {
        const grade = grades.find((g: any) => g.student_id === student_id && g.column_id === col.column_id);
        return grade ? grade.mark : null;
      });

      const exemption = exemptions.find(e => 
        e.student_id === student_id && 
        (!e.valid_from || new Date(e.valid_from) <= new Date()) && 
        (!e.valid_to || new Date(e.valid_to) >= new Date())
      );

      return {
        student_id,
        name: student_names.get(student_id) || '',
        quarters: semester_grades.filter((g: any) => g.student_id === student_id).map((g: any) => ({
          quarter: g.quarter,
          grade: g.grade,
          verbal_assessment: g.verbal_assessment
        })),
        marks: studentMarks,
        is_exempted: !!exemption,
        exemption_note: exemption?.note || null
      };
    });

    let msg = await db
      .selectFrom("marking_scales_groups")
      .select(['ms_id'])
      .where('group_id', '=', body.group_id)
      .where('subject_id', '=', body.subject_id)
      .executeTakeFirst();
      
    let marking_scale = [ MainConfig.MARKING_SCALE[0], MainConfig.MARKING_SCALE[1], MainConfig.MARKING_SCALE[2], MainConfig.MARKING_SCALE[3], 0 ];
    
    if (msg) {
        const scale = await db
          .selectFrom("marking_scales")
          .select([
            'grade_1_min',
            'grade_2_min',
            'grade_3_min',
            'grade_4_min'
          ])
          .where('ms_id', '=', msg.ms_id)
          .executeTakeFirst();
          
        if (scale) {
             marking_scale = [
                Number(scale.grade_1_min ?? MainConfig.MARKING_SCALE[0]),
                Number(scale.grade_2_min ?? MainConfig.MARKING_SCALE[1]),
                Number(scale.grade_3_min ?? MainConfig.MARKING_SCALE[2]),
                Number(scale.grade_4_min ?? MainConfig.MARKING_SCALE[3]),
                0
             ];
        }
    }

    return { columns, students: studentsWithMarks, marking_scale };
  }, {
    body: t.Object({
      group_id: t.Number(),
      subject_id: t.Number(),
    })
  });

export default app;
