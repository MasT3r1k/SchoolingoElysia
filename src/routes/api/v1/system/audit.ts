import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
  .derive(async ({ cookie }) => ({
      user: await getAuthUser(cookie?.token?.value as string)
  }))
  .get('/system/audit', async ({ user, query }) => {
    // Check permissions
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    
    // Allow admins, principals, and potentially others based on role logic
    const allowedRoles = ['admin_staff', 'management'];
    if (user.manager !== -1 && !user.isPrincipal && !allowedRoles.includes(user.role)) {
      return Response.json({ error: 'no_permission' }, { status: 403 });
    }

    const page = query.page ? parseInt(query.page) : 1;
    let limit = query.limit ? parseInt(query.limit) : 20;
    const offset = query.offset ? parseInt(query.offset) : (page - 1) * limit;
    
    if (limit > 100) limit = 100;

    const search = query.search?.toLowerCase();
    const actionFilter = query.action;
    const roleFilter = query.userRole;
    const timeRange = query.timeRange;
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : null;
    const dateTo = query.dateTo ? new Date(query.dateTo) : null;

    // Build Login History Query
    let loginQuery = db.selectFrom('login_history')
      .leftJoin('users', 'users.userId', 'login_history.userId')
      .leftJoin('persons', 'persons.personId', 'users.person')
      .select([
        'login_history.loginId as logId',
        sql<string>`CASE WHEN success = 1 THEN 'login' ELSE 'failed_login' END`.as('action'),
        'login_history.userId',
        'users.username',
        sql<string>`CONCAT(persons.firstName, ' ', persons.lastName)`.as('userFullName'),
        'users.role as userRole',
        sql<string>`NULL`.as('targetType'),
        sql<number>`NULL`.as('targetId'),
        sql<string>`NULL`.as('targetName'),
        'login_history.ip as ipAddress',
        'login_history.userAgent',
        sql<string>`NULL`.as('metadata'),
        'login_history.created as timestamp'
      ]);

    // Build Audit Log Query
    let auditQuery = db.selectFrom('auditlog')
      .leftJoin('users', 'users.userId', 'auditlog.userId')
      .leftJoin('persons', 'persons.personId', 'users.person')
      .select([
        'auditlog.auditId as logId',
        'auditlog.type as action',
        'auditlog.userId',
        'users.username',
        sql<string>`CONCAT(persons.firstName, ' ', persons.lastName)`.as('userFullName'),
        'users.role as userRole',
        sql<string>`NULL`.as('targetType'),
        sql<number>`NULL`.as('targetId'),
        sql<string>`NULL`.as('targetName'),
        'auditlog.ip as ipAddress',
        sql<string>`NULL`.as('userAgent'),
        'auditlog.data as metadata',
        'auditlog.created as timestamp'
      ]);

    // Apply Time Range Filters
    if (timeRange === 'today') {
      const today = new Date();
      today.setHours(0,0,0,0);
      loginQuery = loginQuery.where('login_history.created', '>=', today);
      auditQuery = auditQuery.where('auditlog.created', '>=', today);
    } else if (timeRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      loginQuery = loginQuery.where('login_history.created', '>=', weekAgo);
      auditQuery = auditQuery.where('auditlog.created', '>=', weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      loginQuery = loginQuery.where('login_history.created', '>=', monthAgo);
      auditQuery = auditQuery.where('auditlog.created', '>=', monthAgo);
    } else if (timeRange === 'custom') {
      if (dateFrom) {
        loginQuery = loginQuery.where('login_history.created', '>=', dateFrom);
        auditQuery = auditQuery.where('auditlog.created', '>=', dateFrom);
      }
      if (dateTo) {
        loginQuery = loginQuery.where('login_history.created', '<=', dateTo);
        auditQuery = auditQuery.where('auditlog.created', '<=', dateTo);
      }
    }

    // Apply Role Filter
    if (roleFilter && roleFilter !== 'all') {
      // @ts-ignore
      loginQuery = loginQuery.where('users.role', '=', roleFilter);
      // @ts-ignore
      auditQuery = auditQuery.where('users.role', '=', roleFilter);
    }

    // Apply Search Filter
    if (search) {
      const searchPattern = `%${search}%`;
      loginQuery = loginQuery.where((eb) => eb.or([
        eb('users.username', 'like', searchPattern),
        eb(sql`CONCAT(persons.firstName, ' ', persons.lastName)`, 'like', searchPattern),
        eb('login_history.ip', 'like', searchPattern)
      ]));
      auditQuery = auditQuery.where((eb) => eb.or([
        eb('users.username', 'like', searchPattern),
        eb(sql`CONCAT(persons.firstName, ' ', persons.lastName)`, 'like', searchPattern),
        eb('auditlog.ip', 'like', searchPattern)
      ]));
    }

    // Combine Queries based on Action Filter
    let finalQuery;
    let includeLogin = true;
    let includeAudit = true;


    // Filter by School
    if (user.school) {
        // @ts-ignore
        loginQuery = loginQuery.where('users.school', '=', user.school);
        // @ts-ignore
        auditQuery = auditQuery.where('users.school', '=', user.school);
    } 

    if (actionFilter) {
      if (['login', 'failed_login'].includes(actionFilter)) {
        includeAudit = false;
        if (actionFilter === 'login') loginQuery = loginQuery.where('success', '=', true);
        if (actionFilter === 'failed_login') loginQuery = loginQuery.where('success', '=', false);
      } else if (['create', 'update', 'delete', 'reset_password'].includes(actionFilter)) {
         includeLogin = false;
         const types: string[] = [];
         if (actionFilter === 'reset_password') types.push('reset_password', 'change_password');
         if (actionFilter === 'create') types.push('created_group', 'added_passkey');
         if (actionFilter === 'update') types.push('edited_group', 'refresh_backup_codes', 'activated_2FA');
         if (actionFilter === 'delete') types.push('removed_group', 'removed_passkey', 'deactivated_2FA');
         
         if (types.length > 0) {
            // @ts-ignore
            auditQuery = auditQuery.where('auditlog.type', 'in', types);
         }
      }
    }

    if (includeLogin && includeAudit) {
      finalQuery = loginQuery.unionAll(auditQuery);
    } else if (includeLogin) {
      finalQuery = loginQuery;
    } else {
      finalQuery = auditQuery;
    }

    // Execute Data Query
    const results = await db.selectFrom(finalQuery.as('combined_logs'))
       .selectAll()
       .orderBy('timestamp', 'desc')
       .limit(limit)
       .offset(offset)
       .execute();

    // Execute Count Query
    const countResult = await db.selectFrom(finalQuery.as('combined_logs'))
       .select(sql<number>`count(*)`.as('total'))
       .executeTakeFirst();
       
    const total = Number(countResult?.total || 0);

    return Response.json({
      data: results.map(r => {
        let metadata = {};
        try {
           if (typeof r.metadata === 'string') {
             metadata = JSON.parse(r.metadata);
           } else if (r.metadata) {
             metadata = r.metadata;
           }
        } catch (e) {}
        
        return {
          logId: r.logId,
          action: r.action,
          userId: r.userId,
          username: r.username,
          userFullName: r.userFullName,
          userRole: r.userRole,
          targetType: r.targetType,
          targetId: r.targetId,
          targetName: r.targetName,
          ipAddress: r.ipAddress,
          userAgent: r.userAgent,
          metadata: metadata,
          timestamp: r.timestamp,
          createdAt: r.timestamp
        };
      }),
      meta: {
        total: total,
        page: Math.ceil(offset / limit) + 1,
        limit: limit
      }
    });

  }, {
    query: t.Object({
       limit: t.Optional(t.String()),
       offset: t.Optional(t.String()),
       page: t.Optional(t.String()),
       search: t.Optional(t.String()),
       action: t.Optional(t.String()),
       userRole: t.Optional(t.String()),
       timeRange: t.Optional(t.String()),
       dateFrom: t.Optional(t.String()),
       dateTo: t.Optional(t.String())
    })
  });

export default app;
