import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';

const app = new Elysia()
  .post('/messages/recipients', async ({ cookie, body }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    const { message_type } = body;
    if (message_type == undefined) return { error: 'invalid_body' };

    try {
        const teachers = await db
        .selectFrom('teachers')
        .leftJoin('persons', 'persons.personId', 'teachers.personId')
        .select([
            'teachers.personId',
            'persons.firstName',
            'persons.lastName'
        ])
        .execute();

        const teacherFullNames = await format_people_by_ids(teachers.map((s) => s.personId));

        const receivers = teachers
        .map((teacher, index) => {
            return {
                person_id: teacher.personId,
                first_name: teacher.firstName || '',
                last_name: teacher.lastName || '',
                full_name: teacherFullNames[index] || '',
            };
        })
        .sort((a, b) => {
            const ln = a.last_name.localeCompare(b.last_name, 'cs');
            if (ln !== 0) return ln;
            return a.first_name.localeCompare(b.first_name, 'cs');
        });

        return receivers;
    } catch(e) {
      return { success: false };
    }
  }, {
    body: t.Object({
      message_type: t.Optional(t.Number())
    }),
  });

export default app;
