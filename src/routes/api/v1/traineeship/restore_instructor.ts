import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/traineeship/instructor_restore', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const { company_id, instructor_id } = body;
    if (company_id == undefined) return { error: 'invalid_company_id' };

    if (instructor_id == undefined) return { error: 'invalid_instructor_id' }

    // validace tokenu → získání teacher.personId
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

    try {
        const update_instructor = await db.updateTable("traineeship_instructors")
        .set('status', 'active')
        .where('companyId', '=', company_id)
        .where('instructorId', '=', instructor_id)
        .limit(1)
        .executeTakeFirst();

        return {
            status: true,
            company_id,
            instructor_id,
        };
    } catch(e) {
        return { status: false };
    }
  }, {
    body: t.Object({
      company_id: t.Optional(t.Number()),
      instructor_id: t.Optional(t.Number()),
    })
  });

export default app;
