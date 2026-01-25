import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/marks/teacher/marking_scale_select', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const { ms_id, subject_id, group_id } = body;
    if (ms_id == undefined) return { error: 'invalid_marking_scale_id' };

    if (subject_id == undefined) {
      return { error: 'invalid_subject_id' };
    }

    if (group_id == undefined) {
      return { error: 'invalid_group_id' };
    }

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

    // Verify marking scale exist
    const marking_scale = await db.selectFrom("marking_scales")
    .select(['marking_scales.ms_id'])
    .where('marking_scales.ms_id', '=', ms_id)
    .executeTakeFirst()

    if (!marking_scale) {
        return Response.json({ error: 'invalid_marking_scale' })
    }

    try {
        const updated_at = new Date();

        const update_marking_scale = await db.updateTable("marking_scales_groups")
        .set({
          ms_id,
          updated_at
        })
        .where('group_id', '=', group_id)
        .where('subject_id', '=', subject_id)
        .limit(1)
        .execute()

        return {
            status: true,
            ms_id,
            updated_at
        }
    } catch(e) {
        return { status: false }
    }
   

  }, {
    body: t.Object({
      ms_id: t.Optional(t.Number()),
      subject_id: t.Optional(t.Number()),
      group_id: t.Optional(t.Number()),
    })
  });

export default app;
