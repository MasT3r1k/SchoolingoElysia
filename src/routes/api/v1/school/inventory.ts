import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia({ prefix: '/school' })
    .get('/inventory', async ({ school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        const items = await db.selectFrom('inventory')
            .leftJoin('building_rooms', 'building_rooms.room_id', 'inventory.room_id')
            .leftJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
            .leftJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
            .select([
                'inventory.inventory_id',
                'inventory.name',
                'inventory.description',
                'inventory.serial_number',
                'inventory.category',
                'inventory.status',
                'inventory.acquisition_date',
                'inventory.purchase_price',
                'inventory.room_id',
                'building_rooms.name as room_name',
                'buildings.name as building_name',
                'building_floors.level as floor_level'
            ])
            .where('inventory.school_id', '=', school.school_id)
            .execute();

        return { items };
    })
    .get('/inventory/room/:id', async ({ params, school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        const items = await db.selectFrom('inventory')
            .selectAll()
            .where('room_id', '=', Number(params.id))
            .where('school_id', '=', school.school_id)
            .execute();

        return { items };
    })
    .get('/inventory/:id/logs', async ({ params, school, user }: any) => {
        if (!user) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        const logs = await db.selectFrom('inventory_logs')
            .innerJoin('inventory', 'inventory.inventory_id', 'inventory_logs.inventory_id')
            .leftJoin('persons', 'persons.person_id', 'inventory_logs.person_id')
            .leftJoin('building_rooms as from_room', 'from_room.room_id', 'inventory_logs.from_room_id')
            .leftJoin('building_rooms as to_room', 'to_room.room_id', 'inventory_logs.to_room_id')
            .select([
                'inventory_logs.log_id',
                'inventory_logs.action',
                'inventory_logs.note',
                'inventory_logs.created_at',
                'persons.first_name',
                'persons.last_name',
                'from_room.name as from_room_name',
                'to_room.name as to_room_name'
            ])
            .where('inventory_logs.inventory_id', '=', Number(params.id))
            .where('inventory.school_id', '=', school.school_id)
            .orderBy('inventory_logs.created_at', 'desc')
            .execute();

        return { logs };
    })
    .post('/inventory', async ({ body, school, user }: any) => {
        if (!user || (!user.is_principal && user.manager != -1)) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        const { inventory_id, room_id, name, description, serial_number, category, status, acquisition_date, purchase_price, note } = body;

        try {
            if (inventory_id) {
                // Get current state for logging
                const currentItem = await db.selectFrom('inventory')
                    .select(['room_id', 'status'])
                    .where('inventory_id', '=', inventory_id)
                    .where('school_id', '=', school.school_id)
                    .executeTakeFirst();
                
                if (!currentItem) return { error: 'not_found' };

                await db.updateTable('inventory')
                    .set({
                        room_id: room_id || null,
                        name,
                        description,
                        serial_number,
                        category,
                        status,
                        acquisition_date,
                        purchase_price: purchase_price || null
                    })
                    .where('inventory_id', '=', inventory_id)
                    .execute();

                // Log movement if room changed
                if (currentItem.room_id !== (room_id || null)) {
                    await db.insertInto('inventory_logs')
                        .values({
                            inventory_id,
                            person_id: user.person_id,
                            from_room_id: currentItem.room_id,
                            to_room_id: room_id || null,
                            action: 'move',
                            note: note || 'Item moved'
                        })
                        .execute();
                }

                // Log status change
                if (currentItem.status !== status) {
                    await db.insertInto('inventory_logs')
                        .values({
                            inventory_id,
                            person_id: user.person_id,
                            from_room_id: room_id || null,
                            to_room_id: room_id || null,
                            action: 'update_status',
                            note: note || `Status changed to ${status}`
                        })
                        .execute();
                }

                return { success: true, inventory_id };
            } else {
                const result = await db.insertInto('inventory')
                    .values({
                        school_id: school.school_id,
                        room_id: room_id || null,
                        name,
                        description,
                        serial_number,
                        category,
                        status: status || 'active',
                        acquisition_date,
                        purchase_price: purchase_price || null
                    })
                    .executeTakeFirst();
                
                const newId = Number(result.insertId);

                // Log creation
                await db.insertInto('inventory_logs')
                    .values({
                        inventory_id: newId,
                        person_id: user.person_id,
                        from_room_id: null,
                        to_room_id: room_id || null,
                        action: 'create',
                        note: note || 'Item added to inventory'
                    })
                    .execute();

                return { success: true, inventory_id: newId };
            }
        } catch (e) {
            return { error: 'db_error', details: e };
        }
    }, {
        body: t.Object({
            inventory_id: t.Optional(t.Number()),
            room_id: t.Optional(t.Number()),
            name: t.String(),
            description: t.Optional(t.String()),
            serial_number: t.Optional(t.String()),
            category: t.Optional(t.String()),
            status: t.Optional(t.Union([t.Literal('active'), t.Literal('broken'), t.Literal('discarded'), t.Literal('maintenance')])),
            acquisition_date: t.Optional(t.String()),
            purchase_price: t.Optional(t.Number()),
            note: t.Optional(t.String())
        })
    })

    .delete('/inventory/:id', async ({ params, school, user }: any) => {
        if (!user || (!user.is_principal && user.manager != -1)) return { error: 'unauthorized', status: 401 };
        if (!school) return { error: 'school_not_found', status: 412 };

        await db.deleteFrom('inventory')
            .where('inventory_id', '=', Number(params.id))
            .where('school_id', '=', school.school_id)
            .execute();
        
        return { success: true };
    });

export default app;
