import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

const app = new Elysia()
    .get('/timetable/rooms', async () => {
        const rooms = await db.selectFrom('building_rooms')
            .select(['room_id', 'name'])
            .orderBy('name')
            .execute();
        
        return rooms;
    }, {
        detail: {
            tags: ['Timetable', 'Rooms'],
            summary: 'Get all building rooms',
            description: 'Returns a list of all rooms with their IDs and names.'
        },
        response: t.Array(t.Object({
            room_id: t.Number(),
            name: t.String()
        }))
    });

export default app;
