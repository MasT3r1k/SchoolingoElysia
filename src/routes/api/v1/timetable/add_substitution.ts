import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { rateLimit } from 'elysia-rate-limit'
import { app } from '../../../../../index';
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';
import moment from 'moment';

const elysiaAp = new Elysia()
.use(rateLimit({
    scoping: "scoped",
    max: 5,
    duration: 1000,
    injectServer: () => app.server
  }))
.post('/timetable/substitution', async({ cookie, body }) => {
    const token = cookie.token.value;

    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.userId', 'users.userId')
      .select(['tokens.userId', 'users.person'])
      .where('tokens.token', '=', token)
      .where('tokens.expires', '>=', moment().toDate())
      .limit(1)
      .executeTakeFirst();

    if (!auth) {
        return Response.json({ error: 'no_user', details: 'no_db' });
    }

    const { 
        group_id,
        subject_id,
        teacher_id,
        start_date, start_hour,
        end_date, end_hour
    } = body;

    if (group_id == undefined || subject_id == undefined || teacher_id == undefined || start_date == undefined || start_hour == undefined || end_date == undefined || end_hour == undefined) {
        return;
    }

    // === Check if substitution already exist ===
    const substitution = await db.selectFrom('substitution')
    .select([
        'substitution.subjectId',
        'substitution.teacherId',
        'substitution.start_date',
        'substitution.start_hour',
        'substitution.end_date',
        'substitution.end_hour',
    ])
    .where('substitution.start_date', '=', moment(start_date).format('YYYY-MM-DD'))
    .where('substitution.start_hour', '=', start_hour)
    .where('substitution.end_date', '=', moment(end_date).format('YYYY-MM-DD'))
    .where('substitution.end_hour', '=', end_hour)
    .where('substitution.groupId', '=', group_id)
    .executeTakeFirst()

    try {
        if (substitution) {
            await db.updateTable('substitution')
            .set({
                subjectId: subject_id,
                teacherId: teacher_id
            })
            .where('substitution.start_date', '=', moment(start_date).format('YYYY-MM-DD'))
            .where('substitution.start_hour', '=', start_hour)
            .where('substitution.end_date', '=', moment(end_date).format('YYYY-MM-DD'))
            .where('substitution.end_hour', '=', end_hour)
            .where('substitution.groupId', '=', group_id)
            .executeTakeFirst();
        } else {
            await db.insertInto('substitution')
            .values({
                groupId: group_id,
                subjectId: subject_id,
                teacherId: teacher_id,
                start_date,
                start_hour,
                end_date,
                end_hour
            })
            .executeTakeFirst();
        }
        return Response.json({ success: true });
    } catch(e) {
        return Response.json({ success: false });
    }
}, {
    body: t.Object({
        group_id: t.Optional(t.Number()),
        subject_id: t.Optional(t.Nullable(t.Number())),
        teacher_id: t.Optional(t.Nullable(t.Number())),
        start_date: t.Optional(t.Date()),
        start_hour: t.Optional(t.Number()),
        end_date: t.Optional(t.Date()),
        end_hour: t.Optional(t.Number()),
    })
});


export default elysiaAp;
