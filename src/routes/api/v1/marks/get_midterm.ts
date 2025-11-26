import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/marks/midterm', async ({ cookie, query }) => {
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

    const student = await db
      .selectFrom('students')
      .leftJoin('classes', 'classes.classId', 'students.class')
      .select([
        'students.personId',
        'classes.scopeId'
        ])
      .where('students.personId', '=', auth.person)
      .executeTakeFirst();

    if (!student) return { error: 'no_permission' };

    const scopesSubjects = await db.selectFrom('scopes_subjects')
    .select([
        'scopes_subjects.subject_id',
        'scopes_subjects.is_mandatory'
    ])
    .where('scopes_subjects.scope_id', '=', student.scopeId)
    .execute();

  });

export default app;
