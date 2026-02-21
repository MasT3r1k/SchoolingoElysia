import { Elysia, t } from 'elysia';
import { db } from '../../../database';
import { authenticateUser } from './auth';

const app = new Elysia()
    .post('/auth/qr', async ({ body, cookie, request, store }: any) => {
        const { code } = body;
        
        let tokenToVerify = code;

        try {
            const data = JSON.parse(code);
            if (data.token) {
                tokenToVerify = data.token;
            }
        } catch (e) {
            // Not JSON
        }

        const session = await db
          .selectFrom('tokens')
          .select(['user_id', 'expires'])
          .where('token', '=', tokenToVerify)
          .where('expires', '>', new Date())
          .executeTakeFirst();
          
        if (!session) {
            return { error: ['Neplatný nebo expirovaný QR kód'] };
        }
        
        const { ip } = store;
        const userAgent = request.headers.get("user-agent") || null;
        
        const res = await authenticateUser(session.user_id, cookie, userAgent, ip);
        
        if (res.status) {
            const user = await db.selectFrom('users')
                .select(['username'])
                .where('user_id', '=', session.user_id)
                .executeTakeFirst();
            
            const newToken = cookie.token.value;

            return {
                username: res.username || user?.username,
                token: newToken,
                expires: res.expires
            };
        } else {
             return { error: ['Chyba při generování tokenu'] };
        }

    }, {
        body: t.Object({
            code: t.String()
        })
    });

export default app;
