import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';
import moment from 'moment';
export enum AbsenceType {
    ABSENCE,
    EXCUSED,
    UNEXCUSED,
    NON_COUNT,
    LATE,
    EARLY,
    DISTANCE
}


const app = new Elysia()
    .get('/teach/my-class', async ({ user, query, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        // Find all classes where the user is the main teacher
        const classes = await db.selectFrom('classes')
            .selectAll()
            .where('teacher_id', '=', user.person_id)
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
            const found = classes.find(c => c.class_id === parseInt(query.classId));
            if (found) selectedClass = found;
        }

        // Fetch students in this class
        const studentsResult = await db.selectFrom('students')
            .innerJoin('persons', 'persons.person_id', 'students.person_id')
            .selectAll('persons')
            .select(['students.person_id', 'students.status', 'students.class_id'])
            .where('students.class_id', '=', selectedClass.class_id)
            .where('students.status', '=', 'active')
            .select((eb: any) => [
                sql<string>`(
                    SELECT ROUND(SUM(g.mark * gc.weight) / NULLIF(SUM(gc.weight), 0), 2)
                    FROM grades g
                    LEFT JOIN grades_columns gc ON gc.column_id = g.column_id
                    WHERE g.student_id = students.person_id
                    AND gc.status = 'active'
                    AND g.mark IS NOT NULL
                )`.as('average_grade'),
                sql<string>`(
                    SELECT ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT c.classbook_id) = 0 THEN 0
                        ELSE (COUNT(a.student_id) * 100.0) / COUNT(DISTINCT c.classbook_id)
                    END, 
                    2)
                    FROM student_groups sg
                    LEFT JOIN classbook c ON c.group_id = sg.group_id
                    LEFT JOIN absence a ON a.lesson_id = c.classbook_id AND a.student_id = students.person_id
                    WHERE sg.student_id = students.person_id
                )`.as('absence_rate')
            ])
            .orderBy('persons.last_name')
            .orderBy('persons.first_name')
            .execute();

        const studentIds = studentsResult.map(s => s.person_id);

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

        const studentNames = await format_person_map_by_ids(studentIds);

        const students = studentsResult.map(s => ({
            ...s,
            full_name: studentNames.get(s.person_id)
        }));

        // Fetch all absences
        let absencesQuery = db.selectFrom('absence')
            .innerJoin('persons', 'persons.person_id', 'absence.student_id')
            .selectAll('absence')
            .select(['persons.first_name', 'persons.last_name'])
            .where('absence.student_id', 'in', studentIds)
            .innerJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
            .select(['classbook.date', 'classbook.day_hour', 'classbook.subject_id']);
        
        if (query.absenceStart) {
            absencesQuery = absencesQuery.where('classbook.date', '>=', query.absenceStart);
        }
        if (query.absenceEnd) {
            absencesQuery = absencesQuery.where('classbook.date', '<=', query.absenceEnd);
        }

        const absencesResult = await absencesQuery.orderBy('classbook.date', 'desc').execute();
        
        const absences = absencesResult.map(a => ({
            ...a,
            full_name: studentNames.get(a.student_id)
        }));

        // Fetch CURRENT class services (active now)
        const currentServicesResult = await db.selectFrom('class_service')
            .innerJoin('persons', 'persons.person_id', 'class_service.student_id')
            .selectAll('class_service')
            .select(['persons.first_name', 'persons.last_name'])
            .where('class_service.student_id', 'in', studentIds)
            .where('class_service.start', '<=', new Date())
            .where('class_service.end', '>=', new Date())
            .execute();
        
        const currentServices = currentServicesResult.map(s => ({
            ...s,
            full_name: studentNames.get(s.student_id)
        }));

        // Fetch PLANNED class services (future)
        const plannedServicesResult = await db.selectFrom('class_service')
            .innerJoin('persons', 'persons.person_id', 'class_service.student_id')
            .selectAll('class_service')
            .select(['persons.first_name', 'persons.last_name'])
            .where('class_service.student_id', 'in', studentIds)
            .where('class_service.start', '>', new Date())
            .orderBy('class_service.start', 'asc')
            .execute();
        
        const plannedServices = plannedServicesResult.map(s => ({
            ...s,
            full_name: studentNames.get(s.student_id)
        }));

        // Fetch PAST class services (History)
        const serviceHistoryResult = await db.selectFrom('class_service')
            .innerJoin('persons', 'persons.person_id', 'class_service.student_id')
            .selectAll('class_service')
            .select(['persons.first_name', 'persons.last_name'])
            .where('class_service.student_id', 'in', studentIds)
            .where('class_service.end', '<', new Date())
            .orderBy('class_service.end', 'desc')
            .limit(20)
            .execute();
        
        const serviceHistory = serviceHistoryResult.map(s => ({
            ...s,
            full_name: studentNames.get(s.student_id)
        }));

        // --- NEW: Calculate Overview & Stats ---
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Check if teaching takes place today (any lesson for any student in this class)
        const teachingTodayResult = await db.selectFrom('classbook')
            .innerJoin('student_groups', 'classbook.group_id', 'student_groups.group_id')
            .where('student_groups.student_id', 'in', studentIds)
            .where('classbook.date', '=', todayStr) 
            .select(sql<number>`count(distinct classbook.classbook_id)`.as('count'))
            .executeTakeFirst();
        
        const hasTeachingToday = Number(teachingTodayResult?.count || 0) > 0;

        // 2. Today's Statistics
        let todayStats = {
            active: hasTeachingToday,
            present: studentIds.length,
            absent: 0,
            excused_percent: 0
        };

        if (hasTeachingToday) {
            // Get all absence records for today
            const todayAbsences = await db.selectFrom('absence')
                 .innerJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
                 .where('absence.student_id', 'in', studentIds)
                 .where('classbook.date', '=', todayStr)
                 .where('absence.type', '>', 0) // Meaning they have some absence record
                 .select(['absence.student_id', 'absence.type'])
                 .execute();

             const uniqueAbsent = new Set(todayAbsences.map(a => a.student_id)).size;
             const totalRecords = todayAbsences.length;
             const excusedRecords = todayAbsences.filter(a => a.type === (AbsenceType.EXCUSED as any)).length;
             
             todayStats.present = Math.max(0, studentIds.length - uniqueAbsent);
             todayStats.absent = uniqueAbsent;
             todayStats.excused_percent = totalRecords > 0 ? Math.round((excusedRecords / totalRecords) * 100) : 0;
        }

        // 3. General Absence Statistics for the Class
        const allAbsenceStats = await db.selectFrom('absence')
            .innerJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
             .where('absence.student_id', 'in', studentIds)
             .where('absence.type', '!=', AbsenceType.NON_COUNT as any)
             .select((eb) => [
                 sql<number>`COUNT(CASE WHEN absence.type = ${AbsenceType.EXCUSED} THEN 1 END)`.as('excused'),
                 sql<number>`COUNT(CASE WHEN absence.type = ${AbsenceType.ABSENCE} OR absence.type = ${AbsenceType.UNEXCUSED} THEN 1 END)`.as('unexcused'),
                 sql<number>`COUNT(*)`.as('total')
             ])
             .executeTakeFirst();
        
        const absenceStats = {
             total_excused: Number(allAbsenceStats?.excused || 0),
             total_unexcused: Number(allAbsenceStats?.unexcused || 0),
             total: Number(allAbsenceStats?.total || 0),
             class_average: students.length > 0 ? 
                Math.round(studentsResult.reduce((acc, s) => acc + (parseFloat(s.absence_rate) || 0), 0) / students.length) : 0
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
    .post('/teach/my-class/service', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }
        
        const { studentId, start, end } = body as { studentId: number, start: string, end: string };

        await db.insertInto('class_service')
            .values({
                student_id: studentId,
                start: new Date(start),
                end: new Date(end)
            })
            .execute();

        return { success: true };
    })
    .post('/teach/my-class/service/auto', async ({ user, body, set }: any) => {
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
        const studentsInClass = await db.selectFrom('students')
            .innerJoin('persons', 'persons.person_id', 'students.person_id')
            .select(['persons.person_id', 'persons.first_name', 'persons.last_name'])
            .where('class_id', '=', classId)
            .where('status', '=', 'active')
            .execute();

        const neededCount = count || 2;

        if (studentsInClass.length < neededCount) {
            set.status = 400;
            return { error: 'Not enough students to assign service.' };
        }

        let selected: typeof studentsInClass = [];

        if (method === 'alphabetical') {
             const offsetNum = offset || 0;
             // Sort alphabetically
            selected = studentsInClass.sort((a, b) => {
                const ln = a.last_name.localeCompare(b.last_name);
                if (ln !== 0) return ln;
                return a.first_name.localeCompare(b.first_name);
            }).slice(offsetNum, offsetNum + neededCount);
        } else {
             // Random
            const shuffled = studentsInClass.sort(() => 0.5 - Math.random());
            selected = shuffled.slice(0, neededCount);
        }

        for (const s of selected) {
             await db.insertInto('class_service')
            .values({
                student_id: s.person_id,
                start: new Date(start),
                end: new Date(end)
            })
            .execute();
        }

        return { success: true, count: selected.length };
    })
    .delete('/teach/my-class/service/:id', async ({ user, params, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        await db.deleteFrom('class_service')
            .where('cs_id', '=', parseInt(params.id))
            .execute();

        return { success: true };
    })
    .post('/teach/my-class/absence/excuse', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const { studentId, lessonId, reason } = body as { studentId: number, lessonId: number, reason: string };

        await db.updateTable('absence')
            .set({
                type: AbsenceType.EXCUSED as any,
                reason: reason
            })
            .where('student_id', '=', studentId)
            .where('lesson_id', '=', lessonId)
            .execute();

        return { success: true };
    })
    .post('/teach/my-class/absence/bulk', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const { studentId, date, type, reason, note } = body as {
            studentId: number,
            date: string,
            type: AbsenceType,
            reason?: string,
            note?: string
        };

        if (type === undefined) {
             set.status = 400;
             return { error: 'Type is required' };
        }

        // To ensure we can add absence even to lessons that haven't been 'opened' in classbook yet,
        // we check the timetable and create missing classbook entries for the day.
        const dayOfWeek = moment(date).isoWeekday() - 1;
        const weekType = moment(date).isoWeek() % 2 === 0 ? 2 : 1;
        
        const schoolYear = await db.selectFrom('school_years')
            .where('start', '<=', new Date(date))
            .where('end', '>=', new Date(date))
            .select('sy_id')
            .executeTakeFirst();

        const timetableEntries = schoolYear ? await db.selectFrom('timetable')
            .innerJoin('student_groups', 'student_groups.group_id', 'timetable.group_id')
            .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
            .where('groups.year_id', '=', schoolYear.sy_id)
            .where('student_groups.student_id', '=', studentId)
            .where('timetable.day', '=', dayOfWeek)
            .where((eb) => eb.or([
                eb('timetable.type', '=', 0),
                eb('timetable.type', '=', weekType)
            ]))
            .select(['timetable.group_id', 'timetable.subject_id', 'timetable.hour'])
            .execute() : [];

        const validLessonIds: number[] = [];

        for (const tt of timetableEntries) {
            const isExistClassbook = await db.selectFrom('classbook')
                .where('classbook.date', '=', date)
                .where('classbook.day_hour', '=', tt.hour - 1)
                .where('classbook.group_id', '=', tt.group_id)
                .select('classbook.classbook_id')
                .executeTakeFirst();
            
            if (!isExistClassbook) {
                const inserted = await db.insertInto('classbook')
                .values({
                    date: date,
                    day_hour: tt.hour - 1,
                    group_id: tt.group_id,
                    subject_id: tt.subject_id
                })
                .executeTakeFirst();
                
                if (inserted.insertId) validLessonIds.push(Number(inserted.insertId));
            } else {
                validLessonIds.push(isExistClassbook.classbook_id);
            }
        }

        const lessons = validLessonIds.map(id => ({ classbook_id: id }));

        for (const lesson of lessons) {
            const exists = await db.selectFrom('absence')
                .select('lesson_id')
                .where('student_id', '=', studentId)
                .where('lesson_id', '=', lesson.classbook_id)
                .executeTakeFirst();
            
            if (exists) {
                await db.updateTable('absence')
                    .set({
                        type: type as any,
                        reason: reason || null,
                        note: note || null
                    })
                    .where('student_id', '=', studentId)
                    .where('lesson_id', '=', lesson.classbook_id)
                    .execute();
            } else {
                await db.insertInto('absence')
                    .values({
                        student_id: studentId,
                        lesson_id: lesson.classbook_id,
                        type: type as any,
                        reason: reason || null,
                        note: note || null,
                        minutes: null
                    })
                    .execute();
            }
        }

        return { success: true, count: lessons.length };
    })
    .delete('/teach/my-class/absence/bulk', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const { studentId, date } = body as { studentId: number, date: string };

        const lessons = await db.selectFrom('classbook')
            .where('date', '=', date)
            .select('classbook_id')
            .execute();

        if (lessons.length > 0) {
            await db.deleteFrom('absence')
                .where('student_id', '=', studentId)
                .where('lesson_id', 'in', lessons.map(l => l.classbook_id))
                .execute();
        }

        return { success: true };
    })
    .put('/teach/my-class/absence', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const { studentId, lessonId, date, hour, type, reason, note, minutes } = body as { 
            studentId: number, 
            lessonId?: number, 
            date?: string,
            hour?: number,
            type: AbsenceType, 
            reason?: string, 
            note?: string,
            minutes?: number
        };

        if (type === undefined) {
             set.status = 400;
             return { error: 'Type is required' };
        }

        let targetLessonId = lessonId;
        if (!targetLessonId && date && hour !== undefined) {
             let lesson = await db.selectFrom('classbook')
                 .innerJoin('student_groups', 'student_groups.group_id', 'classbook.group_id')
                 .where('student_groups.student_id', '=', studentId)
                 .where('classbook.date', '=', date)
                 .where('classbook.day_hour', '=', hour)
                 .select('classbook.classbook_id')
                 .executeTakeFirst();
                 
             if (!lesson) {
                 // Try to create from timetable
                 const dayOfWeek = moment(date).isoWeekday() - 1;
                 const weekType = moment(date).isoWeek() % 2 === 0 ? 2 : 1;
                 const schoolYear = await db.selectFrom('school_years')
                     .where('start', '<=', new Date(date))
                     .where('end', '>=', new Date(date))
                     .select('sy_id')
                     .executeTakeFirst();

                 if (schoolYear) {
                     const tt = await db.selectFrom('timetable')
                         .innerJoin('student_groups', 'student_groups.group_id', 'timetable.group_id')
                         .innerJoin('groups', 'groups.group_id', 'timetable.group_id')
                         .where('groups.year_id', '=', schoolYear.sy_id)
                         .where('student_groups.student_id', '=', studentId)
                         .where('timetable.day', '=', dayOfWeek)
                         .where('timetable.hour', '=', hour + 1)
                         .where((eb) => eb.or([eb('timetable.type', '=', 0), eb('timetable.type', '=', weekType)]))
                         .select(['timetable.group_id', 'timetable.subject_id'])
                         .executeTakeFirst();
                         
                     if (tt) {
                         const res = await db.insertInto('classbook')
                         .values({
                             date: date,
                             day_hour: hour,
                             group_id: tt.group_id,
                             subject_id: tt.subject_id
                         })
                         .executeTakeFirst();
                         
                         if (res.insertId) targetLessonId = Number(res.insertId);
                     }
                 }
             } else {
                 targetLessonId = lesson.classbook_id;
             }
        }

        if (!targetLessonId) {
             set.status = 404;
             return { error: 'Nepodařilo se najít hodinu pro tento čas. Zřejmě není naplánována výuka.' };
        }

        const exists = await db.selectFrom('absence')
            .select('lesson_id')
            .where('student_id', '=', studentId)
            .where('lesson_id', '=', targetLessonId)
            .executeTakeFirst();

        if (exists) {
            await db.updateTable('absence')
                .set({
                    type: type as any,
                    reason: reason || null,
                    note: note || null,
                    minutes: minutes || null
                })
                .where('student_id', '=', studentId)
                .where('lesson_id', '=', targetLessonId)
                .execute();
        } else {
            await db.insertInto('absence')
                .values({
                    student_id: studentId,
                    lesson_id: targetLessonId as number,
                    type: type as any,
                    reason: reason || null,
                    note: note || null,
                    minutes: minutes || null
                })
                .execute();
        }

        return { success: true };
    })
    .delete('/teach/my-class/absence', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const { studentId, lessonId, date, hour } = body as { studentId: number, lessonId?: number, date?: string, hour?: number };

        let targetLessonId = lessonId;
        if (!targetLessonId && date && hour !== undefined) {
             const lesson = await db.selectFrom('classbook')
                 .innerJoin('student_groups', 'student_groups.group_id', 'classbook.group_id')
                 .where('student_groups.student_id', '=', studentId)
                 .where('classbook.date', '=', date)
                 .where('classbook.day_hour', '=', hour)
                 .select('classbook.classbook_id')
                 .executeTakeFirst();
             if (lesson) targetLessonId = lesson.classbook_id;
        }

        if (!targetLessonId) {
             return { success: true }; // Nothing to delete
        }

        await db.deleteFrom('absence')
            .where('student_id', '=', studentId)
            .where('lesson_id', '=', targetLessonId)
            .execute();

        return { success: true };
    });

export default app;
