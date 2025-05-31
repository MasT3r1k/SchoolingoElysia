import { Elysia } from 'elysia';

const app = new Elysia()
    .get('/', async ({ cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'no_user' });
        }
        cookie.token.set({
            value: '',
            path: '/',
            httpOnly: true,
            maxAge: 0
        });
        return Response.json({ success: true, message: "Logged out" })

    })

export default app;
