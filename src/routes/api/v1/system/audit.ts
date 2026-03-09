import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';


const app = new Elysia()
  .get('/system/audit', async ({ cookie, query }: any) => {
    const user = await getAuthUser(cookie?.token?.value as string, cookie);
    if (!user) return { error: 'no_permission' };
    const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.AUDIT_VIEW);
    if (!perm) return { error: 'no_permission' };

    const page = query.page ? parseInt(query.page) : 1;
    let limit = query.limit ? parseInt(query.limit) : 20;
    const offset = query.offset ? parseInt(query.offset) : (page - 1) * limit;
    
    if (limit > 100) limit = 100;

    const search = query.search?.toLowerCase();
    const action_filter = query.action;
    const role_filter = query.user_role;
    const time_range = query.time_range;
    const date_from = query.date_from ? new Date(query.date_from) : null;
    const date_to = query.date_to ? new Date(query.date_to) : null;

    // Build Login History Query
    let loginQuery = db.selectFrom('login_history')
      .leftJoin('users', 'users.user_id', 'login_history.user_id')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .select([
        'login_history.login_id as log_id',
        sql<string>`CASE WHEN success = 1 THEN 'login' ELSE 'failed_login' END`.as('action'),
        'login_history.user_id',
        'users.username',
        'users.person_id as person_id',
        'persons.first_name',
        'persons.last_name',
        'users.role as user_role',
        sql<string>`NULL`.as('target_type'),
        sql<number>`NULL`.as('target_id'),
        sql<string>`NULL`.as('target_name'),
        'login_history.ip as ip_address',
        'login_history.user_agent',
        sql<string>`NULL`.as('metadata'),
        'login_history.created as timestamp'
      ]);

    // Build Audit Log Query
    let auditQuery = db.selectFrom('auditlog')
      .leftJoin('users', 'users.user_id', 'auditlog.user_id')
      .leftJoin('persons', 'persons.person_id', 'users.person_id')
      .select([
        'auditlog.audit_id as log_id',
        'auditlog.type as action',
        'auditlog.user_id',
        'users.username',
        'users.person_id as person_id',
        'persons.first_name',
        'persons.last_name',
        'users.role as user_role',
        sql<string>`NULL`.as('target_type'),
        sql<number>`NULL`.as('target_id'),
        sql<string>`NULL`.as('target_name'),
        'auditlog.ip as ip_address',
        sql<string>`NULL`.as('user_agent'),
        'auditlog.data as metadata',
        'auditlog.created as timestamp'
      ]);

    // Apply Time Range Filters
    if (time_range === 'today') {
      const today = new Date();
      today.setHours(0,0,0,0);
      loginQuery = loginQuery.where('login_history.created', '>=', today);
      auditQuery = auditQuery.where('auditlog.created', '>=', today);
    } else if (time_range === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      loginQuery = loginQuery.where('login_history.created', '>=', weekAgo);
      auditQuery = auditQuery.where('auditlog.created', '>=', weekAgo);
    } else if (time_range === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      loginQuery = loginQuery.where('login_history.created', '>=', monthAgo);
      auditQuery = auditQuery.where('auditlog.created', '>=', monthAgo);
    } else if (time_range === 'custom') {
      if (date_from) {
        loginQuery = loginQuery.where('login_history.created', '>=', date_from);
        auditQuery = auditQuery.where('auditlog.created', '>=', date_from);
      }
      if (date_to) {
        loginQuery = loginQuery.where('login_history.created', '<=', date_to);
        auditQuery = auditQuery.where('auditlog.created', '<=', date_to);
      }
    }

    // Apply Role Filter
    if (role_filter && role_filter !== 'all') {
      loginQuery = loginQuery.where('users.role', '=', role_filter as any);
      auditQuery = auditQuery.where('users.role', '=', role_filter as any);
    }

    // Apply Search Filter
    if (search) {
      const searchPattern = `%${search}%`;
      loginQuery = loginQuery.where((eb) => eb.or([
        eb('users.username', 'like', searchPattern),
        eb('persons.first_name', 'like', searchPattern),
        eb('persons.last_name', 'like', searchPattern),
        eb('login_history.ip', 'like', searchPattern)
      ]));
      auditQuery = auditQuery.where((eb) => eb.or([
        eb('users.username', 'like', searchPattern),
        eb('persons.first_name', 'like', searchPattern),
        eb('persons.last_name', 'like', searchPattern),
        eb('auditlog.ip', 'like', searchPattern)
      ]));
    }

    // Filter by School
    if (user.school_id) {
        loginQuery = loginQuery.where('users.school_id', '=', user.school_id);
        auditQuery = auditQuery.where('users.school_id', '=', user.school_id);
    } 

    let includeLogin = true;
    let includeAudit = true;

    if (action_filter) {
      if (['login', 'failed_login'].includes(action_filter)) {
        includeAudit = false;
        if (action_filter === 'login') loginQuery = loginQuery.where('success', '=', true);
        if (action_filter === 'failed_login') loginQuery = loginQuery.where('success', '=', false);
      } else if (['create', 'update', 'delete', 'reset_password'].includes(action_filter)) {
         includeLogin = false;
         const types: string[] = [];
         if (action_filter === 'reset_password') types.push('reset_password', 'change_password');
         if (action_filter === 'create') types.push('created_group', 'added_passkey');
         if (action_filter === 'update') types.push('edited_group', 'refresh_backup_codes', 'activated_2FA');
         if (action_filter === 'delete') types.push('removed_group', 'removed_passkey', 'deactivated_2FA');
         
         if (types.length > 0) {
            auditQuery = auditQuery.where('auditlog.type', 'in', types as any);
         }
      }
    }

    let combinedSource: any;
    if (includeLogin && includeAudit) {
      combinedSource = loginQuery.unionAll(auditQuery as any);
    } else if (includeLogin) {
      combinedSource = loginQuery;
    } else {
      combinedSource = auditQuery;
    }

    // Execute Data Query
    const results = await db.selectFrom(combinedSource.as('combined_logs'))
       .selectAll()
       .orderBy('timestamp', 'desc')
       .limit(limit)
       .offset(offset)
       .execute();

    // Execute Count Query
    const countResult: any = await db.selectFrom(combinedSource.as('combined_logs'))
       .select(sql<number>`count(*)`.as('total'))
       .executeTakeFirst();
       
    const total = Number(countResult?.total || 0);

    const personIds = Array.from(new Set(results.map((r: any) => r.person_id).filter((id): id is number => id !== null)));
    const formattedNames = await format_person_map_by_ids(personIds as number[]);

    return Response.json({
      data: results.map((r: any) => {
        let metadata = {};
        try {
           if (typeof r.metadata === 'string') {
             metadata = JSON.parse(r.metadata);
           } else if (r.metadata) {
             metadata = r.metadata;
           }
        } catch (e) {}
        
        return {
          log_id: r.log_id,
          action: r.action,
          user_id: r.user_id,
          username: r.username,
          user_full_name: r.person_id ? formattedNames.get(r.person_id) : `${r.first_name} ${r.last_name}`,
          user_role: r.user_role,
          target_type: r.target_type,
          target_id: r.target_id,
          target_name: r.target_name,
          ip_address: r.ip_address,
          user_agent: r.user_agent,
          metadata: metadata,
          timestamp: r.timestamp,
          created_at: r.timestamp
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
       user_role: t.Optional(t.String()),
       time_range: t.Optional(t.String()),
       date_from: t.Optional(t.String()),
       date_to: t.Optional(t.String())
    })
  });

export default app;
