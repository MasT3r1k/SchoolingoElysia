import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { MainConfig } from '../../../../config/main.config';

const app = new Elysia()
  .get('/marks/teacher/marking_scale', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const { group_id, subject_id } = query;
    if (group_id == undefined) return { error: 'invalid_group_id' };
    if (subject_id == undefined) return { error: 'invalid_subject_id' };

    // validace tokenu → získání teacher.personId
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
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };
    if (auth.role != "teacher") return { error: 'no_permission' };

    /** 1️⃣ Najdeme MS pro skupinu + předmět */
    let msg = await db
      .selectFrom("marking_scales_groups")
      .select(['ms_id'])
      .where('group_id', '=', group_id)
      .where('subject_id', '=', subject_id)
      .executeTakeFirst();

    /** 2️⃣ Pokud neexistuje → zjisti nebo vytvoř default MS */
    if (!msg) {
      let default_scale = await db
        .selectFrom("marking_scales")
        .select(['ms_id'])
        .where('is_default', '=', true)
        .executeTakeFirst();

      if (!default_scale) {
        const inserted = await db
          .insertInto("marking_scales")
          .values({
            teacher_id: null,
            is_default: true,
            name: null,
            grade_1_min: MainConfig.MARKING_SCALE[0],
            grade_2_min: MainConfig.MARKING_SCALE[1],
            grade_3_min: MainConfig.MARKING_SCALE[2],
            grade_4_min: MainConfig.MARKING_SCALE[3],
            updated_at: new Date()
          })
          .executeTakeFirst();

        default_scale = { ms_id: inserted.insertId as unknown as number };
      }

      await db.insertInto("marking_scales_groups")
        .values({
          ms_id: default_scale.ms_id,
          group_id,
          subject_id,
          updated_at: new Date()
        })
        .execute();

      msg = { ms_id: default_scale.ms_id };
    }

    /** 3️⃣ Načteme detail škály */
    const scale = await db
      .selectFrom("marking_scales")
      .leftJoin("marking_scales_groups", "marking_scales_groups.ms_id", "marking_scales.ms_id")
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
      .where('marking_scales.ms_id', '=', msg.ms_id)
      .groupBy('marking_scales.ms_id')
      .executeTakeFirst();

    if (!scale) return { error: 'not_found' };

    /** 4️⃣ Získáme nejpoužívanější předmět pro tuto škálu */
    const mostUsedSubject = await db
      .selectFrom('marking_scales_groups')
      .leftJoin('subjects', 'subjects.subject_id', 'marking_scales_groups.subject_id')
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

    /** 5️⃣ Vrátíme jednotnou strukturu výstupu */
    return {
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
        Number(scale.grade_1_min ?? MainConfig.MARKING_SCALE[0]),
        Number(scale.grade_2_min ?? MainConfig.MARKING_SCALE[1]),
        Number(scale.grade_3_min ?? MainConfig.MARKING_SCALE[2]),
        Number(scale.grade_4_min ?? MainConfig.MARKING_SCALE[3]),
        0
      ],
      last_updated: scale.updated_at
    }
  }, {
    query: t.Object({
      group_id: t.Optional(t.Number()),
      subject_id: t.Optional(t.Number())
    })
  });

export default app;
