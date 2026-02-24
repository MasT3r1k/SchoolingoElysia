import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"

const elysiaAp = new Elysia()
  .post('/parents/add', async({ body }) => {
    const parent = body.parent_ids.map((parent) => ({
        source_id: body.student_id,
        target_id: parent.parent_id,
        role: parent.role
    })) as any;

    let addParentQuery = db.insertInto('family_relations')
    .values(parent)
    .executeTakeFirst();
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
