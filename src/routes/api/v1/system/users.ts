import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value as string)
  }))
  // GET /system/users - List users with cursor-based pagination
  .get('/system/users', async ({ user, query }) => {
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.manager !== -1 && !user.isPrincipal && user.role !== 'admin_staff') {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const { limit = 20, offset = 0, search = '', role = 'all', status = 'all' } = query;

    const lastLoginSubquery = db
      .selectFrom('login_history')
      .select([
        'login_history.userId',
        sql`MAX(login_history.created)`.as('last_login')
      ])
      .groupBy('login_history.userId')
      .as('last_login');

    let dbQuery = db
      .selectFrom('users')
      .leftJoin('persons', 'persons.personId', 'users.person')
      .leftJoin(lastLoginSubquery, 'last_login.userId', 'users.userId')
      .leftJoin('login_history', (join) =>
        join
          .onRef('login_history.userId', '=', 'users.userId')
          .onRef('login_history.created', '=', 'last_login.last_login')
      )
      .select([
        'users.userId',
        'users.username',
        'users.login_type',
        'users.role',
        'persons.firstName',
        'persons.lastName',
        'users.created_at',
        'users.updated_at',
        sql`concat(persons.firstName, ' ', persons.lastName)`.as('fullName'),
        'login_history.created as last_login',
        'login_history.ip as lastLoginIp',
        'login_history.userAgent as lastLoginUserAgent'
      ]);
    // Filters
    if (search) {
      dbQuery = dbQuery.where((eb) => eb.or([
        eb('users.username', 'like', `%${search}%`),
        eb('persons.firstName', 'like', `%${search}%`),
        eb('persons.lastName', 'like', `%${search}%`)
      ]));
    }

    // Get Total Count
    const countQuery = dbQuery
      .clearSelect()
      .select(sql`count(*)`.as('total'));

    const totalResult = await countQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    // Get Data
    const users = await dbQuery
      .limit(limit)
      .offset(offset)
      .orderBy('users.userId', 'desc')
      .execute();

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
  });

export default app;
