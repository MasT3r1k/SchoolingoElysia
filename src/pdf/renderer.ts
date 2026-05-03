import Handlebars from 'handlebars'
import fs from 'fs/promises'
import path from 'path'
import pdf from 'html-pdf-node'
import { db } from '../../database'
import { sql } from 'kysely'
import { format_person_by_id } from '../functions/format_person_by_id'
import QRCode from 'qrcode'

export async function renderPdf(
  templateName: string,
  data: any
) {
    console.log('render pdf')

    Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context, null, 2);
    });

    Handlebars.registerHelper('add', function(a, b) {
        return a + b;
    });

    Handlebars.registerHelper('format_datum', function(datum_narozeni) {
        return datum_narozeni.replaceAll('.', '').replaceAll(' ', '')
    })

    Handlebars.registerHelper('getLessonClasses', function(lessons, lesson) {
      if (!lesson) return 'empty sub-lesson-hour';
      let classes = ['sub-lesson-hour'];
      if (lessons && lessons.length) classes.push('lesson-count-' + lessons.length);
      if (lesson.empty) classes.push('empty');
      if (lesson.oldSubject && lesson.oldTeacher) classes.push('substitution');
      return classes.join(' ');
    });

    Handlebars.registerHelper('eq', function (a, b) {
        return a === b;
    });

    Handlebars.registerHelper('lt', function (a, b) {
        return a < b;
    });

    Handlebars.registerHelper('gt', function (a, b) {
        return a > b;
    });

    Handlebars.registerHelper('lookupOrEmpty', function(obj, key) {
        return obj && obj[key] ? obj[key] : [];
    });

    Handlebars.registerHelper('abs', function(obj, key1, key2) {
      return obj && obj[key1] && obj[key1][key2] ? obj[key1][key2] : [];
    });

    Handlebars.registerHelper('hasOne', function(arr) {
        return arr && arr.length > 0;
    });

    Handlebars.registerHelper('concat', function(...args) {
        args.pop(); // Remove Handlebars options object
        return args.join('');
    });

    Handlebars.registerHelper('split', function(str, delimiter) {
        if (typeof str !== 'string') return [];
        return str.split(delimiter);
    });

    Handlebars.registerHelper('uppercase', function(str) {
        if (typeof str !== 'string') return str;
        return str.toUpperCase()
    })

  const templatePath = path.join(
    __dirname,
    'templates',
    `${templateName}.html`
  )

  const cssPath = path.join(__dirname, 'styles', 'print.css')

  const [html, css] = await Promise.all([
    fs.readFile(templatePath, 'utf8'),
    fs.readFile(cssPath, 'utf8')
  ])
    const compiled = Handlebars.compile(html)
    
    const school: any = await (db.selectFrom('schools') as any)
        .leftJoin('addresses', 'addresses.address_id', 'schools.address_id')
        .leftJoin('cities', 'cities.city_id', 'addresses.city_id')
        .select([
            'schools.name', 
            'schools.ico', 
            'schools.izo', 
            'schools.red_izo',
            'cities.city_name as city',
            'addresses.street',
            'addresses.house_number',
            'cities.postcode'
        ])
        .executeTakeFirst();

    const currentSchoolYearRecord = await db.selectFrom('school_years')
        .select(['start', 'end'])
        .where('current', '=', true)
        .executeTakeFirst();

    let schoolYearString = '';
    if (currentSchoolYearRecord && currentSchoolYearRecord.start && currentSchoolYearRecord.end) {
        schoolYearString = `${currentSchoolYearRecord.start.getFullYear()}/${currentSchoolYearRecord.end.getFullYear()}`;
    }

    // Generate QR Code for report card verification
    let studentQRCode = '';
    if (data.student) {
        const qrData = JSON.stringify({
            student: data.student.full_name,
            school: school?.name,
            year: schoolYearString,
            verifyUrl: `https://schoolingo.cz/verify/${data.student.id}`
        });
        studentQRCode = await QRCode.toDataURL(qrData);
    }

    let processedMarks = Array.isArray(data.marks) ? [...data.marks] : [];
    if (templateName === 'vysvedceni_ss' || templateName === 'vypis_vysvedceni_ss') {
        // SS template has exactly 18 rows
        while (processedMarks.length < 18) {
            processedMarks.push({ subject_name: '', sem1: '', sem2: '' });
        }
    } else if (templateName === 'vysvedceni_zs' || templateName === 'vypis_vysvedceni_zs') {
        // ZS template usually 15-16 rows, let's pad to 16
        while (processedMarks.length < 16) {
            processedMarks.push({ subject_name: '', sem1: '', sem2: '' });
        }
    }

    let processedData = {
        ...data,
        school: school || { name: 'Neznámá škola' },
        schoolYear: schoolYearString || '----/----',
        studentQRCode: studentQRCode,
        marks: processedMarks
    };
    let landscape = false;

    if (templateName === 'rozvrh' || templateName === 'potvrzeni_studia') {
        landscape = true;
    }

    if (templateName === 'rozvrh') {
        const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
        let numDays = data.timetableData.timetable.length <= 6 && !data.timetableData.timetable[0] ? 6 : (data.timetableData.timetable[0] || data.timetableData.timetable.length > 6 ? 7 : 6);

        const mappedDays = [];
        for (let dayIndex = 1; dayIndex < numDays; dayIndex++) {
            const name = days[dayIndex - 1];
            const rowCells = [];
            for (let hourIndex = 0; hourIndex < data.timetableData.timetableHours.length; hourIndex++) {
                const lessons = data.timetableData.timetable[dayIndex]?.[hourIndex] || [];
                rowCells.push({
                    lessons,
                });
            }
            mappedDays.push({
                name: days[dayIndex - 1],
                cells: rowCells
            });
        }

        let title = '';
        const targetType = data.timetableData?.targetType;
        const targetId = data.timetableData?.targetId;

        if (targetType === 'class' && targetId) {
            const classDb = await db.selectFrom('classes')
                .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                .select([
                    sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
                    'classes.teacher_id'
                ])
                .where('classes.class_id', '=', targetId)
                .executeTakeFirst();
                
            if (classDb) {
                let tridniString = 'Bez učitele';
                if (classDb.teacher_id) {
                    try {
                        tridniString = await format_person_by_id(classDb.teacher_id);
                    } catch(err) {}
                }
                title = `Třída: ${classDb.class_name} - Třídní učitel: ${tridniString}`;
            }
        } else if (targetType === 'person' && targetId) {
            const personDb = await db.selectFrom('users')
                .leftJoin('students', 'students.person_id', 'users.person_id')
                .leftJoin('teachers', 'teachers.person_id', 'users.person_id')
                .select(['students.person_id as student_id', 'teachers.person_id as teacher_id'])
                .where('users.person_id', '=', targetId)
                .executeTakeFirst();
                
            if (personDb?.student_id) {
                const userGroup = await db.selectFrom('student_groups')
                    .innerJoin('groups', 'student_groups.group_id', 'groups.group_id')
                    .innerJoin('classes', 'classes.class_id', 'groups.class_id')
                    .innerJoin('school_years', 'school_years.sy_id', 'classes.year_id')
                    .select([
                        sql<string>`concat(classes.prefix, TIMESTAMPDIFF(YEAR, school_years.start, CURDATE()) + 1, classes.suffix)`.as('class_name'),
                        'classes.teacher_id'
                    ])
                    .where('student_groups.student_id', '=', targetId)
                    .where('school_years.start', '<=', new Date())
                    .where('school_years.end', '>=', new Date())
                    .limit(1)
                    .executeTakeFirst();
                    
                if (userGroup) {
                    let tridniString = 'Bez učitele';
                    if (userGroup.teacher_id) {
                        try {
                            tridniString = await format_person_by_id(userGroup.teacher_id);
                        } catch(err){}
                    }
                    title = `Třída: ${userGroup.class_name} - Třídní učitel: ${tridniString}`;
                }
            }
        } else if (targetType === 'room' && targetId) {
            const roomDb = await db.selectFrom('building_rooms')
                .innerJoin('building_floors', 'building_floors.bf_id', 'building_rooms.floor_id')
                .innerJoin('buildings', 'buildings.building_id', 'building_floors.building_id')
                .select(['building_rooms.name as room_name', 'buildings.name as building_name'])
                .where('building_rooms.room_id', '=', targetId)
                .executeTakeFirst();
                
            if (roomDb) {
                title = `Budova: ${roomDb.building_name} - Místnost: ${roomDb.room_name}`;
            }
        }

        processedData = {
            hours: data.timetableData.timetableHours.map((h: any, i: number) => ({ id: i + 1, time: h.start + ' - ' + h.end })),
            days: mappedDays,
            selectedTab: data.timetableData.selectedTab,
            title: title
        };
    }

    const content = compiled(processedData)
    const file = { content }
    const format = templateName === 'potvrzeni_studia' ? 'A5' : 'A4';

    const pdfBuffer = await pdf.generatePdf(file, { 
      format: format, 
      landscape: landscape, 
      printBackground: true 
    })

  return pdfBuffer
}