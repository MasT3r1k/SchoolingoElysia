import { Elysia, t } from 'elysia';
import { db } from '../../../../../database'

const elysiaApp = new Elysia()
    .get('/timetable_scheme/:scope_id/:year', async ({ params }) => {
        const scopeId = Number(params.scope_id);
        const year = Number(params.year);

        if (Number.isNaN(scopeId) || Number.isNaN(year)) {
            return Response.json({error: 'Invalid scope_id or year'}, 400);
        }

        const timetableScheme = await db
            .selectFrom('timetable_schemas')
            .select([
                'day',
                'hour',
                'type'
            ])
            .where('scope_id', '=', scopeId)
            .where((eb) => eb.or([
                eb('year', '=', year),
                eb('year', '=', -1)
            ]))
            .execute();

        return timetableScheme;
    })

.post('/timetable_scheme', async ({ body, user }) => {
    const { scopeId, year, scheme } = body;

    /** DELETE old scheme */
    let deleteQuery = db.deleteFrom('timetable_schemas');

    if (scopeId !== -1) {
      deleteQuery = deleteQuery.where('scope_id', '=', scopeId);
    }

    if (year !== -1) {
      deleteQuery = deleteQuery.where('year', '=', year);
    }

    await deleteQuery.execute();

    /** PREPARE INSERT DATA */
    const data = scheme.flatMap((day, dayIndex) =>
      day.flatMap((hour, hourIndex) =>
        hour.map(type => ({
          scope_id: scopeId,
          year,
          day: dayIndex,
          hour: hourIndex,
          type,
          assign_by: user.userId
        }))
      )
    );

    if (data.length === 0) {
      return { success: true, inserted: 0 };
    }

    await db
      .insertInto('timetable_schemas')
      .values(data as any)
      .execute();

    return {
      success: true,
      inserted: data.length
    };
  },
  {
    body: t.Object({
      scopeId: t.Number(),
      year: t.Number(),
      scheme: t.Array(
        t.Array(
          t.Array(t.String())
        )
      )
    })
  }
)

export default elysiaApp;
