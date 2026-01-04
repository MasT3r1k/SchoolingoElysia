import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .delete('/marks/teacher/marking_scale', async ({ cookie, query }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const { ms_id } = query;
    if (ms_id == undefined) return { error: 'invalid_marking_scale_id' };

    // validace tokenu → získání teacher.personId
    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        'tokens.userId',
        'users.person',
        'users.role'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };
    if (auth.role != "teacher") return { error: 'no_permission' };

    // ověření, že marking scale existuje
    const marking_scale = await db
      .selectFrom('marking_scales')
      .select(['marking_scales.ms_id', 'marking_scales.is_default'])
      .where('marking_scales.ms_id', '=', ms_id)
      .executeTakeFirst();

    if (!marking_scale) {
      return { error: 'invalid_marking_scale' };
    }

    if (marking_scale.is_default) {
      return { error: 'cant_delete_default_marking_scale' };
    }

    try {
      // zjisti, kolik skupin používá danou škálu
      const usage = await db
        .selectFrom('marking_scales_groups')
        .select(db.fn.countAll().as('count'))
        .where('ms_id', '=', ms_id)
        .executeTakeFirst();

      const usage_count = Number(usage?.count ?? 0);

      if (usage_count > 1) {
        return { error: 'in_use_by_multiple_groups', details: usage_count };
      }

      if (usage_count === 1) {
        // najdi výchozí škálu
        const default_scale = await db
          .selectFrom('marking_scales')
          .select(['ms_id'])
          .where('is_default', '=', true)
          .executeTakeFirst();

        if (!default_scale) {
          return { error: 'no_default_marking_scale' };
        }

        // přepni skupinu na defaultní škálu
        await db
          .updateTable('marking_scales_groups')
          .set({
            ms_id: default_scale.ms_id,
            updated_at: new Date(),
          })
          .where('ms_id', '=', ms_id)
          .execute();
      }

      // smaž škálu
      await db
        .deleteFrom('marking_scales')
        .where('ms_id', '=', ms_id)
        .execute();

      return {
        status: true,
        deleted_id: ms_id,
        replaced_with_default: usage_count === 1,
      };
    } catch (e) {
      console.error(e);
      return { status: false, error: 'db_delete_failed' };
    }
  }, {
    query: t.Object({
      ms_id: t.Number(),
    })
  });

export default app;
