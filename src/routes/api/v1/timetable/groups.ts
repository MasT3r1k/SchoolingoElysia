import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
    .get('/timetable/groups', async ({query, school}: any) => {
        let groupsQuery = db.selectFrom('groups')
            .leftJoin('classes', 'groups.class', 'classes.classId')
            .innerJoin('users', 'users.person', 'classes.teacher')
            .leftJoin('school_years as syClass', 'syClass.syId', 'classes.yearId')
            .leftJoin('school_years', 'school_years.syId', 'groups.year')
            .where('users.school', '=', (school as any).schoolId)
            .select([
                'groupId',
                'name',
                'num',
                sql`concat(classes.prefix, TIMESTAMPDIFF(YEAR, syClass.start, CURDATE()) + 1, classes.suffix)`.as('className')
            ])
            .where('school_years.current', '=', true)
            .orderBy('name')
        
        if (query.classId) {
            groupsQuery = groupsQuery.where('classId', '=', query.classId);
        }

        const groups = await groupsQuery.execute();
        return groups;
    }, {
        query: t.Object({
            classId: t.Optional(t.Number())
        })
    });

export default app;
