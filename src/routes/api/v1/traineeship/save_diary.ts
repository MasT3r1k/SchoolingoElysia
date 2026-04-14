import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';

const app = new Elysia()
  .post(
    '/traineeship/save_diary',
    async ({ body, cookie }) => {
      const token = cookie.token?.value as string;
      if (!token) return { error: 'no_user', details: 'no_cookie' };

      const auth = await db
        .selectFrom('tokens')
        .leftJoin('users', 'users.user_id', 'tokens.user_id')
        .select(['tokens.token_id', 'tokens.user_id', 'users.person_id'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', new Date())
        .executeTakeFirst();

      if (!auth?.person_id) return { error: 'no_user', details: 'no_db' };

      const { traineeshipId, date, title, hours, description, gained } = body;

      try {
        const existing = await db.selectFrom('traineeship_diary')
          .select('diary_id')
          .where('tr_week_id', '=', traineeshipId)
          .where('student_id', '=', auth.person_id)
          .where('date', '=', moment(date).toDate())
          .executeTakeFirst();

        if (existing) {
          await db.updateTable('traineeship_diary')
            .set({
              title,
              hours,
              description,
              gained,
              status: 'filed'
            })
            .where('diary_id', '=', existing.diary_id)
            .execute();
        } else {
          await db.insertInto('traineeship_diary')
            .values({
              tr_week_id: traineeshipId,
              student_id: auth.person_id,
              date: moment(date).toDate(),
              title,
              hours,
              description,
              gained,
              status: 'filed',
              mark: ''
            })
            .execute();
        }

        return Response.json({
          status: 'success'
        });

      } catch (e: any) {
        console.error(e);
        return Response.json({
          status: 'error',
          error: 'failed_to_save',
          details: e.message
        });
      }
    },
    {
      body: t.Object({
        traineeshipId: t.Number(),
        date: t.String(),
        title: t.String(),
        hours: t.Number(),
        description: t.String(),
        gained: t.String()
      })
    }
  );

export default app;
