import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/marks/teacher/marking_scales', async ({ cookie, query }: any) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

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

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };
    if (auth.role != "teacher") return { error: 'no_permission' };

    // --- 1️⃣ Celkový počet škál učitele ---
    const total_rows_result = await db
      .selectFrom('marking_scales')
      .where('teacher_id', '=', auth.person_id)
      .select(db.fn.count('ms_id').as('total'))
      .executeTakeFirst();

    const total_rows = total_rows_result ? Number(total_rows_result.total) : 0;

    // --- 2️⃣ Výchozí škála učitele (pokud existuje) ---
    const default_scale = await db
      .selectFrom('marking_scales')
      .where('teacher_id', '=', auth.person_id)
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
      .where('marking_scales.teacher_id', '=', auth.person_id)
      .groupBy('marking_scales.ms_id')
      .orderBy('marking_scales.updated_at', 'desc')
      .limit(query.limit ?? 10)
      .offset(query.offset ?? 0)
      .execute();

    const result: any[] = [];

    // pomocná funkce: vytažení nejpoužívanějšího předmětu pro ms_id
    const getMostUsedSubject = async (ms_id: number) => {
      const most_used = await db
        .selectFrom('marking_scales_groups')
        .leftJoin('subjects', 'subjects.subject_id', 'marking_scales_groups.subject_id')
        .select((eb) => [
          'marking_scales_groups.subject_id',
          'subjects.label as subject_name',
          eb.fn.count('marking_scales_groups.subject_id').as('count'),
        ])
        .where('ms_id', '=', ms_id)
        .groupBy('marking_scales_groups.subject_id')
        .orderBy(({ eb }) => eb.fn.count('marking_scales_groups.subject_id'), 'desc')
        .limit(1)
        .executeTakeFirst();

      if (!most_used) return null;
      return {
        subject_id: most_used.subject_id,
        subject_name: most_used.subject_name,
        count: Number(most_used.count),
      };
    };

    // --- 4️⃣ Přidání výchozí škály jako první (pokud existuje) ---
    if (default_scale) {
      // spočítat skutečné usage_count pro defaultScale
      const usage_row = await db
        .selectFrom('marking_scales_groups')
        .where('ms_id', '=', default_scale.ms_id)
        .select(db.fn.count('msg_id').as('total'))
        .executeTakeFirst();

      const usage_count = usage_row ? Number(usage_row.total) : 0;

      const most_used_subject = await getMostUsedSubject(default_scale.ms_id);

      result.push({
        ms_id: default_scale.ms_id,
        name: default_scale.name ?? null,
        is_default: Boolean(default_scale.is_default),
        usage_count,
        most_used_subject,
        grades: [
          Number(default_scale.grade_1_min ?? 0),
          Number(default_scale.grade_2_min ?? 0),
          Number(default_scale.grade_3_min ?? 0),
          Number(default_scale.grade_4_min ?? 0),
          0,
        ],
        last_updated: default_scale.updated_at,
      });
    }

    // --- 5️⃣ Přidání ostatních škál (bez duplikátu výchozí) ---
    for (const scale of scales) {
      if (default_scale && scale.ms_id === default_scale.ms_id) continue; // přeskočit duplikát, pokud byl vložen výchozí

      const most_used_subject = await getMostUsedSubject(scale.ms_id);

      result.push({
        ms_id: scale.ms_id,
        name: scale.name ?? null,
        is_default: Boolean(scale.is_default),
        usage_count: Number(scale.count_usage ?? 0),
        most_used_subject,
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

    return { total: total_rows, marking_scales: result };
  }, {
    query: t.Object({
      limit: t.Optional(t.Number()),
      offset: t.Optional(t.Number()),
    }),
  });

export default app;
