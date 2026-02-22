import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import { rateLimit } from 'elysia-rate-limit'
import { format_people_by_ids } from '../../../../functions/format_person_by_ids';
import moment from 'moment';

const elysiaAp = new Elysia()
.post('/timetable/substitution', async({ cookie, body }) => {
    const token = cookie.token?.value as string;

    if (!token) {
        return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const auth = await db
      .selectFrom('tokens')
      .leftJoin('users', 'tokens.user_id', 'users.user_id')
      .select(['tokens.user_id', 'users.person_id'])
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
        room_id,
        start_date: start_date_str, start_hour,
        end_date: end_date_str, end_hour,
        type
    } = body;

    if (group_id === undefined || subject_id === undefined || teacher_id === undefined || start_date_str === undefined || start_hour === undefined || end_date_str === undefined || end_hour === undefined) {
        return Response.json({ error: 'missing_fields' }, { status: 400 });
    }

    const start_date = moment(start_date_str, 'YYYY-MM-DD').toDate();
    const end_date = moment(end_date_str, 'YYYY-MM-DD').toDate();

    // === Check if substitution already exist ===
    const substitution = await db.selectFrom('substitution')
    .select([
        'substitution.subject_id',
        'substitution.teacher_id',
        'substitution.start_date',
        'substitution.start_hour',
        'substitution.end_date',
        'substitution.end_hour',
    ])
    .where('substitution.start_date', '=', start_date)
    .where('substitution.start_hour', '=', start_hour)
    .where('substitution.end_date', '=', end_date)
    .where('substitution.end_hour', '=', end_hour)
    .where('substitution.group_id', '=', group_id)
    .executeTakeFirst()

    const typeValue = type || 'substitution';

    try {
        if (substitution) {
            await db.updateTable('substitution')
            .set({
                subject_id: subject_id,
                teacher_id: teacher_id,
                room_id: room_id,
                type: typeValue
            })
            .where('substitution.start_date', '=', start_date)
            .where('substitution.start_hour', '=', start_hour)
            .where('substitution.end_date', '=', end_date)
            .where('substitution.end_hour', '=', end_hour)
            .where('substitution.group_id', '=', group_id)
            .executeTakeFirst();
        } else {
            await db.insertInto('substitution')
            .values({
                group_id,
                subject_id,
                teacher_id,
                room_id,
                start_date,
                start_hour,
                end_date,
                end_hour,
                type: typeValue
            })
            .executeTakeFirst();
        }
        return Response.json({ success: true });
    } catch(e) {
        return Response.json({ success: false });
    }
}, {
    body: t.Object({
        group_id: t.Optional(t.Nullable(t.Number())),
        subject_id: t.Optional(t.Nullable(t.Number())),
        teacher_id: t.Optional(t.Nullable(t.Number())),
        room_id: t.Optional(t.Nullable(t.Number())),
        start_date: t.Optional(t.String()),
        start_hour: t.Optional(t.Number()),
        end_date: t.Optional(t.String()),
        end_hour: t.Optional(t.Number()),
        type: t.Optional(t.String())
    })
});


export default elysiaAp;
