import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';

const app = new Elysia()
    .get('/timetable/availability', async ({ query }) => {
        const { date, hour } = query;
        const targetDate = moment(date);
        const dayOfWeek = (targetDate.isoWeekday() - 1); // 0-based monday

        // 1. Get current school year
        const sy = await db.selectFrom('school_years')
            .select('sy_id')
            .where('start', '<=', targetDate.toDate())
            .where('end', '>=', targetDate.toDate())
            .executeTakeFirst();
            
        const sy_id = sy ? sy.sy_id : -1;

        // 2. Occupied teachers
        const occupiedTeachersRes = await db.selectFrom('timetable')
            .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
            .select(['timetable.teacher_id', 'timetable.teacher2_id'])
            .where('timetable.day', '=', dayOfWeek)
            .where('timetable.hour', '=', hour)
            .where('groups.year_id', '=', sy_id)
            .execute();

        const occupiedTeachersSubRes = await db.selectFrom('substitution')
            .innerJoin('groups', 'groups.group_id', 'substitution.group_id')
            .select(['substitution.teacher_id', 'substitution.teacher2_id'])
            .where('substitution.start_date', '<=', targetDate.toDate())
            .where('substitution.end_date', '>=', targetDate.toDate())
            .where('substitution.start_hour', '<=', hour)
            .where('substitution.end_hour', '>=', hour)
            .where('groups.year_id', '=', sy_id)
            .execute();

        const cancelledSubRes = await db.selectFrom('substitution')
            .innerJoin('groups', 'groups.group_id', 'substitution.group_id')
            .select(['substitution.teacher_id', 'substitution.teacher2_id', 'substitution.room_id', 'substitution.type'])
            .where('substitution.start_date', '<=', targetDate.toDate())
            .where('substitution.end_date', '>=', targetDate.toDate())
            .where('substitution.start_hour', '<=', hour)
            .where('substitution.end_hour', '>=', hour)
            .where('substitution.type', '=', 'cancelled')
            .where('groups.year_id', '=', sy_id)
            .execute();

        let occupiedTeachers = new Set<number>();
        occupiedTeachersRes.forEach(t => {
            if (t.teacher_id) occupiedTeachers.add(t.teacher_id);
            if (t.teacher2_id) occupiedTeachers.add(t.teacher2_id);
        });
        occupiedTeachersSubRes.forEach(t => {
            if (t.teacher_id) occupiedTeachers.add(t.teacher_id);
            if (t.teacher2_id) occupiedTeachers.add(t.teacher2_id);
        });

        // 3. Occupied rooms
        const occupiedRoomsRes = await db.selectFrom('timetable')
            .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
            .select(['timetable.room_id'])
            .where('timetable.day', '=', dayOfWeek)
            .where('timetable.hour', '=', hour)
            .where('timetable.room_id', 'is not', null)
            .where('groups.year_id', '=', sy_id)
            .execute();

        const occupiedRoomsSubRes = await db.selectFrom('substitution')
            .innerJoin('groups', 'groups.group_id', 'substitution.group_id')
            .select(['substitution.room_id'])
            .where('substitution.start_date', '<=', targetDate.toDate())
            .where('substitution.end_date', '>=', targetDate.toDate())
            .where('substitution.start_hour', '<=', hour)
            .where('substitution.end_hour', '>=', hour)
            .where('substitution.room_id', 'is not', null)
            .where('groups.year_id', '=', sy_id)
            .execute();

        let occupiedRooms = new Set<number>();
        occupiedRoomsRes.forEach(r => occupiedRooms.add(r.room_id as number));
        occupiedRoomsSubRes.forEach(r => occupiedRooms.add(r.room_id as number));
        
        // Remove cancelled types from occupied
        cancelledSubRes.forEach(t => {
            if (t.teacher_id) occupiedTeachers.delete(t.teacher_id);
            if (t.teacher2_id) occupiedTeachers.delete(t.teacher2_id);
            if (t.room_id) occupiedRooms.delete(t.room_id as number);
        });

        return {
            teachers: Array.from(occupiedTeachers),
            rooms: Array.from(occupiedRooms)
        };
    }, {
        query: t.Object({
            date: t.String(),
            hour: t.Numeric()
        })
    });

export default app;
