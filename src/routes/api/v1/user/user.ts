import { Elysia } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import moment from 'moment';
import { calculateLevelFromXP, calculatestartXPFromLevel, calculateXPForNextLevel } from '../../../../functions/levels';

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
    .get('/user', async ({ cookie }) => {
        const token = cookie.token.value;
        if (!token) {
            return Response.json({ error: 'no_user', details: 'no_cookie' });
        }

        const tokenDB = await db.selectFrom("tokens")
            .innerJoin('users', 'users.userId', 'tokens.userId')
            .leftJoin('persons', 'persons.personId', 'users.person')
            .leftJoin(titlesBefore, 'tb.person', 'persons.personId')
            .leftJoin(titlesAfter, 'ta.person', 'persons.personId')
            .select([
                'persons.personId',
                fullName.as('fullName'),
                'persons.birthday',
                'persons.gender',
                'tokens.expires',
                'users.username',
                'users.avatar',
                'users.locale',
                'users.levels_exp',
                'users.theme'
            ])
            .where('tokens.token', '=', token)
            .where('tokens.expires', '>=', moment().toDate())
            .limit(1)
            .executeTakeFirst()

        if (!tokenDB) {
            return Response.json({ error: 'no_user', details: 'no_db' });
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

        let userType: 'student' | 'teacher' | 'parent' | null = null;
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
        user.avatar = JSON.parse(tokenDB.avatar);
        user.level = calculateLevelFromXP(tokenDB.levels_exp);
        user.xp = tokenDB.levels_exp - calculatestartXPFromLevel(user.level);
        user.requiredXP = calculateXPForNextLevel(user.level);
        user.children = [];
        if (userType == "parent") {
          const children = db.selectFrom("family_relations")
          .innerJoin("persons", "family_relations.target", "persons.personId")
          .select([
            sql`persons.personId`.as('childId'),
            "persons.firstName",
            "persons.lastName",
            "persons.gender"
          ])
          .where("persons.personId", "=", tokenDB.personId)
          .execute();
          user.children = children;
        }

        delete user.levels_exp;

        return Response.json(user);
    })

export default app;
