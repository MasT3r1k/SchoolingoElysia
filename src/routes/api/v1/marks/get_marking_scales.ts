import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/marks/teacher/marking_scales', async ({ cookie, query }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    const teacher = await db
      .selectFrom('teachers')
      .select(['teachers.personId'])
      .where('teachers.personId', '=', auth.person)
      .executeTakeFirst();

    if (!teacher) return { error: 'no_permission' };

    // --- 1️⃣ Celkový počet hodnocení učitele ---
    const totalRowsResult = await db
      .selectFrom('marking_scales')
      .where('teacher_id', '=', auth.person)
      .select(db.fn.count('ms_id').as('total'))
      .executeTakeFirst();
    
    const totalRows = totalRowsResult ? Number(totalRowsResult.total) : 0;

    // --- 2️⃣ VYTAŽENÍ HODNOTÍCÍCH ŠKÁL S PAGE ---
    const scales = await db
      .selectFrom('marking_scales')
      .leftJoin('marking_scales_groups', 'marking_scales_groups.ms_id', 'marking_scales.ms_id')
      .select((eb) => [
        'marking_scales.ms_id',
        'marking_scales.name',
        'marking_scales.is_default',
        'marking_scales.grade_1_min',
        'marking_scales.grade_2_min',
        'marking_scales.grade_3_min',
        'marking_scales.grade_4_min',
        'marking_scales.updated_at',
        eb.fn.count('marking_scales_groups.msg_id').as('count_usage')
      ])
      .where('marking_scales.teacher_id', '=', auth.person)
      .groupBy('marking_scales.ms_id')
      .limit(query.limit ?? 10)
      .offset(query.offset ?? 0)
      .execute();

    // --- 3️⃣ ZÍSKÁNÍ NEJČASTĚJŠÍHO PŘEDMĚTU ---
    const result = [];

    for (const scale of scales) {
      const mostUsedSubject = await db
        .selectFrom('marking_scales_groups')
        .leftJoin('subjects', 'subjects.subjectId', 'marking_scales_groups.subject_id')
        .select((eb) => [
          'marking_scales_groups.subject_id',
          'subjects.label as subject_name',
          eb.fn.count('subject_id').as('count')
        ])
        .where('ms_id', '=', scale.ms_id)
        .groupBy('subject_id')
        .orderBy(({ eb }) => eb.fn.count('subject_id'), 'desc')
        .limit(1)
        .executeTakeFirst();

      result.push({
        ms_id: scale.ms_id,
        name: scale.name ?? null,
        is_default: scale.is_default,
        usage_count: Number(scale.count_usage),
        most_used_subject: mostUsedSubject
          ? {
              subject_id: mostUsedSubject.subject_id,
              subject_name: mostUsedSubject.subject_name,
              count: Number(mostUsedSubject.count)
            }
          : null,
        grades: [
          Number(scale.grade_1_min),
          Number(scale.grade_2_min),
          Number(scale.grade_3_min),
          Number(scale.grade_4_min),
          0
        ],
        last_updated: scale.updated_at
      });
    }

    return { total: totalRows, marking_scales: result };
  }, {
    query: t.Object({
      limit: t.Optional(t.Number()),
      offset: t.Optional(t.Number()),
    })
  });

export default app;
