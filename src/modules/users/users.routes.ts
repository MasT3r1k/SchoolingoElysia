import { Elysia, t } from 'elysia';
import { env } from '@config/env.config';
import { UsersService } from './users.service';
import {
  UpdateUserSchema,
  AddEmailSchema,
  DeleteEmailSchema,
  VerifyEmailSchema,
  AddPhoneSchema,
  DeletePhoneSchema,
  VerifyPhoneSchema,
  AvatarHistoryQuerySchema,
} from './users.dto';
import { db } from '@database';
import moment from 'moment';
import { Utils } from '../../utils/utils';
import { Mailer } from '@core/mailer/mailer.service';
import { verifyTFA } from '@functions/verifyTFA';

const handleGetUser = async ({ user, school, set }: any) => {
  if (!user) {
    set.status = 401;
    return { error: 'no_user', details: 'no_cookie' };
  }

  if (!school) {
    set.status = 412;
    return { error: 'no_school', details: 'school_not_found' };
  }

  const profile = await UsersService.getUserProfile(user.user_id, school.school_id, user.expires);
  if (!profile) {
    set.status = 404;
    return { error: 'no_user', details: 'no_db' };
  }

  return {
    ...profile,
    expires: user.expires || profile.expires,
  };
};

const handleSessionExpand = async ({ token, cookie, user, set }: any) => {
  const activeToken = token || cookie?.token?.value;
  if (!activeToken) {
    set.status = 400;
    return { error: 'no_user', details: 'no_cookie' };
  }

  try {
    const expires = await UsersService.expandSession(activeToken);
    if (cookie?.token) {
      cookie.token.set({
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        value: activeToken,
        path: '/',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 2592000,
        expires,
      });
    }
    return { success: true, expires };
  } catch (err: any) {
    set.status = 500;
    return { error: 'session_expand_failed', details: err?.message };
  }
};

export const userAliasesRouter = new Elysia({ name: 'UserAliasesRouter' })
  .get('/user', handleGetUser)
  .post('/sessionexpand', handleSessionExpand);

