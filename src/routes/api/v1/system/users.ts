import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { format_person_by_id } from '../../../../functions/format_person_by_id';
import moment from 'moment';
import { permissions } from '../../../../middleware/permission.middleware';
import { GlobalPermissions } from '../../../../config/permissions.config';

const app = new Elysia()
  // GET /system/users - List users with cursor-based pagination
  .use(permissions(GlobalPermissions.USERS_VIEW))
  .get('/system/users', async ({ user, query }: any) => {

    const { limit = 20, offset = 0, search = '', role = 'all', status = 'all' } = query;

    const lastLoginSubquery = db
      .selectFrom('login_history')
      .select([
        'login_history.user_id',
        sql`MAX(login_history.created)`.as('last_login_date')
      ])
      .groupBy('login_history.user_id')
      .as('last_login_subquery');

    let dbQuery = db
      .selectFrom('users')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .leftJoin(lastLoginSubquery, 'last_login_subquery.user_id', 'users.user_id')
      .leftJoin('login_history', (join) =>
        join
          .onRef('login_history.user_id', '=', 'users.user_id')
          .onRef('login_history.created', '=', 'last_login_subquery.last_login_date')
      )
      .select([
        'users.user_id',
        'users.person_id as person_id',
        'users.username',
        'users.login_type',
        'users.role',
        'persons.first_name',
        'persons.last_name',
        'users.created_at',
        'users.updated_at',
        'login_history.created as last_login',
        'login_history.ip as last_login_ip',
        'login_history.user_agent as last_login_user_agent'
      ]);
    // Filters
    if (search) {
      dbQuery = dbQuery.where((eb) => eb.or([
        eb('users.username', 'like', `%${search}%`),
        eb('persons.first_name', 'like', `%${search}%`),
        eb('persons.last_name', 'like', `%${search}%`)
      ]));
    }

    // Filter by School
    if (user.school_id) {
        dbQuery = dbQuery.where('users.school_id', '=', user.school_id);
    }
    
    // Get Total Count
    const countQuery = dbQuery
      .clearSelect()
      .select(sql`count(*)`.as('total'));

    const totalResult = await countQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    // Get Data
    const results = await dbQuery
      .limit(limit)
      .offset(offset)
      .orderBy('users.user_id', 'desc')
      .execute();

    const personIds = results.map(r => r.person_id).filter((id): id is number => id !== null);
    let formattedNames = new Map<number, string>();
    if (personIds.length > 0) {
      formattedNames = await format_person_map_by_ids(personIds);
    }

    const users = results.map(r => ({
      ...r,
      full_name: r.person_id ? formattedNames.get(r.person_id) : `${r.first_name} ${r.last_name}`
    }));

    return Response.json({
      data: users,
      meta: {
        total,
        page: Math.floor(offset / limit) + 1,
        limit
      }
    });

  }, {
    query: t.Object({
      limit: t.Optional(t.Numeric()),
      offset: t.Optional(t.Numeric()),
      search: t.Optional(t.String()),
      role: t.Optional(t.String()),
      status: t.Optional(t.String())
    })
  })

  // GET /system/users/:userId - Get a single user detail
  .use(permissions(GlobalPermissions.USERS_VIEW))
  .get('/system/users/:userId', async ({ user, params }: any) => {

    const userId = Number(params.userId);
    if (isNaN(userId)) return Response.json({ error: 'invalid_id' }, { status: 400 });

    const lastLoginSubquery = db
      .selectFrom('login_history')
      .select([
        'login_history.user_id',
        sql`MAX(login_history.created)`.as('last_login_date')
      ])
      .groupBy('login_history.user_id')
      .as('last_login_subquery');

    const result = await db
      .selectFrom('users')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .leftJoin(lastLoginSubquery, 'last_login_subquery.user_id', 'users.user_id')
      .leftJoin('login_history', (join) =>
        join
          .onRef('login_history.user_id', '=', 'users.user_id')
          .onRef('login_history.created', '=', 'last_login_subquery.last_login_date')
      )
      .select([
        'users.user_id',
        'users.person_id',
        'users.username',
        'users.login_type',
        'users.role',
        'users.locale',
        'users.theme',
        'users.2fa',
        'users.password_changed',
        'users.created_at',
        'users.updated_at',
        'persons.first_name',
        'persons.last_name',
        'persons.birthday',
        'persons.gender',
        'login_history.created as last_login',
        'login_history.ip as last_login_ip',
        'login_history.user_agent as last_login_user_agent'
      ])
      .where('users.user_id', '=', userId)
      .where('users.school_id', '=', user.school_id)
      .executeTakeFirst();

    if (!result) return Response.json({ error: 'not_found' }, { status: 404 });

    const full_name = result.person_id ? await format_person_by_id(result.person_id) : `${result.first_name} ${result.last_name}`;

    // Emails
    const emails = result.person_id ? await db.selectFrom('emails')
      .select(['emails.email', 'emails.is_verified', 'emails.description'])
      .where('emails.person_id', '=', result.person_id)
      .execute() : [];

    // Phones
    const phones = result.person_id ? await db.selectFrom('phone_numbers')
      .select(['phone_numbers.code', 'phone_numbers.number', 'phone_numbers.description', 'phone_numbers.is_verified'])
      .where('phone_numbers.person_id', '=', result.person_id)
      .execute() : [];

    // Login history (last 10)
    const loginHistory = await db.selectFrom('login_history')
      .select(['login_history.created', 'login_history.ip', 'login_history.user_agent', 'login_history.success'])
      .where('login_history.user_id', '=', userId)
      .orderBy('login_history.created', 'desc')
      .limit(10)
      .execute();

    // Login stats
    const loginStats = await Promise.all([
      db.selectFrom('login_history')
        .select(sql`COUNT(*)`.as('count'))
        .where('user_id', '=', userId)
        .where('success', '=', true)
        .where('created', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0)),
      db.selectFrom('login_history')
        .select(sql`COUNT(*)`.as('count'))
        .where('user_id', '=', userId)
        .where('success', '=', false)
        .where('created', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .executeTakeFirst()
        .then(r => Number(r?.count ?? 0))
    ]);

    return Response.json({
      ...result,
      full_name,
      emails,
      phones,
      login_history: loginHistory,
      logins_7days: loginStats[0],
      failed_logins_7days: loginStats[1]
    });
  })

  // PATCH /system/users/:userId - Update user details
  .use(permissions(GlobalPermissions.USERS_EDIT))
  .patch('/system/users/:userId', async ({ user, params, body }: any) => {

    const userId = Number(params.userId);
    if (isNaN(userId)) return Response.json({ error: 'invalid_id' }, { status: 400 });

    // Verify user belongs to same school
    const targetUser = await db.selectFrom('users')
      .select(['users.user_id', 'users.person_id', 'users.school_id'])
      .where('users.user_id', '=', userId)
      .where('users.school_id', '=', user.school_id)
      .executeTakeFirst();

    if (!targetUser) return Response.json({ error: 'not_found' }, { status: 404 });

    const { username, first_name, last_name, role, birthday, gender } = body;

    // Update users table
    const userUpdates: any = {};
    if (username !== undefined) userUpdates.username = username;
    if (role !== undefined) userUpdates.role = role;

    if (Object.keys(userUpdates).length > 0) {
      await db.updateTable('users')
        .set(userUpdates)
        .where('user_id', '=', userId)
        .execute();
    }

    // Update persons table
    if (targetUser.person_id) {
      const personUpdates: any = {};
      if (first_name !== undefined) personUpdates.first_name = first_name;
      if (last_name !== undefined) personUpdates.last_name = last_name;
      if (birthday !== undefined) personUpdates.birthday = birthday || null;
      if (gender !== undefined) personUpdates.gender = gender;

      if (Object.keys(personUpdates).length > 0) {
        await db.updateTable('persons')
          .set(personUpdates)
          .where('person_id', '=', targetUser.person_id)
          .execute();
      }
    }

    return Response.json({ success: true });
  }, {
    body: t.Object({
      username: t.Optional(t.String()),
      first_name: t.Optional(t.String()),
      last_name: t.Optional(t.String()),
      role: t.Optional(t.String()),
      birthday: t.Optional(t.Nullable(t.String())),
      gender: t.Optional(t.String())
    })
  })

  // POST /system/users/:userId/reset-password - Reset user password
  .use(permissions(GlobalPermissions.USERS_EDIT))
  .post('/system/users/:userId/reset-password', async ({ user, params, body }: any) => {

    const userId = Number(params.userId);
    if (isNaN(userId)) return Response.json({ error: 'invalid_id' }, { status: 400 });

    // Verify user belongs to same school
    const targetUser = await db.selectFrom('users')
      .select(['users.user_id', 'users.school_id'])
      .where('users.user_id', '=', userId)
      .where('users.school_id', '=', user.school_id)
      .executeTakeFirst();

    if (!targetUser) return Response.json({ error: 'not_found' }, { status: 404 });

    const { new_password } = body;
    if (!new_password || new_password.length < 8) {
      return Response.json({ error: 'password_too_short' }, { status: 400 });
    }

    // Hash password with bcrypt
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(new_password, 12);

    const password_id = await db.insertInto('passwords')
    .values({
      password: hashedPassword
    })
    .executeTakeFirst();

    await db.updateTable('users')
      .set({ 
        password_id: Number(password_id.insertId),
        password_changed: moment().format('YYYY-MM-DD')
      })
      .where('user_id', '=', userId)
      .execute();

    // Invalidate all tokens for this user
    await db.deleteFrom('tokens')
      .where('user_id', '=', userId)
      .execute();

    return Response.json({ success: true });
  }, {
    body: t.Object({
      new_password: t.String()
    })
  });

export default app;
