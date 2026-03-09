import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { PermissionService } from '../../../../functions/permission.service';
import { GlobalPermissions } from '../../../../config/permissions.config';
import { getAuthUser } from '../../../../utils/auth';


const app = new Elysia({ prefix: '/school' })
    .get('/architecture/overview', async ({ cookie, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_VIEW);
        if (!perm) return { error: 'no_permission' };
        if (!school) return { error: 'school_not_found', status: 412 };

        const stats = await Promise.all([
            db.selectFrom('buildings')
                .select(sql<number>`count(*)`.as('count'))
                .where('school_id', '=', school.school_id)
                .executeTakeFirst(),
            db.selectFrom('building_rooms')
                .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
                .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
                .select(sql<number>`count(*)`.as('count'))
                .where('buildings.school_id', '=', school.school_id)
                .executeTakeFirst(),
            db.selectFrom('supervision_places')
                .select(sql<number>`count(*)`.as('count'))
                .where('school_id', '=', school.school_id)
                .executeTakeFirst(),
            db.selectFrom('inventory')
                .select(sql<number>`count(*)`.as('count'))
                .where('school_id', '=', school.school_id)
                .executeTakeFirst()
        ]);

        return {
            buildings: Number(stats[0]?.count || 0),
            rooms: Number(stats[1]?.count || 0),
            hallways: Number(stats[2]?.count || 0),
            inventory: Number(stats[3]?.count || 0)
        };
    })

    // Buildings CRUD
    .get('/architecture/buildings', async ({ cookie, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_VIEW);
        if (!perm) return { error: 'no_permission' };
        if (!school) return { error: 'school_not_found', status: 412 };

        const buildings = await db.selectFrom('buildings')
            .leftJoin('building_floors', 'building_floors.building_id', 'buildings.building_id')
            .leftJoin('building_rooms', 'building_rooms.floor_id', 'building_floors.bf_id')
            .select([
                'buildings.building_id',
                'buildings.school_id',
                'buildings.name',
                'buildings.type',
                sql<number>`COUNT(building_rooms.room_id)`.as('rooms_count'),
                sql<number>`COALESCE(SUM(building_rooms.capacity), 0)`.as('persons_capacity')
            ])
            .where('buildings.school_id', '=', school.school_id)
            .groupBy('buildings.building_id')
            .execute();

        return { buildings };
    })
    .post('/architecture/buildings', async ({ cookie, body, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_EDIT);
        if (!perm) return { error: 'no_permission' };
        if (!school) return { error: 'school_not_found', status: 412 };

        const { building_id, name, type } = body;

        try {
            if (building_id) {
                await db.updateTable('buildings')
                    .set({ name, type })
                    .where('building_id', '=', building_id)
                    .where('school_id', '=', school.school_id)
                    .execute();
                return { success: true, building_id };
            } else {
                const result = await db.insertInto('buildings')
                    .values({
                        school_id: school.school_id,
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
    .get('/architecture/buildings/:id/floors', async ({ cookie, params, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_VIEW);
        if (!perm) return { error: 'no_permission' };
        
        const floors = await db.selectFrom('building_floors')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select(['building_floors.bf_id', 'building_floors.level', 'building_floors.floor_plan'])
            .where('building_floors.building_id', '=', Number(params.id))
            .where('buildings.school_id', '=', school.school_id)
            .orderBy('level', 'asc')
            .execute();

        return { floors };
    })
    .post('/architecture/floors', async ({ cookie, body, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_EDIT);
        if (!perm) return { error: 'no_permission' };

        const { bf_id, building_id, level, floor_plan } = body;

        // Verify building belongs to school
        const building = await db.selectFrom('buildings')
            .select('building_id')
            .where('building_id', '=', building_id)
            .where('school_id', '=', school.school_id)
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
    .delete('/architecture/floors/:id', async ({ cookie, params, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_EDIT);
        if (!perm) return { error: 'no_permission' };
        // First verify the floor belongs to the school
        const floor = await db.selectFrom('building_floors')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select('bf_id')
            .where('bf_id', '=', Number(params.id))
            .where('buildings.school_id', '=', school.school_id)
            .executeTakeFirst();
            
        if (!floor) return { error: 'no_permission' };

        await db.deleteFrom('building_floors')
            .where('bf_id', '=', Number(params.id))
            .execute();
            
        return { success: true };
    })

    // Rooms
    .get('/architecture/floors/:id/rooms', async ({ cookie, params, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_VIEW);
        if (!perm) return { error: 'no_permission' };

        const rooms = await db.selectFrom('building_rooms')
            .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .leftJoin('persons', 'persons.person_id', 'building_rooms.manager_id')
            .select([
                'building_rooms.room_id', 
                'building_rooms.name', 
                'building_rooms.type', 
                'building_rooms.description', 
                'building_rooms.manager_id', 
                'building_rooms.capacity', 
                'building_rooms.pos_x', 
                'building_rooms.pos_y',
                'persons.first_name as manager_firstName',
                'persons.last_name as manager_lastName'
            ])
            .where('building_rooms.floor_id', '=', Number(params.id))
            .where('buildings.school_id', '=', school.school_id)
            .execute();

        return { rooms };
    })
    .post('/architecture/rooms', async ({ cookie, body, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_EDIT);
        if (!perm) return { error: 'no_permission' };

        const { br_id, floor_id, name, type, description, manager, capacity, pos_x, pos_y } = body;

        // Verify floor belongs to school
        const floor = await db.selectFrom('building_floors')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select('bf_id')
            .where('bf_id', '=', floor_id)
            .where('buildings.school_id', '=', school.school_id)
            .executeTakeFirst();
        
        if (!floor) return { error: 'no_permission' };

        try {
            if (br_id) {
                await db.updateTable('building_rooms')
                    .set({ name, type, description, manager_id: manager, capacity, pos_x, pos_y })
                    .where('room_id', '=', br_id)
                    .execute();
                return { success: true, room_id: br_id };
            } else {
                const result = await db.insertInto('building_rooms')
                    .values({ floor_id, name, type, description, manager_id: manager, capacity, pos_x, pos_y })
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
            description: t.Optional(t.String()),
            manager: t.Optional(t.Number()),
            capacity: t.Optional(t.Number()),
            pos_x: t.Optional(t.Number()),
            pos_y: t.Optional(t.Number())
        })
    })

    // Rooms All
    .get('/architecture/rooms', async ({ cookie, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_VIEW);
        if (!perm) return { error: 'no_permission' };

        const rooms = await db.selectFrom('building_rooms')
            .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .leftJoin('persons', 'persons.person_id', 'building_rooms.manager_id')
            .select([
                'building_rooms.room_id', 
                'building_rooms.name', 
                'building_rooms.type', 
                'building_rooms.description', 
                'building_rooms.manager_id', 
                'building_rooms.capacity', 
                'building_rooms.pos_x', 
                'building_rooms.pos_y', 
                'buildings.name as building_name', 
                'building_floors.level',
                'persons.first_name as manager_firstName',
                'persons.last_name as manager_lastName'
            ])
            .where('buildings.school_id', '=', school.school_id)
            .execute();

        return { rooms };
    })
    .delete('/architecture/rooms/:id', async ({ cookie, params }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_EDIT);
        if (!perm) return { error: 'no_permission' };
        
        await db.deleteFrom('building_rooms')
            .where('room_id', '=', Number(params.id))
            .execute();
        return { success: true };
    })

    // Floors All
    .get('/architecture/floors-all', async ({ cookie, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_VIEW);
        if (!perm) return { error: 'no_permission' };

        const floors = await db.selectFrom('building_floors')
            .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select(['building_floors.bf_id', 'building_floors.level', 'buildings.name as building_name'])
            .where('buildings.school_id', '=', school.school_id)
            .execute();

        return { floors };
    })
    
    .delete('/architecture/buildings/:id', async ({ cookie, params, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_EDIT);
        if (!perm) return { error: 'no_permission' };
        await db.deleteFrom('buildings')
            .where('building_id', '=', Number(params.id))
            .where('school_id', '=', school.school_id)
            .execute();
        return { success: true };
    })

    // Supervision Places (Hallways/etc)
    .get('/architecture/hallways', async ({ cookie, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_VIEW);
        if (!perm) return { error: 'no_permission' };
        if (!school) return { error: 'school_not_found', status: 412 };

        const hallways = await db.selectFrom('supervision_places')
            .selectAll()
            .where('school_id', '=', school.school_id)
            .execute();

        return { hallways };
    })
    .post('/architecture/hallways', async ({ cookie, body, school }: any) => {
        const user = await getAuthUser(cookie?.token?.value as string, cookie);
        if (!user) return { error: 'no_permission' };
        const perm = await PermissionService.hasPermission(user.user_id, GlobalPermissions.ARCHITECTURE_EDIT);
        if (!perm) return { error: 'no_permission' };
        if (!school) return { error: 'school_not_found', status: 412 };

        const { placeId, name, description } = body;

        try {
            if (placeId) {
                await db.updateTable('supervision_places')
                    .set({ name, description })
                    .where('place_id', '=', placeId)
                    .where('school_id', '=', school.school_id)
                    .execute();
                return { success: true, placeId };
            } else {
                const result = await db.insertInto('supervision_places')
                    .values({
                        school_id: school.school_id,
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
