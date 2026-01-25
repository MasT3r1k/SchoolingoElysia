import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .post('/traineeship/instructor_new', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const { company_id, firstname, lastname, email, phone, role } = body;
    if (company_id == undefined) return { error: 'invalid_company_id' };

    if (firstname == undefined) return { error: 'invalid_firstname' }
    if (lastname == undefined) return { error: 'invalid_lastname' }

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
      const newInstructor: any = {
          companyId: company_id,
          firstname,
          lastname,
          email,
          phone,
          role,
          status: 'active',
          addedBy: auth.person,
          created: new Date(),
          last_updated: new Date()
        }
        const new_instructor = await db.insertInto("traineeship_instructors")
        .values(newInstructor)
        .executeTakeFirst();

        return {
            status: true,
            instructor: {
              ...newInstructor,
              name: `${newInstructor.firstname} ${newInstructor.lastname}`,
              instructorId: Number(new_instructor.insertId),
            }
        };
    } catch(e) {
        return { status: false };
    }
  }, {
    body: t.Object({
      company_id: t.Optional(t.Number()),
      firstname: t.Optional(t.String()),
      lastname: t.Optional(t.String()),
      email: t.Optional(t.Nullable(t.String())),
      phone: t.Optional(t.Nullable(t.String())),
      role: t.Optional(t.Nullable(t.String())),
    })
  });

export default app;
