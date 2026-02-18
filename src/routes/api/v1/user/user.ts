import { Elysia } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';
import { calculateLevelFromXP, calculatestartXPFromLevel, calculateXPForNextLevel } from '../../../../functions/levels';
import { createResponse, createErrorResponse } from '../../../../utils/response.helper';
import { logger } from '../../../../utils/logger';

const titlesBefore = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID')
  .select([
    'pd.person as person',
    sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_before')
  ])
  .where('d.isBefore', '=', true)
  .groupBy('pd.person')
  .as('tb');

const titlesAfter = db.selectFrom('persons_degree as pd')
  .innerJoin('degrees as d', 'pd.degree', 'd.degreeID') 
  .select([
    'pd.person as person',
    sql`TRIM(GROUP_CONCAT(d.shortcut ORDER BY d.weight SEPARATOR ' '))`.as('titles_after')
  ])
  .where('d.isBefore', '=', false)
  .groupBy('pd.person')
  .as('ta');

const fullName = sql`
  concat(
    COALESCE(
      CASE WHEN tb.titles_before IS NULL OR tb.titles_before = '' THEN ''
      ELSE CONCAT(tb.titles_before, ' ')
      END,
    ''
    ),
    persons.firstName, ' ', persons.lastName,
    COALESCE(
      CASE WHEN ta.titles_after IS NULL OR ta.titles_after = '' THEN ''
      ELSE CONCAT(' ', ta.titles_after)
      END,
    ''
    )
  )
`;

const app = new Elysia()
  .get('/user', async ({ cookie, headers }) => {
      let token = cookie.token?.value as string;
      
      if (!token && headers['authorization']) {
          token = headers['authorization'].replace('Bearer ', '');
      }

      if (!token) {
        return createErrorResponse('no_user', 'no_cookie');
      }

      const tokenDB = await db.selectFrom("tokens")
          .innerJoin('users', 'users.userId', 'tokens.userId')
          .leftJoin('persons', 'persons.personId', 'users.person')
          .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
          .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
          .select([
              'persons.personId',
              'users.userId',
              fullName.as('fullName'),
              'persons.birthday',
              'persons.gender',
              'tokens.expires',
              'users.username',
              'users.avatar',
              'users.passwordChanged',
              'users.manager',
              'users.role',
              'users.locale',
              'users.levels_exp',
              'users.theme',
              'users.2fa'
          ])
          .where('tokens.token', '=', token)
          .where('tokens.expires', '>=', moment().toDate())
          .limit(1)
          .executeTakeFirst()

      if (!tokenDB) {
        try {
          cookie?.token?.remove();
        } catch(e) {
          logger.error(e as string);
        }
        return createErrorResponse('no_user', 'no_db');
      }

      const perms = await db.selectFrom("tokens")
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .leftJoin('students', 'students.personId', 'users.person')
      .leftJoin('teachers', 'teachers.personId', 'users.person')
      .leftJoin('family_relations', 'family_relations.source', 'users.person')
      .select([
        sql`students.personId`.as('student'),
        sql`teachers.personId`.as('teacher'),
        sql`family_relations.source`.as('parent')
      ])
      .where('tokens.token', '=', token)
      .limit(1)
      .executeTakeFirst()

      let userType: 'student' | 'teacher' | 'parent' | string = tokenDB.role;
      if (perms) {
          if (perms.student !== null) {
              userType = "student";
          }
          if (perms.teacher !== null) {
              userType = "teacher";
          } 
          if (perms.parent !== null) {
              userType = "parent";
          }
      }

      let user: any = tokenDB;
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
  .where('userId', '=', tokenDB.userId)
  .where('created', '>=', sql`NOW() - INTERVAL 7 DAY`)
  .where('login_history.success', '=', true)
  .executeTakeFirst()
  .then(r => Number(r?.count ?? 0));
      user.failedLogins7Days = await db
  .selectFrom('login_history')
  .select(sql`COUNT(*)`.as('count'))
  .where('userId', '=', tokenDB.userId)
  .where('created', '>=', sql`NOW() - INTERVAL 7 DAY`)
  .where('login_history.success', '=', false)
  .executeTakeFirst()
  .then(r => Number(r?.count ?? 0));
    user.children = await db.selectFrom("family_relations")
    .innerJoin("persons", "family_relations.target", "persons.personId")
    .select([
      sql`persons.personId`.as('childId'),
      "persons.firstName",
      "persons.lastName",
      "persons.gender"
    ])
    .where("family_relations.source", "=", tokenDB.personId)
    .execute();

    if (user.children) {
      for(let i = 0;i < user.children.length;i++) {
      user.children[i].classes = await db.selectFrom("classes")
        .leftJoin('school_years as sy', 'sy.syId', 'classes.yearId')
        .leftJoin('scopes', 'classes.scopeId', 'scopes.scopeId')
        .leftJoin('students', 'students.class', 'classes.classId')
        .select([
          'classes.classId',
          'classes.scopeId',
          'scopes.name as scopeName',
          'scopes.years as scopeYears',
          sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix)`.as('className'),
          sql`COUNT(students.class)`.as('students')
        ])
        .where('students.personId', '=', user.children[i].childId)
        .where(sql`DATE_ADD(sy.start, INTERVAL scopes.years YEAR)`, '>=', sql`CURDATE()`)
        .groupBy('classes.classId')
        .execute()
      }
    }

    user.emails = await db.selectFrom("emails")
    .select([
      'emails.email',
      'emails.is_verified',
      'emails.description'
    ])
    .where('emails.personId', '=', tokenDB.personId)
    .execute();

    user.phones = await db.selectFrom("phone_numbers")
    .select([
      'phone_numbers.code',
      'phone_numbers.number',
      'phone_numbers.description',
      'phone_numbers.is_verified'
    ])
    .where('phone_numbers.personId', '=', tokenDB.personId)
    .execute()

    user.classes = await db.selectFrom("classes")
    .leftJoin('school_years as sy', 'sy.syId', 'classes.yearId')
    .leftJoin('scopes', 'classes.scopeId', 'scopes.scopeId')
    .leftJoin('students', 'students.class', 'classes.classId')
    .select([
      'classes.classId',
      'classes.scopeId',
      'scopes.name as scopeName',
      'scopes.years as scopeYears',
      sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, sy.start, CURDATE()) + 1, classes.suffix)`.as('className'),
      sql`COUNT(students.class)`.as('students')
    ])
    .where((eb) =>
      eb.or([
        eb('classes.teacher', '=', tokenDB.personId),
        eb('students.personId', '=', tokenDB.personId)
      ])
    )
    .where(sql`DATE_ADD(sy.start, INTERVAL scopes.years YEAR)`, '>=', sql`CURDATE()`)
    .groupBy('classes.classId')
    .execute()

    delete user.levels_exp;

    return createResponse(user, cookie);
  })

export default app;
