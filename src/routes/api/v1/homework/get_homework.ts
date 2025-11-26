import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
  .get('/homework', async ({ cookie, query }) => {
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
      .select([
        'students.personId',
        ])
      .where('students.personId', '=', auth.person)
      .executeTakeFirst();

    if (!student) return { error: 'no_permission' };

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
    .where('student_homework.student', '=', student.personId)
    .execute();

    return homework;

  });

export default app;
