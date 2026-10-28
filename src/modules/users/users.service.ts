import { db } from '@database';
import { sql } from 'kysely';
import moment from 'moment';
import { calculateLevelFromXP, calculatestartXPFromLevel, calculateXPForNextLevel } from '@functions/levels';
import { format_person_by_id } from '@functions/format_person_by_id';
import { PermissionService } from '@functions/permission.service';
import { SecurityConfig } from '@config/security.config';
import { hashToken } from '@core/utils/crypto.util';

export class UsersService {
  /**
   * Aggregates the full user profile including roles, classes, children, contacts, and gamification level.
   */
  public static async getUserProfile(userId: number, schoolId: number, sessionExpires?: Date | null) {
    const user = await db
      .selectFrom('users')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .select([
        'persons.person_id',
        'users.user_id',
        'persons.birthday',
        'persons.gender',
        'users.username',
        'users.avatar',
        'users.password_changed',
        'users.manager',
        'users.principal',
        'users.role',
        'users.school_id',
        'users.locale',
        'users.levels_exp',
        'users.theme',
        'users.2fa',
      ])
      .where('users.user_id', '=', userId)
      .where('users.school_id', '=', schoolId)
      .limit(1)
      .executeTakeFirst();

    if (!user) return null;

    const result: any = { ...user };
    result.full_name = user.person_id ? await format_person_by_id(user.person_id) : '';

    // Determine actual role
    const perms = await db
      .selectFrom('users')
      .leftJoin('students', 'students.person_id', 'users.person_id')
      .leftJoin('teachers', 'teachers.person_id', 'users.person_id')
      .leftJoin('family_relations', 'family_relations.target_id', 'users.person_id')
      .select([
        sql`students.person_id`.as('student_id'),
        sql`teachers.person_id`.as('teacher_id'),
        sql`family_relations.target_id`.as('parent_id'),
      ])
      .where('users.user_id', '=', userId)
      .limit(1)
      .executeTakeFirst();

    let userType: string = user.role;
    if (perms) {
      if (perms.student_id !== null) userType = 'student';
      if (perms.teacher_id !== null) userType = 'teacher';
      if (perms.parent_id !== null) userType = 'parent';
    }
    result.role = userType;

    // Parse avatar
    try {
      result.avatar = typeof user.avatar === 'string' ? JSON.parse(user.avatar) : user.avatar;
    } catch {
      result.avatar = null;
    }

    // Gamification level & XP
    const exp = Number(user.levels_exp) || 0;
    result.level = calculateLevelFromXP(exp);
    result.xp = exp - calculatestartXPFromLevel(result.level);
    result.requiredXP = calculateXPForNextLevel(result.level);

    // Login stats for last 7 days
    const lastLogins = await db
      .selectFrom('login_history')
      .select(sql`COUNT(*)`.as('count'))
      .where('user_id', '=', userId)
      .where('created', '>=', moment().subtract(7, 'days').toDate())
      .where('success', '=', true)
      .executeTakeFirst();

    const failedLogins = await db
      .selectFrom('login_history')
      .select(sql`COUNT(*)`.as('count'))
      .where('user_id', '=', userId)
      .where('created', '>=', moment().subtract(7, 'days').toDate())
      .where('success', '=', false)
      .executeTakeFirst();

    result.lastLogins7Days = Number(lastLogins?.count ?? 0);
    result.failedLogins7Days = Number(failedLogins?.count ?? 0);

    // Children for parents
    if (user.person_id) {
      const children = await db
        .selectFrom('family_relations')
        .innerJoin('persons', 'family_relations.source_id', 'persons.person_id')
        .select([
          sql`persons.person_id`.as('childId'),
          'persons.first_name',
          'persons.last_name',
          'persons.gender',
        ])
        .where('family_relations.target_id', '=', user.person_id)
        .execute();

      for (const child of children) {
        (child as any).classes = await db
          .selectFrom('classes')
          .leftJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
          .leftJoin('scopes', 'classes.scope_id', 'scopes.scope_id')
          .leftJoin('students', 'students.class_id', 'classes.class_id')
          .select([
            'classes.class_id',
            'classes.scope_id',
            'scopes.name as scope_name',
            'scopes.years as scope_years',
            sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
            sql`COUNT(students.class_id)`.as('students'),
          ])
          .where('students.person_id', '=', (child as any).childId)
          .where(sql`DATE_ADD(sy.start, INTERVAL scopes.years YEAR)`, '>=', sql`CURDATE()`)
          .groupBy('classes.class_id')
          .execute();
      }
      result.children = children;

      // Contacts: Emails & Phones
      result.emails = await db
        .selectFrom('emails')
        .select(['emails.email', 'emails.type', 'emails.is_verified', 'emails.description', 'emails.code_until'])
        .where('emails.person_id', '=', user.person_id)
        .execute();

      result.phones = await db
        .selectFrom('phone_numbers')
        .select([
          'phone_numbers.code',
          'phone_numbers.number',
          'phone_numbers.description',
          'phone_numbers.is_verified',
          'phone_numbers.code_until',
        ])
        .where('phone_numbers.person_id', '=', user.person_id)
        .execute();

      // Classes assigned to teacher or student
      result.classes = await db
        .selectFrom('classes')
        .leftJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
        .leftJoin('scopes', 'classes.scope_id', 'scopes.scope_id')
        .leftJoin('students', 'students.class_id', 'classes.class_id')
        .select([
          'classes.class_id',
          'classes.scope_id',
          'scopes.name as scope_name',
          'scopes.years as scope_years',
          sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
          sql`COUNT(students.class_id)`.as('students'),
        ])
        .where((eb) =>
          eb.or([
            eb('classes.teacher_id', '=', user.person_id!),
            eb('students.person_id', '=', user.person_id!),
          ])
        )
        .where(sql`DATE_ADD(sy.start, INTERVAL scopes.years YEAR)`, '>=', sql`CURDATE()`)
        .groupBy('classes.class_id')
        .execute();
    } else {
      result.children = [];
      result.emails = [];
      result.phones = [];
      result.classes = [];
    }

    // Roles and Permissions
    result.roles = (await PermissionService.getUserRoles(userId)).map((r) => r.role_key);
    result.permissions = await PermissionService.getUserPermissions(userId);

    delete result.levels_exp;

    // Attach token expiration date for frontend warning timer
    result.expires = sessionExpires ?? null;
    if (!result.expires) {
      const activeSession = await db
        .selectFrom('tokens')
        .select('expires')
        .where('user_id', '=', userId)
        .where('expires', '>=', new Date())
        .orderBy('expires', 'desc')
        .limit(1)
        .executeTakeFirst();
      result.expires = activeSession?.expires ?? moment().add(SecurityConfig.TOKEN_SHORT_EXPIRE_MINUTES, 'minutes').toDate();
    }

    return result;
  }

