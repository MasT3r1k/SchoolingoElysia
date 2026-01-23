import { Elysia } from 'elysia';
import { db } from "../../../../../database";
import { rateLimit } from 'elysia-rate-limit';
import { app } from '../../../../../index';
import moment from 'moment';
import { format_person_by_id } from '../../../../functions/format_person_by_id';

const elysiaApp = new Elysia()
  
  .get('/schedule/all_subjects', async ({ cookie }) => {
    const token = cookie.token?.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    // === Najdeme uživatele podle tokenu
    const user = await db.selectFrom("tokens")
      .innerJoin('users', 'users.userId', 'tokens.userId')
      .innerJoin("passwords", "passwords.passwordId", "users.password")
      .select([
        'users.userId',
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
      .leftJoin('teachers_subject', 'teachers_subject.subject_id', 'subjects.subjectId')
      .leftJoin('teachers', 'teachers.personId', 'teachers_subject.teacher_id') // uprav název tabulky podle DB
      .leftJoin('persons', 'persons.personId', 'teachers.personId')
      .select([
        'subjects.subjectId',
        'subjects.label as subjectName',
        'subjects.shortcut as subjectShort',
        'teachers.personId as teacherId'
      ])
      .execute();

    // === Seskupíme učitele k jednotlivým předmětům
    const subjectsMap: Record<string, any> = {};
    const teachersMap: Record<string, any> = {};
    for (const row of rows) {
      if (!subjectsMap[row.subjectId]) {
        subjectsMap[row.subjectId] = {
          subjectId: row.subjectId,
          subjectName: row.subjectName,
          subjectShort: row.subjectShort,
          teachers: []
        };
      }
      if (row.teacherId) {
        teachersMap[row.teacherId] = {
          teacherId: row.teacherId,
          teacherName: await format_person_by_id(row.teacherId)
        }
        subjectsMap[row.subjectId].teachers.push({
          teacherId: row.teacherId,
          teacherName: await format_person_by_id(row.teacherId)
        });
      }
    }

    const subjects = Object.values(subjectsMap)
    const teachers = teachersMap

    return { subjects, teachers };
  });

export default elysiaApp;
