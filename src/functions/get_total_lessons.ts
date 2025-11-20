import { db } from "../../database";

export async function get_total_lessons(start: moment.Moment, end: moment.Moment, group_id: number, subject_id: number): Promise<number> {
    let evenCount = 0;
    let oddCount = 0;

    // Jdeme týden po týdnu od startu do end (včetně startu)
    const current = start.clone();

    while (current.isSameOrBefore(end, 'week')) {
        const weekNumber = current.isoWeek();

        if (weekNumber % 2 === 0) {
            evenCount++;
        } else {
            oddCount++;
        }

        current.add(1, 'week');
    }

    // === Teď zjístíme rozvrh a sečteme ===
    /// Získání rozvrhu
    const timetable = await db.selectFrom('timetable')
    .select([
        'timetable.day',
        'timetable.hour',
        'timetable.type'
    ])
    .where('timetable.groupId', '=', group_id)
    .where('timetable.subject', '=', subject_id)
    .execute();

    /// Sčítání čísla hodiny
    let lessonNumber = 0;
    /// Vynásobení za každý týden (type == 0)
    lessonNumber += timetable.filter((timetable_lesson) => timetable_lesson.type == 0).length * (oddCount + evenCount);

    /// Přičtení za lichý hodiny
    lessonNumber += timetable.filter((timetable_lesson) => timetable_lesson.type == 1).length * oddCount;

    /// Přičtení za sudý hodiny
    lessonNumber += timetable.filter((timetable_lesson) => timetable_lesson.type == 2).length * evenCount;

    return lessonNumber;
}