import { Elysia, t } from 'elysia';
import { db } from '../../../../../database'

const elysiaApp = new Elysia()
  .get('/timetable_scheme/:scope_id/:year', async ({ params }) => {
    console.log(params.scope_id, params.year)
    if (!params.scope_id || !params.year) return;

    const timetable_scheme = await db.selectFrom('timetable_schemas')
    .select([
        'timetable_schemas.day',
        'timetable_schemas.hour',
        'timetable_schemas.type'
    ])
    .where('timetable_schemas.scope_id', '=', parseInt(params.scope_id))
    .where('timetable_schemas.year', '=', parseInt(params.year))
    .execute();

    return Response.json(timetable_scheme);
  })

  .post('/timetable_scheme', async({ body }) => {
    const deleteData = await db.deleteFrom('timetable_schemas');
    if (body.scopeId != -1) {
        deleteData.where('timetable_schemas.scope_id', '=', body.scopeId);
    }
    if (body.year != -1) {
        deleteData.where('timetable_schemas.year', '=', body.year);
    }
    deleteData.execute();

    let data: any[] = [];
    body.scheme.forEach((day: string[], dayIndex: number) => {
        data.push(
            ...day.map((hour, hourIndex) => ({
                scope_id: body.scopeId,
                year: body.year,
                day: dayIndex,
                hour: hourIndex,
                type: hour,
                assign_by: 0
            }))
        );
    });

    await db.insertInto('timetable_schemas')
    .values(data)
    .execute();
  }, {
    body: t.Object({
        scopeId: t.Number(),
        year: t.Number(),
        scheme: t.Array(t.Union([t.Array(t.ArrayString()), t.ArrayString()]))
    })
  });

export default elysiaApp;
