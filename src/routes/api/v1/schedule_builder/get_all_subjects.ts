import { Elysia } from 'elysia';
import { db } from "../../../../../database";
import moment from 'moment';
import { format_person_map_by_ids } from '../../../../functions/format_person_by_ids';

const elysiaApp = new Elysia()
  
  .get('/schedule/all_subjects', async ({ cookie }: any) => {
    const token = cookie.token?.value as string;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    // === Najdeme uživatele podle tokenu
    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.user_id', 'tokens.user_id')
      .innerJoin("passwords", "passwords.password_id", 'users.password_id')
      .select([
        'users.user_id',
        'users.username',
        'users.2fa',
        'users.2fa_secret',
        'passwords.password'
      ])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!user) {
      return Response.json({ error: 'no_user', details: 'no_db' });
    }

    // === Načteme předměty s učiteli
    const rows = await db
      .selectFrom('subjects')
      .leftJoin('teachers_subject', 'teachers_subject.subject_id', 'subjects.subject_id')
      .leftJoin('teachers', 'teachers.person_id', 'teachers_subject.teacher_id')
      .leftJoin('persons', 'persons.person_id', 'teachers.person_id')
      .select([
        'subjects.subject_id',
        'subjects.label as subject_name',
        'subjects.shortcut as subject_short',
        'teachers.person_id as teacher_id'
      ])
      .execute();

    // Collect all unique teacher IDs
    const teacherIds = Array.from(new Set(rows.map(r => r.teacher_id).filter((id): id is number => id !== null)));
    
    // Fetch all teacher names at once
    const teacherNameMap = teacherIds.length > 0 ? await format_person_map_by_ids(teacherIds) : new Map<number, string>();

    // === Seskupíme učitele k jednotlivým předmětům
    const subjectsMap: Record<number, any> = {};
    const teachersList: Record<number, any> = {};

    for (const row of rows) {
      if (!subjectsMap[row.subject_id]) {
        subjectsMap[row.subject_id] = {
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          subject_short: row.subject_short,
          teachers: []
        };
      }
      if (row.teacher_id) {
        const teacherName = teacherNameMap.get(row.teacher_id) || '';
        if (!teachersList[row.teacher_id]) {
            teachersList[row.teacher_id] = {
                teacher_id: row.teacher_id,
                teacher_name: teacherName
            };
        }
        
        // Avoid duplicates in subjects.teachers
        if (!subjectsMap[row.subject_id].teachers.some((t: any) => t.teacher_id === row.teacher_id)) {
            subjectsMap[row.subject_id].teachers.push({
                teacher_id: row.teacher_id,
                teacher_name: teacherName
            });
        }
      }
    }

    const subjects = Object.values(subjectsMap)

    return { subjects, teachers: teachersList };
  });

export default elysiaApp;
