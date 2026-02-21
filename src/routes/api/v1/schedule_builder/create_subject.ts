import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';

const elysiaApp = new Elysia()
  
  .post('/schedule/create_subject', async ({ cookie, body, school }: any) => {
    const token = cookie.token?.value as string;
    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const user = await db.selectFrom("tokens")
        .innerJoin('users', 'users.user_id', 'tokens.user_id')
        .innerJoin("passwords", "passwords.password_id", 'users.password_id')
        .select([
            'users.user_id',
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
            shortcut: short,
            is_main: false,
            primary_hours: '[]',
            school_id: (school as any).school_id
        })
        .executeTakeFirst();

        return { status: true, subjectId: Number(createSubject.insertId), name, short }
    } catch(e) {
        console.error(e);
        return { status: false }
    }

  }, {
    body: t.Object({
        name: t.Optional(t.String()),
        short: t.Optional(t.String())
    })
  });

export default elysiaApp;
