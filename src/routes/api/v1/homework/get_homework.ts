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

    // Security check
    let hasAccess = false;

    // Is it the student themselves?
    if (Number(query.student_id) === auth.person_id) {
        hasAccess = true;
    } else {
        // Is it a parent of this student?
        const parent = await db
            .selectFrom('family_relations')
            .select(['family_relation_id'])
            .where('source_id', '=', query.student_id)
            .where('target_id', '=', auth.person_id)
            .executeTakeFirst();
        
        if (parent) hasAccess = true;
        else {
            // Is it a teacher?
            const teacher = await db
                .selectFrom('teachers')
                .select(['person_id'])
                .where('person_id', '=', auth.person_id)
                .executeTakeFirst();
            if (teacher) hasAccess = true;
        }
    }

    if (!hasAccess) return { error: 'no_permission' };

    const homework = await db.selectFrom('student_homework')
    .leftJoin('homework', 'homework.homework_id', 'student_homework.homework_id')
    .leftJoin('subjects', 'subjects.subject_id', 'homework.subject_id')
    .select([
        'homework.homework_id',
        'homework.assigned_at',
        'homework.due_date',
        'homework.headline',
        'homework.homework',
        'student_homework.type',
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
  })})
  .put('/homework/:id/status', async ({ cookie, params, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    await db.updateTable('student_homework')
      .set({ type: body.type })
      .where('homework_id', '=', Number(params.id))
      .where('student_id', '=', auth.person_id)
      .execute();

    return { status: 'success' };
  }, {
    body: t.Object({
      type: t.Number()
    })
  })
  .post('/homework/submit', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select(['tokens.user_id', 'users.person_id'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

    await db.updateTable('student_homework')
      .set({ 
        submitted: true, 
        finished: true,
        type: 2 // Odevzdáno
      })
      .where('homework_id', '=', body.homework_id)
      .where('student_id', '=', auth.person_id)
      .execute();

    return { status: 'success' };
  }, {
    body: t.Object({
      homework_id: t.Number(),
      student_id: t.Number(),
      content: t.Optional(t.String())
    })
  });

export default app;
