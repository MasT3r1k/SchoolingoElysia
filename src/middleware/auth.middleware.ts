import { Elysia } from 'elysia';
import { db } from '../../database';
import moment from 'moment';
import { SecurityConfig } from '../config/security.config';
import { config } from '../config/app.config';

export const auth = new Elysia()
  .derive(async ({ cookie }) => {
    const token = cookie?.token?.value;
    // Default return if no token
    if (!token) return { user: null, session: null };

    // Fetch session
    const session = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.userId', 'tokens.expires', 'users.person', 'users.username', 'users.locale', 'users.principal', 'users.manager'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!session) return { user: null, session: null };

    // Sliding session logic
    const now = Date.now();
    const exp = new Date(session.expires).getTime();
    const remaining = exp - now;

    if (remaining > 0) {
       // Extend session if valid and active
       const newExpires = moment().add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES || 30, 'minutes');
       
       // Update DB
       db.updateTable('tokens')
         .set({ expires: newExpires.toDate() })
         .where('tokens.token', '=', token)
         .executeTakeFirst(); // Fire and forget promise

       // Update Cookie
       cookie.token.set({
         httpOnly: true,
         secure: config.NODE_ENV === 'production',
         value: token,
         path: '/',
         sameSite: 'lax',
         maxAge: 2592000, // 30 days window? Or match session?
         expires: newExpires.toDate()
       });
    }

    return { 
        user: { 
            userId: session.userId, 
            person: session.person,
            username: session.username,
            locale: session.locale,
            isPrincipal: !!session.principal,
            manager: session.manager // Passed as raw number/id for logic checks
        },
        session: session
    };
  });
