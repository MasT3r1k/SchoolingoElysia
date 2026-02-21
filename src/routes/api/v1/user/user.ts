import { Elysia } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';
import { calculateLevelFromXP, calculatestartXPFromLevel, calculateXPForNextLevel } from '../../../../functions/levels';
import { createResponse, createErrorResponse } from '../../../../utils/response.helper';
import { logger } from '../../../../utils/logger';
import { format_person_by_id } from '../../../../functions/format_person_by_id';

const app = new Elysia()
  .get('/user', async ({ cookie, headers }) => {
      let token = cookie.token?.value as string;
      
      if (!token && headers['authorization']) {
          token = headers['authorization'].replace('Bearer ', '');
      }

      if (!token) {
        return createErrorResponse('no_user', 'no_cookie');
      }

      // Resolve School from Domain
      const origin = headers['origin'] || headers['host'] || '';
      const domain = origin.replace(/^https?:\/\//, '');

      const { domainService } = await import('../../../../functions/domain.service');
      const school = await domainService.getSchoolByDomain(domain);

      if (!school) {
        return createErrorResponse('no_school', 'school_not_found');
      }

      const tokenDB = await db.selectFrom("tokens")
          .innerJoin('users', 'users.user_id', 'tokens.user_id')
          .leftJoin('persons', 'persons.person_id', 'users.person_id')
          .select([
              'persons.person_id',
              'users.user_id',
              'persons.birthday',
              'persons.gender',
              'tokens.expires',
              'users.username',
              'users.avatar',
              'users.password_changed',
              'users.manager',
              'users.role',
              'users.school_id',
              'users.locale',
              'users.levels_exp',
              'users.theme',
              'users.2fa'
          ])
          .where('tokens.token', '=', token)
          .where('tokens.expires', '>=', moment().toDate())
          .limit(1)
          .executeTakeFirst()
          
      if (tokenDB && tokenDB.school_id !== school.school_id) {
        return createErrorResponse('invalid_school', 'user_belongs_to_diff_school');
      }

      if (!tokenDB) {
        try {
          cookie?.token?.remove();
        } catch(e) {
          logger.error(e as string);
        }
        return createErrorResponse('no_user', 'no_db');
      }

      let user: any = tokenDB;
      user.full_name = tokenDB.person_id ? await format_person_by_id(tokenDB.person_id) : '';

      const perms = await db.selectFrom("tokens")
      .leftJoin('users', 'users.user_id', 'tokens.user_id')
      .leftJoin('students', 'students.person_id', 'users.person_id')
      .leftJoin('teachers', 'teachers.person_id', 'users.person_id')
      .leftJoin('family_relations', 'family_relations.source_id', 'users.person_id')
      .select([
        sql`students.person_id`.as('student_id'),
        sql`teachers.person_id`.as('teacher_id'),
        sql`family_relations.source_id`.as('parent_id')
      ])
      .where('tokens.token', '=', token)
      .limit(1)
      .executeTakeFirst()

      let userType: 'student' | 'teacher' | 'parent' | string = tokenDB.role;
      if (perms) {
          if (perms.student_id !== null) {
              userType = "student";
          }
          if (perms.teacher_id !== null) {
              userType = "teacher";
          } 
          if (perms.parent_id !== null) {
              userType = "parent";
          }
      }

      user.role = userType;
      try {
        user.avatar = JSON.parse(tokenDB.avatar);
      } catch (e) {
        user.avatar = null;
      }
      user.level = calculateLevelFromXP(tokenDB.levels_exp);
      user.xp = tokenDB.levels_exp - calculatestartXPFromLevel(user.level);
      user.requiredXP = calculateXPForNextLevel(user.level);
      user.lastLogins7Days = await db
  .selectFrom('login_history')
  .select(sql`COUNT(*)`.as('count'))
  .where('user_id', '=', tokenDB.user_id)
  .where('created', '>=', moment().subtract(7, 'days').toDate())
  .where('login_history.success', '=', true)
  .executeTakeFirst()
  .then(r => Number(r?.count ?? 0));
      user.failedLogins7Days = await db
  .selectFrom('login_history')
  .select(sql`COUNT(*)`.as('count'))
  .where('user_id', '=', tokenDB.user_id)
  .where('created', '>=', moment().subtract(7, 'days').toDate())
  .where('login_history.success', '=', false)
  .executeTakeFirst()
  .then(r => Number(r?.count ?? 0));
    user.children = await db.selectFrom("family_relations")
    .innerJoin("persons", "family_relations.target_id", "persons.person_id")
    .select([
      sql`persons.person_id`.as('childId'),
      "persons.first_name",
      "persons.last_name",
      "persons.gender"
    ])
    .where("family_relations.source_id", "=", tokenDB.person_id)
    .execute();

    if (user.children) {
      for(let i = 0;i < user.children.length;i++) {
      user.children[i].classes = await db.selectFrom("classes")
        .leftJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
        .leftJoin('scopes', 'classes.scope_id', 'scopes.scope_id')
        .leftJoin('students', 'students.class_id', 'classes.class_id')
        .select([
          'classes.class_id',
          'classes.scope_id',
          'scopes.name as scope_name',
          'scopes.years as scope_years',
          sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
          sql`COUNT(students.class_id)`.as('students')
        ])
        .where('students.person_id', '=', user.children[i].childId)
        .where(sql`DATE_ADD(sy.start, INTERVAL scopes.years YEAR)`, '>=', sql`CURDATE()`)
        .groupBy('classes.class_id')
        .execute()
      }
    }

    user.emails = await db.selectFrom("emails")
    .select([
      'emails.email',
      'emails.is_verified',
      'emails.description'
    ])
    .where('emails.person_id', '=', tokenDB.person_id)
    .execute();

    user.phones = await db.selectFrom("phone_numbers")
    .select([
      'phone_numbers.code',
      'phone_numbers.number',
      'phone_numbers.description',
      'phone_numbers.is_verified'
    ])
    .where('phone_numbers.person_id', '=', tokenDB.person_id)
    .execute()

    user.classes = await db.selectFrom("classes")
    .leftJoin('school_years as sy', 'sy.sy_id', 'classes.year_id')
    .leftJoin('scopes', 'classes.scope_id', 'scopes.scope_id')
    .leftJoin('students', 'students.class_id', 'classes.class_id')
    .select([
      'classes.class_id',
      'classes.scope_id',
      'scopes.name as scope_name',
      'scopes.years as scope_years',
      sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
      sql`COUNT(students.class_id)`.as('students')
    ])
    .where((eb) =>
      eb.or([
        eb('classes.teacher_id', '=', tokenDB.person_id),
        eb('students.person_id', '=', tokenDB.person_id)
      ])
    )
    .where(sql`DATE_ADD(sy.start, INTERVAL scopes.years YEAR)`, '>=', sql`CURDATE()`)
    .groupBy('classes.class_id')
    .execute()

    delete user.levels_exp;

    return createResponse(user, cookie);
  })

export default app;
