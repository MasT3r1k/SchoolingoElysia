import moment from "moment";
import { db } from "../../database";

export async function get_classbook_lesson_number(classbook_id: number): Promise<number> {
    // === Získání informací o třídní knize ===
    const classbook = await db.selectFrom('classbook')
    .select([
        'classbook.dayHour',
        'classbook.date',
        'classbook.subject_id',
        'classbook.groupId'
    ])
    .where('classbook.cbId', '=', classbook_id)
    .executeTakeFirst();
    if (!classbook) return -1;

    // === Získání začátku školního roku ===
    const school_year = await db.selectFrom('school_years')
    .select([
      'school_years.start'
    ])
    .where('start', '<=', classbook.date as Date)
    .where('end', '>=', classbook.date as Date)
    .executeTakeFirst()

    if (!school_year) return -1;

    // === Výpočet týdnů od začátku školního roku ===
    const start = moment(school_year.start);
    const end = moment(classbook.date);

    let evenCount = 0;
    let oddCount = 0;

    // Jdeme týden po týdnu od startu do end (včetně startu)
    const current = start.clone();

    while (current.isBefore(end, 'week')) {
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
    .where('timetable.group_id', '=', classbook.groupId)
    .where('timetable.subject_id', '=', classbook.subject)
    .execute();

    /// Sčítání čísla hodiny
    let lessonNumber = 0;
    /// Vynásobení za každý týden (type == 0)
    lessonNumber += timetable.filter((timetable_lesson) => timetable_lesson.type == 0).length * (oddCount + evenCount);

    /// Přičtení za lichý hodiny
    lessonNumber += timetable.filter((timetable_lesson) => timetable_lesson.type == 1).length * oddCount;

    /// Přičtení za sudý hodiny
    lessonNumber += timetable.filter((timetable_lesson) => timetable_lesson.type == 2).length * evenCount;

    // Přičtení hodin za týden z datumu třídní knihy
    const currentWeek = end.isoWeek() % 2 ? 'odd' : 'even';
    const timetableCurrentWeek = timetable.filter((timetable_lesson) => timetable_lesson.type == 0 || timetable_lesson.type == 1 && currentWeek == 'odd' || timetable_lesson.type == 2 && currentWeek == 'even');

    for(let item of timetableCurrentWeek) {
        const isoWeekday = end.isoWeekday() - 1; // To equal as database
        if (isoWeekday > item.day || isoWeekday == item.day && classbook.dayHour >= item.hour) {
            lessonNumber++;
        }
    }

    return lessonNumber;
}