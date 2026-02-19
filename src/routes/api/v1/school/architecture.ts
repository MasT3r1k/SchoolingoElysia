import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
    .get('/architecture/overview', async ({ school, user }: any) => {
        if (!user || (!user.isPrincipal && user.manager != -1)) {
            return { error: 'unauthorized', status: 401 };
        }
        if (!school) return { error: 'school_not_found', status: 412 };

        const stats = await Promise.all([
            db.selectFrom('buildings')
                .select(sql<number>`count(*)`.as('count'))
                .where('school_id', '=', school.schoolId)
                .executeTakeFirst(),
            db.selectFrom('building_rooms')
                .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
                .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
                .select(sql<number>`count(*)`.as('count'))
                .where('buildings.school_id', '=', school.schoolId)
                .executeTakeFirst(),
            db.selectFrom('supervision_places')
                .select(sql<number>`count(*)`.as('count'))
                .where('school_id', '=', school.schoolId)
                .executeTakeFirst()
        ]);

        return {
            buildings: Number(stats[0]?.count || 0),
            rooms: Number(stats[1]?.count || 0),
            hallways: Number(stats[2]?.count || 0),
        };
    })

    // Buildings CRUD
    .get('/architecture/buildings', async ({ school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        const buildings = await db.selectFrom('buildings')
            .selectAll()
            .where('school_id', '=', school.schoolId)
            .execute();

        return { buildings };
    })
    .post('/architecture/buildings', async ({ body, school, user }: any) => {
        if (!user || (!user.isPrincipal && user.manager != -1)) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        const { building_id, name, type } = body;

        try {
            if (building_id) {
                await db.updateTable('buildings')
                    .set({ name, type })
                    .where('building_id', '=', building_id)
                    .where('school_id', '=', school.schoolId)
                    .execute();
                return { success: true, building_id };
            } else {
                const result = await db.insertInto('buildings')
                    .values({
                        school_id: school.schoolId,
                        name,
                        type
                    })
                    .executeTakeFirst();
                return { success: true, building_id: Number(result.insertId) };
            }
        } catch (e) {
            return { error: 'db_error', details: e };
        }
    }, {
        body: t.Object({
            building_id: t.Optional(t.Number()),
            name: t.String(),
            type: t.Union([t.Literal('school'), t.Literal('canteen'), t.Literal('workshop'), t.Literal('other')])
        })
    })

    // Floors
    .get('/architecture/buildings/:id/floors', async ({ params, school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };
        
        const floors = await db.selectFrom('building_floors')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select(['building_floors.bf_id', 'building_floors.level', 'building_floors.floor_plan'])
            .where('building_floors.building_id', '=', Number(params.id))
            .where('buildings.school_id', '=', school.schoolId)
            .orderBy('level', 'asc')
            .execute();

        return { floors };
    })
    .post('/architecture/floors', async ({ body, school, user }: any) => {
        if (!user || (!user.isPrincipal && user.manager != -1)) return { error: 'unauthorized', status: 401 };

        const { bf_id, building_id, level, floor_plan } = body;

        // Verify building belongs to school
        const building = await db.selectFrom('buildings')
            .select('building_id')
            .where('building_id', '=', building_id)
            .where('school_id', '=', school.schoolId)
            .executeTakeFirst();
        
        if (!building) return { error: 'no_permission' };

        try {
            if (bf_id) {
                await db.updateTable('building_floors')
                    .set({ level, floor_plan })
                    .where('bf_id', '=', bf_id)
                    .execute();
                return { success: true, bf_id };
            } else {
                const result = await db.insertInto('building_floors')
                    .values({ building_id, level, floor_plan })
                    .executeTakeFirst();
                return { success: true, bf_id: Number(result.insertId) };
            }
        } catch (e) {
            return { error: 'db_error', details: e };
        }
    }, {
        body: t.Object({
            bf_id: t.Optional(t.Number()),
            building_id: t.Number(),
            level: t.Number(),
            floor_plan: t.Optional(t.String())
        })
    })

    // Rooms
    .get('/architecture/floors/:id/rooms', async ({ params, school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };

        const rooms = await db.selectFrom('building_rooms')
            .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select(['building_rooms.br_id', 'building_rooms.name', 'building_rooms.type', 'building_rooms.capacity', 'building_rooms.pos_x', 'building_rooms.pos_y'])
            .where('building_rooms.floor_id', '=', Number(params.id))
            .where('buildings.school_id', '=', school.schoolId)
            .execute();

        return { rooms };
    })
    .post('/architecture/rooms', async ({ body, school, user }: any) => {
        if (!user || (!user.isPrincipal && user.manager != -1)) return { error: 'unauthorized', status: 401 };

        const { br_id, floor_id, name, type, capacity, pos_x, pos_y } = body;

        // Verify floor belongs to school
        const floor = await db.selectFrom('building_floors')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select('bf_id')
            .where('bf_id', '=', floor_id)
            .where('buildings.school_id', '=', school.schoolId)
            .executeTakeFirst();
        
        if (!floor) return { error: 'no_permission' };

        try {
            if (br_id) {
                await db.updateTable('building_rooms')
                    .set({ name, type, capacity, pos_x, pos_y })
                    .where('br_id', '=', br_id)
                    .execute();
                return { success: true, br_id };
            } else {
                const result = await db.insertInto('building_rooms')
                    .values({ floor_id, name, type, capacity, pos_x, pos_y })
                    .executeTakeFirst();
                return { success: true, br_id: Number(result.insertId) };
            }
        } catch (e) {
            return { error: 'db_error', details: e };
        }
    }, {
        body: t.Object({
            br_id: t.Optional(t.Number()),
            floor_id: t.Number(),
            name: t.String(),
            type: t.String(),
            capacity: t.Optional(t.Number()),
            pos_x: t.Optional(t.Number()),
            pos_y: t.Optional(t.Number())
        })
    })

    // Rooms All
    .get('/architecture/rooms', async ({ school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };

        const rooms = await db.selectFrom('building_rooms')
            .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select(['building_rooms.br_id', 'building_rooms.name', 'building_rooms.type', 'building_rooms.capacity', 'building_rooms.pos_x', 'building_rooms.pos_y', 'buildings.name as building_name', 'building_floors.level'])
            .where('buildings.school_id', '=', school.schoolId)
            .execute();

        return { rooms };
    })
    .delete('/architecture/rooms/:id', async ({ params, school, user }: any) => {
        if (!user || (!user.isPrincipal && user.manager != -1)) return { error: 'unauthorized', status: 401 };
        
        await db.deleteFrom('building_rooms')
            .where('br_id', '=', Number(params.id))
            .execute();
        return { success: true };
    })

    // Floors All
    .get('/architecture/floors-all', async ({ school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };

        const floors = await db.selectFrom('building_floors')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select(['building_floors.bf_id', 'building_floors.level', 'buildings.name as building_name'])
            .where('buildings.school_id', '=', school.schoolId)
            .execute();

        return { floors };
    })
    
    .delete('/architecture/buildings/:id', async ({ params, school, user }: any) => {
        if (!user || (!user.isPrincipal && user.manager != -1)) return { error: 'unauthorized', status: 401 };
        await db.deleteFrom('buildings')
            .where('building_id', '=', Number(params.id))
            .where('school_id', '=', school.schoolId)
            .execute();
        return { success: true };
    })

    // Supervision Places (Hallways/etc)
    .get('/architecture/hallways', async ({ school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        const hallways = await db.selectFrom('supervision_places')
            .selectAll()
            .where('school_id', '=', school.schoolId)
            .execute();

        return { hallways };
    })
    .post('/architecture/hallways', async ({ body, school, user }: any) => {
        if (!user || (!user.isPrincipal && user.manager != -1)) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        const { placeId, name, description } = body;

        try {
            if (placeId) {
                await db.updateTable('supervision_places')
                    .set({ name, description })
                    .where('placeId', '=', placeId)
                    .where('school_id', '=', school.schoolId)
                    .execute();
                return { success: true, placeId };
            } else {
                const result = await db.insertInto('supervision_places')
                    .values({
                        school_id: school.schoolId,
                        name,
                        description
                    })
                    .executeTakeFirst();
                return { success: true, placeId: Number(result.insertId) };
            }
        } catch (e) {
            return { error: 'db_error', details: e };
        }
    }, {
        body: t.Object({
            placeId: t.Optional(t.Number()),
            name: t.String(),
            description: t.Optional(t.String())
        })
    });

export default app;
