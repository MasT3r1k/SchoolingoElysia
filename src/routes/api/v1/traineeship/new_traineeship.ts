import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';

const app = new Elysia()
  .post(
    '/traineeship/new_traineeship',
    async ({ body, cookie }) => {
      const token = cookie.token?.value as string;
      if (!token) return { error: 'no_user', details: 'no_cookie' };

      const auth = await db
        .selectFrom('tokens')
        .leftJoin('users', 'users.user_id', 'tokens.user_id')
        .select(['tokens.token_id', 'tokens.user_id', 'users.person_id', 'users.manager', 'users.principal', 'users.role'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', new Date())
        .executeTakeFirst();

      if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

      // check admin or manager role
      const isTraineeshipManager = auth.manager === -1 || (auth.manager && (auth.manager & 64));
      if (!isTraineeshipManager) {
         return Response.json({ status: 'error', error: 'unauthorized', details: 'Insufficient permissions' });
      }

      const { name, start, end, groups, ignoredDays } = body;

      try {
        const ignoredDaysStr = JSON.stringify(ignoredDays);
        
        for (const groupName of groups) {
            let groupId = null;
            const classMatch = groupName.match(/^(\\d+)\\.(.*)$/);
            
            if (classMatch) {
                const prefix = classMatch[1];
                const suffix = classMatch[2];
                // find class
                const clazz = await db.selectFrom('classes')
                    .select('class_id')
                    .where('prefix', '=', prefix)
                    .where('suffix', '=', suffix)
                    .executeTakeFirst();
                    
                if (clazz) {
                    const group = await db.selectFrom('groups')
                        .select('group_id')
                        .where('class_id', '=', clazz.class_id)
                        .where('num', '=', 0) // assuming num=0 is whole class, adjust if necessary
                        .executeTakeFirst();
                        
                    if (group) {
                        groupId = group.group_id;
                    }
                }
            }
            
            if (groupId) {
                await db.insertInto('traineeship_weeks')
                    .values({
                        group_id: groupId,
                        name: name,
                        start: moment(start).toDate(),
                        end: moment(end).toDate(),
                        ignored_days: ignoredDaysStr,
                        state: 'active'
                    })
                    .execute();
            }
        }

        return Response.json({
          status: 'success'
        });

      } catch (e: any) {
        console.error(e);
        return Response.json({
          status: 'error',
          error: 'failed_to_save',
          details: e.message
        });
      }
    },
    {
      body: t.Object({
        name: t.String(),
        start: t.String(),
        end: t.String(),
        groups: t.Array(t.String()),
        ignoredDays: t.Array(t.Number())
      })
    }
  );

export default app;
