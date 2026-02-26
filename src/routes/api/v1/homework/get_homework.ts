import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/homework', async ({ cookie, query }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    if (query.student_id == undefined) {
      return Response.json({ error: 'invalid_query' }, { status: 400 })
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    const student = await db
      .selectFrom('students')
      .select([
        'students.person_id',
        ])
      .where('students.person_id', '=', auth.person_id)
      .executeTakeFirst();

    const parent = await db
    .selectFrom('family_relations')
    .select([
      'family_relations.family_relation_id'
    ])
    .where('family_relations.source_id', '=', query.student_id)
    .where('family_relations.target_id', '=', auth.person_id)
    .executeTakeFirst();

    if (!student && !parent) return { error: 'no_permission' };

    const homework = await db.selectFrom('student_homework')
    .leftJoin('homework', 'homework.homework_id', 'student_homework.homework_id')
    .leftJoin('subjects', 'subjects.subject_id', 'homework.subject_id')
    .select([
        'homework.homework_id',
        'homework.assigned_at',
        'homework.due_date',
        'homework.headline',
        'homework.homework',
        'homework.type',
        'subjects.subject_id',
        'subjects.label as subjectName',
        'subjects.shortcut as subjectShort',
        'student_homework.submitted',
        'student_homework.finished',
    ])
    .where('student_homework.student_id', '=', query.student_id)
    .execute();

    return homework;
  }, { query: t.Object({
    student_id: t.Optional(t.Number())
  })});

export default app;