export const usersRouter = new Elysia({ prefix: '/api/v1', name: 'UsersRouter' })
  // 1. Current Authenticated User Profile
  .get(
    '/user',
    handleGetUser,
    {
      detail: {
        tags: ['Users'],
        summary: 'Get current user profile with roles, classes and gamification',
      },
    }
  )

  // 2. Avatar History
  .get(
    '/user/avatar-history',
    async ({ user, query, set }: any) => {
      if (!user) {
        set.status = 401;
        return { error: 'no_user', details: 'no_cookie' };
      }

      const limit = query?.limit ? Number(query.limit) : 10;
      const history = await UsersService.getAvatarHistory(user.user_id, limit);
      return { history };
    },
    {
      query: AvatarHistoryQuerySchema,
      detail: {
        tags: ['Users'],
        summary: 'Get avatar modification history for authenticated user',
      },
    }
  )

  // 3. Session Expansion
  .post(
    '/sessionexpand',
    handleSessionExpand,
    {
      detail: {
        tags: ['Users'],
        summary: 'Extend active session expiration',
      },
    }
  )

  // 4. Update User Profile Settings (Theme, Language, Avatar)
  .post(
    '/user/update',
    async ({ body, user, set }: any) => {
      if (!user) {
        set.status = 401;
        return { error: 'no_user', details: 'no_auth' };
      }

      const result = await UsersService.updateUserPreference({
        userId: user.user_id,
        personId: user.person_id ?? null,
        method: body.method,
        theme: body.theme,
        language: body.language,
        avatar: body.avatar,
      });

      if (result.error) {
        set.status = 400;
      }
      return result;
    },
    {
      body: t.Object({
        method: t.String(),
        theme: t.Optional(t.Number()),
        language: t.Optional(t.String()),
        avatar: t.Optional(t.Any()),
      }),
      detail: {
        tags: ['Users'],
        summary: 'Update user settings and avatar',
      },
    }
  )

  // 5. Contact Management: Email Operations
  .post(
    '/user/email',
    async ({ body, user, set }: any) => {
      if (!user || !user.person_id) {
        set.status = 401;
        return { error: 'no_user' };
      }

      const { email, type, description, token } = body;

      // Check if email already exists
      const exists = await db
        .selectFrom('emails')
        .select(['email', 'person_id'])
        .where('email', '=', email)
        .executeTakeFirst();

      if (exists) {
        set.status = 400;
        return exists.person_id === user.person_id
          ? { error: 'email_exists', details: 'already_yours' }
          : { error: 'email_exists', details: 'already_taken' };
      }

      if (user['2fa'] && user['2fa_secret']) {
        if (!token) return { error: 'required_2fa' };
        const ok = await verifyTFA(token, user.user_id);
        if (!ok) return { error: 'invalid_2fa' };
      }

      const emailCode = Utils.randomstring(6, true).toUpperCase();
      const codeExpiration = moment().add(20, 'minutes');

      await db
        .insertInto('emails')
        .values({
          person_id: user.person_id,
          email,
          type: type || 'other',
          description: description || null,
          is_verified: false,
          email_code: emailCode,
          code_until: codeExpiration.toDate(),
        })
        .execute();

      await Mailer.sendHtmlEmail(
        email,
        'Ověření e-mailu - Schoolingo',
        `<p>Dobrý den,</p><p>váš ověřovací kód je: <strong>${emailCode}</strong></p><p>Kód platí do: ${codeExpiration.format('DD.MM.YYYY HH:mm')}</p>`
      ).catch(() => {});

      return { success: true, code_valid_until: codeExpiration.toDate() };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        type: t.Optional(t.String()),
        description: t.Optional(t.String()),
        token: t.Optional(t.String()),
      }),
      detail: { tags: ['Users'], summary: 'Add new email for user' },
    }
  )
  .delete(
    '/user/email',
    async ({ body, user, set }: any) => {
      if (!user || !user.person_id) {
        set.status = 401;
        return { error: 'no_user' };
      }

      if (user['2fa'] && user['2fa_secret']) {
        if (!body.token) return { error: 'required_2fa' };
        const ok = await verifyTFA(body.token, user.user_id);
        if (!ok) return { error: 'invalid_2fa' };
      }

      await db
        .deleteFrom('emails')
        .where('email', '=', body.email)
        .where('person_id', '=', user.person_id)
        .execute();

      return { success: true };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        token: t.Optional(t.String()),
      }),
      detail: { tags: ['Users'], summary: 'Delete user email' },
    }
  )

  // 6. Contact Management: Phone Operations
  .post(
    '/user/phone',
    async ({ body, user, set }: any) => {
      if (!user || !user.person_id) {
        set.status = 401;
        return { error: 'no_user' };
      }

      const { code, number, description, token } = body;

      const exists = await db
        .selectFrom('phone_numbers')
        .select(['number', 'person_id'])
        .where('number', '=', number)
        .executeTakeFirst();

      if (exists) {
        set.status = 400;
        return exists.person_id === user.person_id
          ? { error: 'phone_exists', details: 'already_yours' }
          : { error: 'phone_exists', details: 'already_taken' };
      }

      if (user['2fa'] && user['2fa_secret']) {
        if (!token) return { error: 'required_2fa' };
        const ok = await verifyTFA(token, user.user_id);
        if (!ok) return { error: 'invalid_2fa' };
      }

      const phoneCode = Utils.randomstring(6, true).toUpperCase();
      const codeExpiration = moment().add(20, 'minutes');

      await db
        .insertInto('phone_numbers')
        .values({
          person_id: user.person_id,
          code,
          number,
          description: description || null,
          is_verified: false,
          phone_code: phoneCode,
          code_until: codeExpiration.toDate(),
        })
        .execute();

      return { success: true, code_valid_until: codeExpiration.toDate() };
    },
    {
      body: t.Object({
        code: t.String(),
        number: t.String(),
        description: t.Optional(t.String()),
        token: t.Optional(t.String()),
      }),
      detail: { tags: ['Users'], summary: 'Add new phone number for user' },
    }
  )
  .delete(
    '/user/phone',
    async ({ body, user, set }: any) => {
      if (!user || !user.person_id) {
        set.status = 401;
        return { error: 'no_user' };
      }

      if (user['2fa'] && user['2fa_secret']) {
        if (!body.token) return { error: 'required_2fa' };
        const ok = await verifyTFA(body.token, user.user_id);
        if (!ok) return { error: 'invalid_2fa' };
      }

      await db
        .deleteFrom('phone_numbers')
        .where('number', '=', body.number)
        .where('person_id', '=', user.person_id)
        .execute();

      return { success: true };
    },
    {
      body: t.Object({
        number: t.String(),
        token: t.Optional(t.String()),
      }),
      detail: { tags: ['Users'], summary: 'Delete user phone number' },
    }
  );
