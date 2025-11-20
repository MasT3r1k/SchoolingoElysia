import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  .use(rateLimit({
    scoping: "scoped",
    max: 10,
    duration: 1000,
    injectServer: () => app.server
  }))
  .get('/classbook/homework', async ({ cookie, query }) => {
    // === AUTH ===
    const token = cookie.token.value;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.userId', 'tokens.userId')
      .innerJoin("passwords", "passwords.passwordId", "users.password")
      .select([
        'users.userId',
        'users.username',
        'users.person',
        'users.2fa',
        'users.2fa_secret',
        'passwords.password'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!user) return { error: 'no_user', details: 'no_db' };

    // === TEACHER PERMISSION ===
    const perm = await db.selectFrom('teachers')
      .select(['teachers.personId'])
      .where('personId', '=', user.person)
      .executeTakeFirst();

    if (!perm) return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { subjectId, groupId } = query;
    if (subjectId == undefined || groupId == undefined) return { error: 'bad_query' };

    // === NAČTENÍ DOMÁCÍCH ÚKOL ===
    const homework = await db.selectFrom('homework')
    .select([
        'homework.homeworkId',
        'homework.homework',
        'homework.assigned_at',
        'homework.due_date',
        'homework.type'
    ])
    .where('homework.groupId', '=', groupId)
    .where('homework.subjectId', '=', subjectId)
    .orderBy('homework.due_date', 'desc')
    .execute();

    return homework;

  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      subjectId: t.Optional(t.Number())
    })
  });

export default elysiaApp;
