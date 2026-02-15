import { db } from '../../database';
import moment from 'moment';
import { SecurityConfig } from '../config/security.config';
import { config } from '../config/app.config';

export async function getAuthUser(token: string | undefined, cookie: any = null) {
    if (!token) return null;

    const session = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select([
        'tokens.userId',
        'tokens.expires',
        'users.person',
        'users.username',
        'users.locale',
        'users.principal',
        'users.manager',
        'users.role',
        'users.school'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!session) return null;

    // Sliding session logic
    const now = Date.now();
    const exp = new Date(session.expires).getTime();
    const remaining = exp - now;

    if (remaining > 0 && cookie) {
       const newExpires = moment().add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES || 30, 'minutes');
       
       db.updateTable('tokens')
         .set({ expires: newExpires.toDate() })
         .where('tokens.token', '=', token)
         .executeTakeFirst(); 

       if (cookie.token) {
           cookie.token.set({
                httpOnly: true,
                secure: config.NODE_ENV === 'production',
                value: token,
                path: '/',
                sameSite: 'lax',
                maxAge: 2592000,
                expires: newExpires.toDate()
           });
       }
    }

    return { 
        userId: session.userId, 
        person: session.person,
        username: session.username,
        locale: session.locale,
        isPrincipal: !!session.principal,
        manager: session.manager,
        role: session.role,
        school: session.school
    };
}
