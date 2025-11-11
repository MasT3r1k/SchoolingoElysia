import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/marks/teacher/marking_scale_create', async ({ cookie, body }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const { name, grades } = body;

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
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth) return { error: 'no_user', details: 'no_db' };

    const teacher = await db
      .selectFrom('teachers')
      .select(['teachers.personId'])
      .where('teachers.personId', '=', auth.person)
      .executeTakeFirst();

    if (!teacher) return { error: 'no_permission' };

    // Verify marking scale exist
    try {
      const updated_at = new Date();

      const new_marking_scale = await db.insertInto("marking_scales")
      .values({
        teacher_id: auth.person || null,
        is_default: false,
        name: name == "" ? null : name,
        grade_1_min: grades[0],
        grade_2_min: grades[1],
        grade_3_min: grades[2],
        grade_4_min: grades[3],
        updated_at
      })
      .executeTakeFirst()

      return {
        status: true,
        marking_scale: {
          ms_id: Number(new_marking_scale.insertId),
          name: name == "" ? null : name,
          grades,
          is_default: false,
          last_updated: updated_at
        }
      };
    } catch(e) {
      return { status: false }
    }
   

  }, {
    body: t.Object({
      name: t.Optional(t.Nullable(t.String())),
      grades: t.Optional(t.Array(t.Number({ minimum: 0, maximum: 100 }))),
    })
  });

export default app;
