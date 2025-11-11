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

    // --- 1️⃣ Celkový počet škál učitele ---
    const totalRowsResult = await db
      .selectFrom('marking_scales')
      .where('teacher_id', '=', auth.person)
      .select(db.fn.count('ms_id').as('total'))
      .executeTakeFirst();

    const totalRows = totalRowsResult ? Number(totalRowsResult.total) : 0;

    // --- 2️⃣ Výchozí škála učitele (pokud existuje) ---
    const defaultScale = await db
      .selectFrom('marking_scales')
      .where('teacher_id', '=', auth.person)
      .where('is_default', '=', true)
      .select([
        'ms_id',
        'name',
        'is_default',
        'grade_1_min',
        'grade_2_min',
        'grade_3_min',
        'grade_4_min',
        'updated_at',
      ])
      .executeTakeFirst();

    // --- 3️⃣ Ostatní škály s počtem použití ---
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
        eb.fn.count('marking_scales_groups.msg_id').as('count_usage'),
      ])
      .where('marking_scales.teacher_id', '=', auth.person)
      .groupBy('marking_scales.ms_id')
      .orderBy('marking_scales.updated_at', 'desc')
      .limit(query.limit ?? 10)
      .offset(query.offset ?? 0)
      .execute();

    const result: any[] = [];

    // pomocná funkce: vytažení nejpoužívanějšího předmětu pro ms_id
    const getMostUsedSubject = async (ms_id: number) => {
      const mostUsed = await db
        .selectFrom('marking_scales_groups')
        .leftJoin('subjects', 'subjects.subjectId', 'marking_scales_groups.subject_id')
        .select((eb) => [
          'marking_scales_groups.subject_id',
          'subjects.label as subject_name',
          eb.fn.count('marking_scales_groups.subject_id').as('count'),
        ])
        .where('ms_id', '=', ms_id)
        .groupBy('subject_id')
        .orderBy(({ eb }) => eb.fn.count('marking_scales_groups.subject_id'), 'desc')
        .limit(1)
        .executeTakeFirst();

      if (!mostUsed) return null;
      return {
        subject_id: mostUsed.subject_id,
        subject_name: mostUsed.subject_name,
        count: Number(mostUsed.count),
      };
    };

    // --- 4️⃣ Přidání výchozí škály jako první (pokud existuje) ---
    if (defaultScale) {
      // spočítat skutečné usage_count pro defaultScale
      const usageRow = await db
        .selectFrom('marking_scales_groups')
        .where('ms_id', '=', defaultScale.ms_id)
        .select(db.fn.count('msg_id').as('total'))
        .executeTakeFirst();

      const usageCount = usageRow ? Number(usageRow.total) : 0;

      const mostUsedSubject = await getMostUsedSubject(defaultScale.ms_id);

      result.push({
        ms_id: defaultScale.ms_id,
        name: defaultScale.name ?? null,
        is_default: Boolean(defaultScale.is_default),
        usage_count: usageCount,
        most_used_subject: mostUsedSubject,
        grades: [
          Number(defaultScale.grade_1_min ?? 0),
          Number(defaultScale.grade_2_min ?? 0),
          Number(defaultScale.grade_3_min ?? 0),
          Number(defaultScale.grade_4_min ?? 0),
          0,
        ],
        last_updated: defaultScale.updated_at,
      });
    }

    // --- 5️⃣ Přidání ostatních škál (bez duplikátu výchozí) ---
    for (const scale of scales) {
      if (defaultScale && scale.ms_id === defaultScale.ms_id) continue; // přeskočit duplikát, pokud byl vložen výchozí

      const mostUsedSubject = await getMostUsedSubject(scale.ms_id);

      result.push({
        ms_id: scale.ms_id,
        name: scale.name ?? null,
        is_default: Boolean(scale.is_default),
        usage_count: Number(scale.count_usage ?? 0),
        most_used_subject: mostUsedSubject,
        grades: [
          Number(scale.grade_1_min ?? 0),
          Number(scale.grade_2_min ?? 0),
          Number(scale.grade_3_min ?? 0),
          Number(scale.grade_4_min ?? 0),
          0,
        ],
        last_updated: scale.updated_at,
      });
    }

    return { total: totalRows, marking_scales: result };
  }, {
    query: t.Object({
      limit: t.Optional(t.Number()),
      offset: t.Optional(t.Number()),
    }),
  });

export default app;
