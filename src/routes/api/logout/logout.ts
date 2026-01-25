import { Elysia } from 'elysia';
import { db } from '../../../../database';

const app = new Elysia()
    .get('/', async ({ cookie }) => {
        const token = cookie.token?.value as string;
        if (!token) {
            return Response.json({ error: 'no_user' });
        }

        await db.updateTable('tokens')
        .set({
            expires: new Date()
        })
        .where('tokens.token', '=', token)
        .execute();

        cookie.token.set({
            value: '',
            path: '/',
            httpOnly: true,
            maxAge: 0
        });
        return Response.json({ success: true, message: "Logged out" })

    })

export default app;
