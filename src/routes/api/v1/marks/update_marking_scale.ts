import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/marks/teacher/marking_scale', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const { ms_id, name, grades } = body;
    if (ms_id == undefined) return { error: 'invalid_marking_scale_id' };

    if (!grades || grades.length != 5) {
        return { error: 'invalid_grades' };
    }

    if (!(
            grades[0] > grades[1]
        &&  grades[1] > grades[2]
        &&  grades[2] > grades[3]
        &&  grades[3] > grades[4]
    )) {
        return { error: 'invalid_grades' };
    }

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

        const update_marking_scale = await db.updateTable("marking_scales")
        .set({
            name,
            grade_1_min: grades[0],
            grade_2_min: grades[1],
            grade_3_min: grades[2],
            grade_4_min: grades[3],
            updated_at
        })
        .where('ms_id', '=', ms_id)
        .limit(1)
        .execute()

        return {
            status: true,
            ms_id,
            name,
            grades: grades.map((grade) => Number(grade)),
            updated_at
        }
    } catch(e) {
        return { status: false }
    }
   

  }, {
    body: t.Object({
      ms_id: t.Optional(t.Number()),
      name: t.Optional(t.Nullable(t.String())),
      grades: t.Optional(t.Array(t.Number({ minimum: 0, maximum: 100 }))),
    })
  });

export default app;
