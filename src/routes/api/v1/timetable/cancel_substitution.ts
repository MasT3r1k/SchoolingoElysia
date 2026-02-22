import { Elysia, t } from 'elysia';
import { db } from "../../../../../database"
import moment from 'moment';
import { getAuthUser } from '../../../../utils/auth';

const app = new Elysia()
    .derive(async ({ cookie }) => ({
        user: await getAuthUser(cookie?.token?.value as string)
    }))
    .post('/timetable/cancel_substitution', async ({ body, user }) => {
        if (!user) return { error: 'unauthorized', status: 401 };

        const { 
            group_id,
            start_date: start_date_str, start_hour,
            end_date: end_date_str, end_hour
        } = body;

        if (group_id == undefined || start_date_str == undefined || start_hour == undefined || end_date_str == undefined || end_hour == undefined) {
            return { error: 'missing_fields' };
        }

        const start_date = moment(start_date_str, 'YYYY-MM-DD').toDate();
        const end_date = moment(end_date_str, 'YYYY-MM-DD').toDate();

        try {
            await db.deleteFrom('substitution')
                .where('group_id', '=', group_id)
                .where('start_date', '=', start_date)
                .where('start_hour', '=', start_hour)
                .where('end_date', '=', end_date)
                .where('end_hour', '=', end_hour)
                .execute();

            return { success: true };
        } catch(e) {
            console.error(e);
            return { success: false, error: e };
        }
    }, {
        body: t.Object({
            group_id: t.Optional(t.Nullable(t.Number())),
            subject_id: t.Optional(t.Nullable(t.Number())),
            teacher_id: t.Optional(t.Nullable(t.Number())),
            start_date: t.String(),
            start_hour: t.Number(),
            end_date: t.String(),
            end_hour: t.Number()
        })
    });

export default app;
