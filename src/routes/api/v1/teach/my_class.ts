import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia({ prefix: '/teach/my-class' })
    .get('/', async ({ user, query, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        // Find all classes where the user is the main teacher
        const classes = await db.selectFrom('classes')
            .selectAll()
            .where('teacher', '=', user.person)
            .execute();

        if (classes.length === 0) {
            return {
                classes: [],
                currentClass: null,
                students: [],
                absences: [],
                services: [],
                serviceHistory: []
            };
        }

        // Determine which class to show (either from query param or the first one)
        let selectedClass = classes[0];
        if (query.classId) {
            const found = classes.find(c => c.classId === parseInt(query.classId));
            if (found) selectedClass = found;
        }

        // Fetch students in this class
        const students = await db.selectFrom('students')
            .innerJoin('persons', 'persons.personId', 'students.personId')
            .selectAll('persons')
            .select(['students.personId', 'students.status', 'students.class'])
            .where('students.class', '=', selectedClass.classId)
            // @ts-ignore
            .where('students.status', '=', 'active')
            .select((eb: any) => [
                sql<string>`(
                    SELECT ROUND(SUM(g.mark * gc.weight) / NULLIF(SUM(gc.weight), 0), 2)
                    FROM grades g
                    LEFT JOIN grades_columns gc ON gc.gcId = g.columnId
                    WHERE g.studentId = students.personId
                    AND gc.status = 'active'
                    AND g.mark IS NOT NULL
                )`.as('averageGrade'),
                sql<string>`(
                    SELECT ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT c.cbId) = 0 THEN 0
                        ELSE (COUNT(a.student) * 100.0) / COUNT(DISTINCT c.cbId)
                    END, 
                    2)
                    FROM student_groups sg
                    LEFT JOIN classbook c ON c.groupId = sg.groupId
                    LEFT JOIN absence a ON a.lesson = c.cbId AND a.student = students.personId
                    WHERE sg.student = students.personId
                )`.as('absenceRate')
            ])
            .orderBy('persons.lastName')
            .orderBy('persons.firstName')
            .execute();

        const studentIds = students.map(s => s.personId);

        if (studentIds.length === 0) {
             return {
                classes,
                currentClass: selectedClass,
                students: [],
                absences: [],
                services: [],
                serviceHistory: []
            };
        }

        // Fetch unexcused absences
        const absences = await db.selectFrom('absence')
            .innerJoin('persons', 'persons.personId', 'absence.student')
            .selectAll('absence')
            .select(['persons.firstName', 'persons.lastName'])
            .where('absence.student', 'in', studentIds)
            .innerJoin('classbook', 'classbook.cbId', 'absence.lesson')
            .select(['classbook.date', 'classbook.dayHour', 'classbook.subject'])
            // @ts-ignore
            .where('absence.type', '=', 'missing')
            // @ts-ignore
            .where('absence.type', '!=', 'present')
            .execute();

        // Fetch CURRENT class services (active now)
        const currentServices = await db.selectFrom('class_service')
            .innerJoin('persons', 'persons.personId', 'class_service.student')
            .selectAll('class_service')
            .select(['persons.firstName', 'persons.lastName'])
            .where('class_service.student', 'in', studentIds)
            // @ts-ignore
            .where('class_service.start', '<=', new Date())
            // @ts-ignore
            .where('class_service.end', '>=', new Date())
            .execute();

        // Fetch PLANNED class services (future)
        const plannedServices = await db.selectFrom('class_service')
            .innerJoin('persons', 'persons.personId', 'class_service.student')
            .selectAll('class_service')
            .select(['persons.firstName', 'persons.lastName'])
            .where('class_service.student', 'in', studentIds)
            // @ts-ignore
            .where('class_service.start', '>', new Date())
            .orderBy('class_service.start', 'asc')
            .execute();

        // Fetch PAST class services (History)
        const serviceHistory = await db.selectFrom('class_service')
            .innerJoin('persons', 'persons.personId', 'class_service.student')
            .selectAll('class_service')
            .select(['persons.firstName', 'persons.lastName'])
            .where('class_service.student', 'in', studentIds)
            // @ts-ignore
            .where('class_service.end', '<', new Date())
            .orderBy('class_service.end', 'desc')
            .limit(20)
            .execute();

        // --- NEW: Calculate Overview & Stats ---
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Check if teaching takes place today (any lesson for any student in this class)
        // We check if there are any classbook entries for the students' groups today
        const teachingTodayResult = await db.selectFrom('classbook')
            .innerJoin('student_groups', 'classbook.groupId', 'student_groups.groupId')
            // @ts-ignore
            .where('student_groups.student', 'in', studentIds)
            // @ts-ignore
            .where('classbook.date', '=', todayStr) 
            .select(sql<number>`count(distinct classbook.cbId)`.as('count'))
            .executeTakeFirst();
        
        const hasTeachingToday = Number(teachingTodayResult?.count || 0) > 0;

        // 2. Today's Statistics
        let todayStats = {
            active: hasTeachingToday,
            present: studentIds.length,
            absent: 0,
            excusedPercent: 0
        };

        if (hasTeachingToday) {
            // Get all absence records for today
            const todayAbsences = await db.selectFrom('absence')
                 .innerJoin('classbook', 'classbook.cbId', 'absence.lesson')
                 .where('absence.student', 'in', studentIds)
                 // @ts-ignore
                 .where('classbook.date', '=', todayStr)
                 // @ts-ignore
                 .where('absence.type', '!=', 'present')
                 .select(['absence.student', 'absence.type'])
                 .execute();

             const uniqueAbsent = new Set(todayAbsences.map(a => a.student)).size;
             const totalRecords = todayAbsences.length;
             const excusedRecords = todayAbsences.filter(a => (a.type as any) === 'excused').length;
             
             todayStats.present = Math.max(0, studentIds.length - uniqueAbsent);
             todayStats.absent = uniqueAbsent;
             todayStats.excusedPercent = totalRecords > 0 ? Math.round((excusedRecords / totalRecords) * 100) : 0;
        }

        // 3. General Absence Statistics for the Class
        const allAbsenceStats = await db.selectFrom('absence')
            .innerJoin('classbook', 'classbook.cbId', 'absence.lesson') // Ensure we only count valid lessons if needed, but simple filtering by student is enough usually
             .where('absence.student', 'in', studentIds)
             // @ts-ignore
             .where('absence.type', '!=', 'present')
             .select((eb) => [
                 // @ts-ignore
                 sql<number>`COUNT(CASE WHEN absence.type = 'excused' THEN 1 END)`.as('excused'),
                 // @ts-ignore
                 sql<number>`COUNT(CASE WHEN absence.type = 'missing' OR absence.type = 'unexcused' THEN 1 END)`.as('unexcused'),
                 sql<number>`COUNT(*)`.as('total')
             ])
             .executeTakeFirst();
        
        const absenceStats = {
             totalExcused: Number(allAbsenceStats?.excused || 0),
             totalUnexcused: Number(allAbsenceStats?.unexcused || 0),
             total: Number(allAbsenceStats?.total || 0),
             classAverage: students.length > 0 ? 
                Math.round(students.reduce((acc, s) => acc + (parseFloat(s.absenceRate) || 0), 0) / students.length) : 0
        };

        return {
            classes,
            currentClass: selectedClass,
            students,
            absences,
            currentServices,
            plannedServices,
            serviceHistory,
            todayStats,
            absenceStats
        };

    })
    .post('/service', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }
        
        const { studentId, start, end } = body as { studentId: number, start: string, end: string };

        await db.insertInto('class_service')
            .values({
                student: studentId,
                start: new Date(start),
                end: new Date(end)
            })
            .execute();

        return { success: true };
    })
    .post('/service/auto', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const { classId, start, end, count, method, offset } = body as { 
            classId: number, 
            start: string, 
            end: string, 
            count: number,
            method: 'random' | 'alphabetical',
            offset?: number
        };

        // Get students in the class
        const students = await db.selectFrom('students')
            .innerJoin('persons', 'persons.personId', 'students.personId')
            .select(['persons.personId', 'persons.firstName', 'persons.lastName']) // Need names for alphabetical sort
            .where('class', '=', classId)
            // @ts-ignore
            .where('status', '=', 'active')
            .execute();

        const neededCount = count || 2;

        if (students.length < neededCount) {
            set.status = 400;
            return { error: 'Not enough students to assign service.' };
        }

        let selected: typeof students = [];

        if (method === 'alphabetical') {
             const offsetNum = offset || 0;
             // Sort alphabetically
            selected = students.sort((a, b) => {
                const ln = a.lastName.localeCompare(b.lastName);
                if (ln !== 0) return ln;
                return a.firstName.localeCompare(b.firstName);
            }).slice(offsetNum, offsetNum + neededCount);
        } else {
             // Random
            const shuffled = students.sort(() => 0.5 - Math.random());
            selected = shuffled.slice(0, neededCount);
        }

        for (const s of selected) {
             await db.insertInto('class_service')
            .values({
                student: s.personId,
                start: new Date(start),
                end: new Date(end)
            })
            .execute();
        }

        return { success: true, count: selected.length };
    })
    .delete('/service/:id', async ({ user, params, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        await db.deleteFrom('class_service')
            .where('csId', '=', parseInt(params.id))
            .execute();

        return { success: true };
    })
    .post('/absence/excuse', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const { studentId, lessonId, reason } = body as { studentId: number, lessonId: number, reason: string };

        await db.updateTable('absence')
            .set({
                // @ts-ignore
                type: 'excused',
                reason: reason
            })
            .where('student', '=', studentId)
            // @ts-ignore
            .where('lesson', '=', lessonId)
            .execute();

        return { success: true };
    });

export default app;
