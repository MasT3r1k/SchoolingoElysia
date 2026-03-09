import { db } from './database';

async function debug() {
  console.log('--- Debugging Absences ---');
  
  // Find a student with some absences
  const studentsWithAbsence = await db.selectFrom('absence')
    .select(['student_id'])
    .groupBy('student_id')
    .limit(5)
    .execute();
  
  console.log('Students with any absence record:', studentsWithAbsence);

  if (studentsWithAbsence.length > 0) {
    const sid = studentsWithAbsence[0].student_id;
    console.log(`Checking data for student_id: ${sid}`);

    const absences = await db.selectFrom('absence')
      .innerJoin('classbook', 'classbook.classbook_id', 'absence.lesson_id')
      .select([
        'classbook.date',
        'classbook.subject_id',
        'absence.type',
        'absence.minutes'
      ])
      .where('absence.student_id', '=', sid)
      .execute();
    
    console.log(`Total absences found: ${absences.length}`);
    if (absences.length > 0) {
      console.log('First 3 absences:', absences.slice(0, 3));
      
      const distinctYears = new Set(absences.map(a => new Date(a.date).getFullYear()));
      console.log('Distinct years in absences:', Array.from(distinctYears));
      
      const distinctTypes = new Set(absences.map(a => a.type));
      console.log('Distinct types in absences:', Array.from(distinctTypes));
    }

    const studentInfo = await db.selectFrom('students')
      .leftJoin('classes', 'classes.class_id', 'students.class_id')
      .leftJoin('school_years', 'school_years.sy_id', 'classes.year_id')
      .select(['students.person_id', 'school_years.start as class_start'])
      .where('students.person_id', '=', sid)
      .executeTakeFirst();
    
    console.log('Student Class Info:', studentInfo);
  }

  process.exit(0);
}

debug().catch(err => {
  console.error(err);
  process.exit(1);
});
