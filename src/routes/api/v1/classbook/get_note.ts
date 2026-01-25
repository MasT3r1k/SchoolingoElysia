import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .get('/classbook/notes', async ({ cookie, query }) => {
    // === AUTH ===
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.userId', 'tokens.userId')
      .innerJoin("passwords", "passwords.passwordId", "users.password")
      .select([
        'users.userId',
        'users.username',
        'users.role',
        'users.person',
        'users.2fa',
        'users.2fa_secret',
        'passwords.password'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .executeTakeFirst();

    if (!user) return { error: 'no_user', details: 'no_db' };
    if (user.role != "teacher") return { error: 'no_permission' };

    // === VALIDACE QUERY ===
    const { subjectId, groupId } = query;
    if (subjectId == undefined || groupId == undefined) return { error: 'bad_query' };

    // === NAČTENÍ POZNÁMEK ===
    const notes = await db.selectFrom('classbook_notes')
    .select([
        'classbook_notes.classbook_note_id',
        'classbook_notes.title',
        'classbook_notes.note',
        'classbook_notes.created_at'
    ])
    .where('classbook_notes.group_id', '=', groupId)
    .where('classbook_notes.subject_id', '=', subjectId)
    .orderBy('classbook_notes.created_at', 'desc')
    .execute();

    return notes;

  }, {
    query: t.Object({
      groupId: t.Optional(t.Number()),
      subjectId: t.Optional(t.Number())
    })
  });

export default elysiaApp;
