import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { format_person_by_id } from '../../../../functions/format_person_by_id';
import moment from 'moment';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  // GET /system/users - List users with cursor-based pagination
  .get('/system/users', async ({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_VIEW);
    if (!perm) return { error: 'no_permission' };

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
        'persons.avatar',
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

    if (role && role !== 'all') {
      dbQuery = dbQuery.where('users.role', '=', role);
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

  // GET /system/users/classes - List all classes for the school (for new user student assignment)
  .get('/system/users/classes', async ({ cookie }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_VIEW);
    if (!perm) return { error: 'no_permission' };

    const classes = await db.selectFrom('classes')
      .innerJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .select([
        'classes.class_id',
        'classes.prefix',
        'classes.suffix',
        sql<string>`concat(classes.prefix, COALESCE(TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, ''), classes.suffix)`.as('class_name')
      ])
      .where('scopes.school_id', '=', user.school_id)
      .execute();

    return Response.json({ success: true, data: classes });
  })

  // GET /system/users/unlinked_persons - Get persons who don't have a user account yet
  .get('/system/users/unlinked_persons', async ({ cookie }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_VIEW);
    if (!perm) return { error: 'no_permission' };

    // Unlinked Students
    const unlinked_students = await db.selectFrom('persons')
      .innerJoin('students', 'students.person_id', 'persons.person_id')
      .innerJoin('classes', 'classes.class_id', 'students.class_id')
      .innerJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
      .leftJoin('users', 'users.person_id', 'persons.person_id')
      .select([
        'persons.person_id',
        'persons.first_name',
        'persons.last_name',
        'persons.avatar',
        sql<string>`'student'`.as('suggested_role')
      ])
      .where('scopes.school_id', '=', user.school_id)
      .where('users.user_id', 'is', null)
      .execute();

    // Unlinked Teachers/Staff
    const unlinked_teachers = await db.selectFrom('persons')
      .innerJoin('teachers', 'teachers.person_id', 'persons.person_id')
      .leftJoin('users', 'users.person_id', 'persons.person_id')
      .select([
        'persons.person_id',
        'persons.first_name',
        'persons.last_name',
        'persons.avatar',
        sql<string>`'teacher'`.as('suggested_role')
      ])
      .where('teachers.school_id', '=', user.school_id)
      .where('users.user_id', 'is', null)
      .execute();

    // Unlinked Parents
    const unlinked_parents = await db.selectFrom('persons')
      .innerJoin('family_relations', 'family_relations.target_id', 'persons.person_id')
      .innerJoin('students', 'students.person_id', 'family_relations.source_id')
      .innerJoin('classes', 'classes.class_id', 'students.class_id')
      .innerJoin('scopes', 'scopes.scope_id', 'classes.scope_id')
      .leftJoin('users', 'users.person_id', 'persons.person_id')
      .select([
        'persons.person_id',
        'persons.first_name',
        'persons.last_name',
        'persons.avatar',
        sql<string>`'parent'`.as('suggested_role')
      ])
      .where('scopes.school_id', '=', user.school_id)
      .where('users.user_id', 'is', null)
      .execute();

    // Deduplicate (person might be a parent and a teacher, etc.)
    const all = [...unlinked_students, ...unlinked_teachers, ...unlinked_parents];
    const unique = Array.from(new Map(all.map(item => [item.person_id, item])).values());

    return Response.json({ success: true, data: unique });
  })

  // POST /system/users - Create a new user or link an existing person
  .post('/system/users', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_EDIT);
    if (!perm) return { error: 'no_permission' };

    const { mode, person_id, username, password, role, first_name, last_name, email, class_id, is_distance, employee_number, cabinet_id, contract_type, hours_per_week } = body;


    // Validation
    if (!username || username.length < 3) return Response.json({ error: 'invalid_username' }, { status: 400 });
    if (!password || password.length < 8) return Response.json({ error: 'password_too_short' }, { status: 400 });

    const existing = await db.selectFrom('users').select('user_id').where('username', '=', username).executeTakeFirst();
    if (existing) return Response.json({ error: 'username_exists' }, { status: 400 });

    try {
      return await db.transaction().execute(async (trx) => {
        let pId = person_id;

        if (mode === 'new') {
          // Create new person
          const personResult = await trx.insertInto('persons')
            .values({
              first_name: first_name || '',
              last_name: last_name || '',
              gender: 0
            } as any)
            .executeTakeFirstOrThrow();
          pId = Number(personResult.insertId);

          if (email) {
            await trx.insertInto('emails')
              .values({
                person_id: pId,
                email,
                type: 'school',
                is_verified: true,
                description: 'Hlavní email'
              } as any)
              .execute();
          }

          // Create student/teacher record if needed
          if (role === 'student' && class_id) {
            await trx.insertInto('students')
              .values({
                person_id: pId,
                class_id,
                status: 'active',
                abroad: is_distance ? 1 : 0
              } as any)
              .execute();
          } else if (role === 'teacher' || role === 'management' || role === 'admin_staff') {
            await trx.insertInto('teachers')
              .values({
                person_id: pId,
                school_id: user.school_id,
                role: (role === 'teacher' || role === 'management' || role === 'admin_staff') ? role : 'teacher',
                status: 'active',
                employee_number: employee_number || null,
                cabinet_id: cabinet_id || null,
                contract_type: contract_type || 'fulltime',
                hours_per_week: hours_per_week || 40
              } as any)
              .execute();
          }

        } else {
          // Mode import: person_id must be provided
          if (!pId) return Response.json({ error: 'missing_person_id' }, { status: 400 });
          
          // Verify person exists and is not already linked
          const personCheck = await trx.selectFrom('users').select('user_id').where('person_id', '=', pId).executeTakeFirst();
          if (personCheck) return Response.json({ error: 'person_already_linked' }, { status: 400 });
        }

        // Hash and save password
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);
        const passwordResult = await trx.insertInto('passwords')
          .values({ password: hashedPassword })
          .executeTakeFirstOrThrow();

        // Create user
        const userResult = await trx.insertInto('users')
          .values({
            username,
            person_id: pId,
            school_id: user.school_id,
            role,
            login_type: 'local',
            password_id: Number(passwordResult.insertId),
            locale: 'cs',
            theme: 0
          } as any)
          .executeTakeFirstOrThrow();

        return { success: true, user_id: Number(userResult.insertId) };
      });
    } catch (err: any) {
      console.error('User creation error:', err);
      return Response.json({ error: 'db_error', details: err.message }, { status: 500 });
    }
  }, {
    body: t.Object({
      mode: t.Union([t.Literal('new'), t.Literal('import')]),
      person_id: t.Optional(t.Number()),
      username: t.String(),
      password: t.String(),
      role: t.String(),
      first_name: t.Optional(t.String()),
      last_name: t.Optional(t.String()),
      email: t.Optional(t.String()),
      class_id: t.Optional(t.Number()),
      is_distance: t.Optional(t.Boolean()),
      employee_number: t.Optional(t.String()),
      cabinet_id: t.Optional(t.Union([t.Number(), t.Null()])),
      contract_type: t.Optional(t.String()),
      hours_per_week: t.Optional(t.Number())
    })

  })


  // GET /system/users/ldap_unimported - Get unimported LDAP users
  .get('/system/users/ldap_unimported', async ({ cookie }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_VIEW);
    if (!perm) return { error: 'no_permission' };
    try {
      const { ldapGetUsers } = await import('../../../../functions/ldap.service');
      const adUsers = await ldapGetUsers();
      
      const existingUsers = await db.selectFrom('users')
        .select('username')
        .execute();
      
      const existingUsernames = new Set(existingUsers.map(u => u.username.toLowerCase()));
      const unimported = adUsers.filter((u: any) => !existingUsernames.has(u.username.toLowerCase()));
      
      return Response.json({ success: true, data: unimported });
    } catch (err: any) {
       return Response.json({ success: false, error: err.message || 'Nepodařilo se načíst uživatele z AD' }, { status: 500 });
    }
  })

  // POST /system/users/ldap_import - Import LDAP users
  .post('/system/users/ldap_import', async ({ cookie, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_EDIT);
    if (!perm) return { error: 'no_permission' };
    const { users } = body;
    if (!users || !Array.isArray(users) || users.length === 0) {
      return Response.json({ error: 'invalid_data' }, { status: 400 });
    }

    try {
      const importedUsers = [];
      const bcrypt = await import('bcryptjs');
      const dummyPasswordHash = await bcrypt.hash(Math.random().toString(36), 12);
      
      for (const u of users) {
        const existing = await db.selectFrom('users').select('username').where('username', '=', u.username).executeTakeFirst();
        if (existing) continue;

        let personId: number | null = null;
        
        if (u.email) {
          const existingEmail = await db.selectFrom('emails').select('person_id').where('email', '=', u.email).executeTakeFirst();
          if (existingEmail) {
            personId = existingEmail.person_id;
          }
        }

        if (!personId) {
          const personResult = await db.insertInto('persons')
            .values({
              first_name: u.first_name || '',
              last_name: u.last_name || '',
              gender: 0
            } as any)
            .executeTakeFirst();
          personId = Number(personResult.insertId);

          if (u.email) {
              await db.insertInto('emails')
                .ignore()
                .values({
                  person_id: personId,
                  email: u.email,
                  type: 'school',
                  is_verified: true,
                  description: 'Hlavní email'
                } as any)
                .execute();
          }
        }

        const passwordResult = await db.insertInto('passwords')
          .values({ password: dummyPasswordHash })
          .executeTakeFirst();

        const userResult = await db.insertInto('users')
          .values({
            username: u.username,
            person_id: personId,
            school_id: user.school_id,
            role: u.role || 'student',
            login_type: 'ldap',
            password_id: Number(passwordResult.insertId),
            locale: 'cs',
            theme: 0
          } as any)
          .executeTakeFirst();

        importedUsers.push({ user_id: Number(userResult.insertId), username: u.username });
      }

      return Response.json({ success: true, imported: importedUsers.length });
    } catch (err: any) {
      console.error('LDAP import error', err);
      return Response.json({ success: false, error: 'Database error' }, { status: 500 });
    }
  }, {
    body: t.Object({
      users: t.Array(t.Object({
        username: t.String(),
        first_name: t.String(),
        last_name: t.String(),
        email: t.Optional(t.String()),
        role: t.String()
      }))
    })
  })

  // GET /system/users/:userId - Get a single user detail
  .get('/system/users/:userId', async ({ cookie, params }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_VIEW);
    if (!perm) return { error: 'no_permission' };

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
        'persons.avatar',
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
  .patch('/system/users/:userId', async ({ cookie, params, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_EDIT);
    if (!perm) return { error: 'no_permission' };

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
  .post('/system/users/:userId/reset-password', async ({ cookie, params, body }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.USERS_EDIT);
    if (!perm) return { error: 'no_permission' };

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
