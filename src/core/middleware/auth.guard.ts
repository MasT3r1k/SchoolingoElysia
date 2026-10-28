import { Elysia } from 'elysia';
import moment from 'moment';
import { db } from '../database/connection';
import { env } from '../config/env.config';
import { SecurityConfig } from '../config/security.config';
import { hashToken } from '../utils/crypto.util';
import { UnauthorizedError } from '../errors/http-errors';

export interface AuthUser {
  user_id: number;
  person_id: number | null;
  username: string | null;
  locale: string | null;
  is_principal: boolean;
  manager: number | null;
  role: 'teacher' | 'student' | 'parent' | 'admin_staff' | 'management' | 'personnel' | 'other' | null;
  school_id: number | null;
  expires?: Date;
}

export interface SchoolContext {
  school_id: number;
  domain?: string | null;
  name?: string | null;
}

export function extractToken(request: Request, cookie: any): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (cookie?.token?.value) {
    return String(cookie.token.value).trim();
  }
  return null;
}

export async function resolveAuthUser(token: string | null, cookie: any = null): Promise<AuthUser | null> {
  if (!token) return null;

  const hashed = hashToken(token);

  const session = await db
    .selectFrom('tokens')
    .leftJoin('users', 'users.user_id', 'tokens.user_id')
    .select([
      'tokens.token_id',
      'tokens.user_id',
      'tokens.expires',
      'users.person_id',
      'users.username',
      'users.locale',
      'users.principal',
      'users.manager',
      'users.role',
      'users.school_id',
    ])
    .where((eb) => eb.or([
      eb('tokens.token', '=', token),
      eb('tokens.token', '=', hashed),
    ]))
    .where('tokens.expires', '>=', new Date())
    .executeTakeFirst();

  if (!session || !session.user_id) return null;

  const now = Date.now();
  const exp = new Date(session.expires).getTime();
  const remaining = exp - now;

  let activeExpires: Date = new Date(session.expires);

  if (remaining > 0) {
    const newExpires = moment().add(SecurityConfig.TOKEN_SHORT_EXPIRE_MINUTES || 15, 'minutes').toDate();
    activeExpires = newExpires;

    db.updateTable('tokens')
      .set({ expires: newExpires })
      .where('tokens.token_id', '=', session.token_id)
      .executeTakeFirst()
      .catch((err) => console.warn('[AuthGuard] Sliding session update error:', err));

    if (cookie?.token) {
      cookie.token.set({
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        value: token,
        path: '/',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 2592000,
        expires: newExpires,
      });
    }
  }

  return {
    user_id: session.user_id,
    person_id: session.person_id,
    username: session.username,
    locale: session.locale,
    is_principal: Boolean(session.principal),
    manager: session.manager,
    role: session.role as AuthUser['role'],
    school_id: session.school_id,
    expires: activeExpires,
  };
}

export const authContext = new Elysia({ name: 'auth-context' })
  .derive({ as: 'global' }, async ({ request, cookie }) => {
    const token = extractToken(request, cookie);
    const user = await resolveAuthUser(token, cookie);
    return { token, user, sessionExpires: user?.expires };
  })
  .onAfterHandle({ as: 'global' }, ({ set, user }: any) => {
    if (user?.expires) {
      set.headers['x-session-expires'] = (user.expires instanceof Date ? user.expires : new Date(user.expires)).toISOString();
    }
  });

export const requireAuth = new Elysia({ name: 'require-auth' })
  .derive({ as: 'global' }, async ({ request, cookie }) => {
    const token = extractToken(request, cookie);
    const user = await resolveAuthUser(token, cookie);
    if (!user) {
      throw new UnauthorizedError('Authentication required. Missing or expired session token.');
    }
    return { token, user, sessionExpires: user.expires };
  });
