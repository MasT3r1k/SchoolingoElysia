import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
    .derive(async ({ cookie }) => ({
        user: await getAuthUser(cookie?.token?.value as string)
    }))
    .get('/supervision/places', async ({ user }) => {
        if (!user) return { error: 'unauthorized', status: 401 };
        
        const places = await db.selectFrom('supervision_places')
            .selectAll()
            .orderBy('name')
            .execute();
            
        return { places };
    })
    .get('/supervision/schedule', async ({ query, user }) => {
        if (!user) return { error: 'unauthorized', status: 401 };

        const { placeId } = query;
        if (!placeId) return { error: 'missing_place_id' };

        const supervisions = await db.selectFrom('supervisions')
            .innerJoin('persons', 'persons.personId', 'supervisions.teacherId')
            .leftJoin('persons_degree as pd_before', 'pd_before.person', 'persons.personId')
            // This join for titles is simplified, mimicking timetable.ts but might need full logic if strict
            // reusing the logic from timetable.ts for full name is better if possible, but for now simple concatenation or just lastName
            .select([
                'supervisions.supervisionId',
                'supervisions.day',
                'supervisions.hour',
                'supervisions.teacherId',
                'persons.firstName',
                'persons.lastName',
                'supervisions.description'
            ])
            .where('supervisions.placeId', '=', Number(placeId))
            .execute();

        return { supervisions };
    })
    .post('/supervision/manage', async ({ body, user }) => {
        // Auth Check: Only Admins or Scheduler
        if (!user || (!user.isPrincipal && user.manager != -1)) { 
            if (!user) return { error: 'unauthorized', status: 401 };
        }

        const { action, supervisionId, day, hour, teacherId, placeId, description } = body;

        try {
            if (action === 'delete') {
                if (!supervisionId) return { error: 'missing_id' };
                
                await db.deleteFrom('supervisions')
                    .where('supervisionId', '=', supervisionId)
                    .execute();
                
                return { success: true, action: 'deleted' };
            }
            
            if (action === 'create') {
                if (day === undefined || hour === undefined || !teacherId || !placeId) {
                    return { error: 'missing_fields' };
                }

                const data = {
                    day,
                    hour,
                    teacherId,
                    placeId,
                    description: description || null
                };

                const result = await db.insertInto('supervisions')
                    // @ts-ignore
                    .values(data)
                    .executeTakeFirst();
                    
                return { success: true, action: 'created', id: Number(result.insertId) };
            }
        
            return { error: 'invalid_action' };

        } catch (e) {
            console.error(e);
            return { error: 'db_error', details: e };
        }

    }, {
        body: t.Object({
            action: t.String(), // 'create', 'delete'
            supervisionId: t.Optional(t.Number()),
            day: t.Optional(t.Number()),
            hour: t.Optional(t.Number()),
            teacherId: t.Optional(t.Number()),
            placeId: t.Optional(t.Number()),
            description: t.Optional(t.String())
        })
    });

export default app;
