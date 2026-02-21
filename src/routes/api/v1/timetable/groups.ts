import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
    .get('/timetable/groups', async ({query, school}: any) => {
        let groupsQuery = db.selectFrom('groups')
            .leftJoin('classes', 'groups.class_id', 'classes.class_id')
            .innerJoin('users', 'users.person_id', 'classes.teacher_id')
            .leftJoin('school_years as syClass', 'syClass.sy_id', 'classes.year_id')
            .leftJoin('school_years', 'school_years.sy_id', 'groups.year_id')
            .where('users.school_id', '=', (school as any).school_id)
            .select([
                'groups.group_id',
                'groups.name',
                'groups.num',
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, syClass.start, CURDATE()) + 1, classes.suffix)`.as('class_name')
            ])
            .where('school_years.current', '=', true)
            .orderBy('groups.name')
        
        if (query.classId) {
            groupsQuery = groupsQuery.where('classes.class_id', '=', query.classId);
        }

        const groups = await groupsQuery.execute();
        return groups;
    }, {
        query: t.Object({
            classId: t.Optional(t.Number())
        })
    });

export default app;
