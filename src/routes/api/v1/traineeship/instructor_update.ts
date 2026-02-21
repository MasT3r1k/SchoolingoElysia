import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';

const app = new Elysia()
  .post(
    '/traineeship/instructor_update',
    async ({ body, cookie }) => {
      const token = cookie.token?.value as string;

      if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
      }

      const auth = await db
        .selectFrom('tokens')
        .leftJoin('users', 'tokens.user_id', 'users.user_id')
        .select(['tokens.user_id', 'users.person_id', 'users.role'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst();

      if (!auth) {
        return Response.json({ error: 'no_user', details: 'no_db' });
      }

      // Check permissions
      if (auth.role !== 'admin_staff' && auth.role !== 'management') {
          return Response.json({ error: 'permission_denied' });
      }

      const { instructorId, firstname, lastname, email, phone, role, status } = body;

      if (!instructorId) {
        return Response.json({ error: 'invalid_instructor_id' });
      }

      try {
        await db
          .updateTable('traineeship_instructors')
          .set({
            first_name,
            lastname,
            email,
            phone,
            role,
            status: status as "active" | "deleted",
            last_updated: moment().toDate()
          })
          .where('instructor_id', '=', instructorId)
          .execute();

        return Response.json({ status: 'success' });
      } catch (e: any) {
        console.error(e);
        return Response.json({ status: 'error', error: e.message });
      }
    },
    {
      body: t.Object({
        instructorId: t.Number(),
        firstname: t.String(),
        lastname: t.String(),
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        role: t.Optional(t.String()),
        status: t.Optional(t.String())
      }),
    },
  );

export default app;
