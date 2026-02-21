import { db } from '../../database';
import moment from 'moment';
import { SecurityConfig } from '../config/security.config';
import { config } from '../config/app.config';

export async function getAuthUser(token: string | undefined, cookie: any = null) {
    if (!token) return null;

    const session = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .select([
        'tokens.user_id',
        'tokens.expires',
        'users.person_id',
        'users.username',
        'users.locale',
        'users.principal',
        'users.manager',
        'users.role',
        'users.school_id'
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
        user_id: session.user_id, 
        person_id: session.person_id,
        username: session.username,
        locale: session.locale,
        is_principal: !!session.principal,
        manager: session.manager,
        role: session.role,
        school_id: session.school_id
    };
}
