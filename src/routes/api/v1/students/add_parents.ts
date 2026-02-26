import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { getAuthUser } from '../../../../utils/auth';

const elysiaAp = new Elysia()
  .derive(async ({ cookie }) => ({
    user: await getAuthUser(cookie?.token?.value as string)
  }))

  .post('/parents/add', async({ body, user }) => {
    console.log(user)
    if (!user) return;

    // Check parent - student connection
    const checkParent = await db.selectFrom('family_relations')
    .select([
      'family_relations.target_id'
    ])
    .where('family_relations.source_id', '=', body.student_id)
    .where('family_relations.target_id', 'in', body.parent_ids.map((parent) => (parent.parent_id)))
    .execute();

    const existingParent = checkParent.map((parent) => (parent.target_id));

    const parent = body.parent_ids.filter((parent) => !existingParent.includes(parent.parent_id)).map((parent) => ({
      source_id: body.student_id,
      target_id: parent.parent_id,
      role: parent.role
    })) as any;

    let addParentQuery = await db.insertInto('family_relations')
    .values(parent)
    .executeTakeFirst();

    // student history log
    parent.forEach((parent: any) => {
      console.log(parent)
      db.insertInto('student_history').values({
        student_id: body.student_id,
        teacher_id: Number(user.person_id),
        type: 'added_parent',
        data: JSON.stringify({
          type: parent.role,
          parent_id: parent.target_id
        })
      })
      .execute()
    })

    return Response.json({ success: true });
  }, {
    body: t.Object({
      parent_ids: t.Array(t.Object({
        parent_id: t.Number({ minimum: 0 }),
        role: t.String()
      })),
      student_id: t.Number({
        minimum: 0
      })
    })
  }
);


export default elysiaAp;
