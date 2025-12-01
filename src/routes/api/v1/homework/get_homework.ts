import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/homework', async ({ cookie, query }) => {
    const token = cookie.token?.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    if (query.student_id == undefined) {
      return Response.json({ error: 'invalid_query' }, { status: 400 })
    }

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
      .select([
        'students.personId',
        ])
      .where('students.personId', '=', auth.person)
      .executeTakeFirst();

    const parent = await db
    .selectFrom('family_relations')
    .select([
      'family_relations.frId'
    ])
    .where('family_relations.source', '=', auth.person)
    .where('family_relations.target', '=', query.student_id)
    .executeTakeFirst();

    if (!student && !parent) return { error: 'no_permission' };

    const homework = await db.selectFrom('student_homework')
    .leftJoin('homework', 'homework.homeworkId', 'student_homework.homework')
    .leftJoin('subjects', 'subjects.subjectId', 'homework.subjectId')
    .select([
        'homework.homeworkId',
        'homework.assigned_at',
        'homework.due_date',
        'homework.headline',
        'homework.homework',
        'homework.type',
        'subjects.subjectId',
        'subjects.label as subjectName',
        'subjects.shortcut as subjectShort',
        'student_homework.submitted',
        'student_homework.finished',
    ])
    .where('student_homework.student', '=', query.student_id)
    .execute();

    return homework;
  }, { query: t.Object({
    student_id: t.Optional(t.Number())
  })});

export default app;
