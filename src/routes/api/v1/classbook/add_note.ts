import { Elysia, t } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  .post('/classbook/add_note', async ({ cookie, body }) => {
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
    const { subject_id, group_id, title, note } = body;
    if (
           subject_id == undefined
        || group_id == undefined
        || title == undefined
        || note == undefined) return { error: 'bad_query' };

    try {
        const noteDB = await db.insertInto('classbook_notes')
        .values({
            subject_id,
            group_id,
            title,
            note,
            created_by: user.person
        })
        .executeTakeFirst();

        if (!noteDB) return { success: false }

        const newNote = await db.selectFrom('classbook_notes')
        .select([
            'classbook_notes.classbook_note_id',
            'classbook_notes.title',
            'classbook_notes.note',
            'classbook_notes.created_at'
        ])
        .where('classbook_notes.classbook_note_id', '=', Number(noteDB.insertId))
        .executeTakeFirst();

        if (!newNote) return { success: false }

        return { success: true, note: newNote };
    } catch(e) {
        return { success: false }
    }


  }, {
    body: t.Object({
      subject_id: t.Optional(t.Number()),
      group_id: t.Optional(t.Number()),
      title: t.Optional(t.Nullable(t.String())),
      note: t.Optional(t.String())
    })
  });

export default elysiaApp;
