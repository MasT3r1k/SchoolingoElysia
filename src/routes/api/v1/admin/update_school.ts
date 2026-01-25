import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

const app = new Elysia()
  .post('/system/update_school', async ({ cookie, body }) => {
    const token = cookie.token?.value as string;
    if (!token) return { error: 'no_user', details: 'no_cookie' };

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'users.userId', 'tokens.userId')
      .select(['tokens.tokenId', 'tokens.userId', 'users.person', 'users.manager', 'users.principal'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', new Date())
      .executeTakeFirst();

    if (!auth?.person) return { error: 'no_user', details: 'no_db' };

    // === Check permissions ===
    if (auth.manager != -1 && auth.principal == false) return { error: 'no_permission' };

    // === Check school ===
    const school = await db.selectFrom('schools')
    .select([
        'schoolId'
    ])
    .executeTakeFirst();
    if (!school) return { error: 'invalid_school' };

    // === Get Body ===
    const { name, shortcut, district, lesson_start, lesson_length, break_time, warn_absence, fastlogin, resetPasswordWithEmail } = body;
    
    // === Check valid district ===
    const districtDB = await db.selectFrom('districts')
    .select(['districts.districtId'])
    .where('districts.district', '=', district)
    .limit(1)
    .executeTakeFirst();

    if (!districtDB) return { error: 'invalid_district' };

    try {
        const update_school = await db.updateTable('schools')
        .set({
            name,
            shortName: shortcut,
            district: districtDB.districtId,
            startHour: parseInt(lesson_start.split(':')[0]),
            startMinute: parseInt(lesson_start.split(':')[1]),
            lessonHour: lesson_length,
            breakTime: break_time,
            warningAbsencePercent: warn_absence,
            fastlogin,
            resetPasswordWithEmail
        })
        .executeTakeFirst();

        return { success: true }
    } catch(e) {
        return { success: false }
    }
  }, {
    body: t.Object({
        name: t.String(),
        shortcut: t.String(),
        district: t.String(),
        lesson_start: t.String(),
        lesson_length: t.Number(),
        break_time: t.Number(),
        warn_absence: t.Number(),
        fastlogin: t.Boolean(),
        resetPasswordWithEmail: t.Boolean()
    })
   });

export default app;
