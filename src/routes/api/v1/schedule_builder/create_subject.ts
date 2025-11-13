import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { sql } from 'kysely';
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import moment from 'moment';

const elysiaApp = new Elysia()
  .use(rateLimit({
    scoping: "scoped",
    max: 10,
    duration: 1000,
    injectServer: () => app.server
  }))
  .post('/schedule/create_subject', async ({ cookie, body }) => {
    const token = cookie.token.value;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.userId', 'tokens.userId')
        .innerJoin("passwords", "passwords.passwordId", "users.password")
        .select([
            'users.userId',
            'users.username',
            'users.2fa',
            'users.2fa_secret',
            'passwords.password'
        ])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst()

    if (!user) {
        return Response.json({ error: 'no_user', details: 'no_db' });
    }

    const { name, short } = body;
    if (!name || name == "") return { error: 'invalid_name' };
    if (!short || short == "") return { error: 'invalid_short' };

    try {
        const createSubject = await db.insertInto('subjects')
        .values({
            label: name,
            shortcut: short
        })
        .executeTakeFirst();

        return { status: true, subjectId: Number(createSubject.insertId), name, short }
    } catch(e) {
        return { status: false }
    }

  }, {
    body: t.Object({
        name: t.Optional(t.String()),
        short: t.Optional(t.String())
    })
  });

export default elysiaApp;