  /**
   * Retrieves avatar history for a user
   */
  public static async getAvatarHistory(userId: number, limit = 10) {
    const history = await db
      .selectFrom('avatar_history')
      .select(['avatar', 'created_at'])
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();

    return history
      .map((h) => {
        try {
          return {
            avatar: typeof h.avatar === 'string' ? JSON.parse(h.avatar) : h.avatar,
            created_at: h.created_at,
          };
        } catch {
          return null;
        }
      })
      .filter((h) => h !== null);
  }

  /**
   * Extends the session expiration time
   */
  public static async expandSession(token: string) {
    const expires = moment().add(SecurityConfig.RESET_PASSWORD_EXPIRES_MINUTES || 15, 'minutes').toDate();
    const hashed = hashToken(token);

    await db
      .updateTable('tokens')
      .set({ expires })
      .where((eb) =>
        eb.or([
          eb('tokens.token', '=', token),
          eb('tokens.token', '=', hashed),
        ])
      )
      .execute();

    return expires;
  }

  /**
   * Update theme, language, or avatar
   */
  public static async updateUserPreference(params: {
    userId: number;
    personId: number | null;
    method: string;
    theme?: number;
    language?: string;
    avatar?: any;
  }) {
    const { userId, personId, method, theme, language, avatar } = params;

    switch (method) {
      case 'UPDATE_THEME': {
        if (theme === undefined || isNaN(theme) || theme < 0) {
          return { error: 'no_theme' };
        }
        await db.updateTable('users').set({ theme }).where('user_id', '=', userId).execute();
        return { status: true };
      }

      case 'UPDATE_LANGUAGE': {
        if (!language) return { error: 'no_language' };
        await db.updateTable('users').set({ locale: language }).where('user_id', '=', userId).execute();
        return { status: true };
      }

      case 'UPDATE_AVATAR': {
        if (!avatar) return { error: 'no_avatar' };
        const avatarStr = JSON.stringify(avatar);

        await db.updateTable('users').set({ avatar: avatarStr }).where('user_id', '=', userId).execute();

        if (personId) {
          await db.updateTable('persons').set({ avatar: avatarStr }).where('person_id', '=', personId).execute();
        }

        await db.deleteFrom('avatar_history').where('user_id', '=', userId).where('avatar', '=', avatarStr).execute();

        await db.insertInto('avatar_history').values({ user_id: userId, avatar: avatarStr }).execute();

        return { status: true };
      }

      default:
        return { error: 'no_method' };
    }
  }
}
