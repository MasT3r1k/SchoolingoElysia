import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import moment from 'moment';


const app = new Elysia()
  .post(
    '/traineeship/select_company',
    async ({ body, cookie }) => {
        const token = cookie.token?.value as string;

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

        const { companyId, traineeship, instructorId } = body;

        if (companyId == undefined || isNaN(companyId)) {
            return Response.json({ error: 'invalid_company_id' });
        }

        if (traineeship == undefined || isNaN(traineeship)) {
            return Response.json({ error: 'invalid_traineeship' });
        }

        if (instructorId === undefined) {
            return Response.json({ error: 'invalid_instructor_id' });
        }

        const student = await db
        .selectFrom('students')
        .select(['personId'])
        .where('personId', '=', auth.person)
        .limit(1)
        .execute();

        if (!student.length) {
            return Response.json({ error: 'no_permission' });
        }

        const companyExists = await db
            .selectFrom('traineeship_companies')
            .select(({ fn }) => fn.count<number>('companyId').as('count'))
            .where('companyId', '=', companyId)
            .executeTakeFirst();

        if (!companyExists || companyExists.count === 0) {
            return Response.json({ error: 'invalid_company' });
        }


        const traineeshipExists = await db
            .selectFrom('traineeship_weeks')
            .select(({ fn }) => fn.count<number>('trWeekId').as('count'))
            .where('trWeekId', '=', traineeship)
            .executeTakeFirst();

        if (!traineeshipExists || traineeshipExists.count === 0) {
            return Response.json({ error: 'invalid_traineeship' });
        }

        let instructorExists;

        if (instructorId != undefined && instructorId != null) {
            instructorExists = await db
                .selectFrom('traineeship_instructors')
                .select(
                    ({ fn }) => fn.count<number>('traineeship_instructors.instructorId').as('count')
                )
                .select([
                    'traineeship_instructors.firstname',
                    'traineeship_instructors.lastname'
                ])
                .where('traineeship_instructors.companyId', '=', companyId)
                .where('traineeship_instructors.instructorId', '=', instructorId)
                .executeTakeFirst();

            if (!instructorExists || instructorExists.count === 0) {
                return Response.json({ error: 'invalid_instructor' });
            }
        }

        const isSelectedCompany = await db.selectFrom('traineeship_students')
        .select([
            'company',
            'instructor',
            'studentId',
            'traineeship',
        ])
        .where('studentId', '=', auth.person)
        .where('traineeship', '=', traineeship)
        .executeTakeFirst();

        try {
            if (!isSelectedCompany) {
                await db.insertInto('traineeship_students')
                .values({
                    traineeship,
                    studentId: auth.person!,
                    company: companyId,
                    instructor: instructorId
                })
            } else {
                await db.updateTable('traineeship_students')
                .set('company', companyId)
                .set('instructor', instructorId)
                .where('traineeship', '=', traineeship)
                .where('studentId', '=', auth.person!)
                .limit(1)
                .execute();
            }

            return Response.json({
                status: 'success',
                traineeship: traineeship,
                companyId: companyId,
                instructor: instructorExists ? `${instructorExists.firstname} ${instructorExists.lastname}` : null
            });
        } catch(e) {
            return Response.json({
                status: 'error',
                error: 'failed_to_save'
            });
        }
    },
    {
      body: t.Object({
        companyId: t.Number(),
        traineeship: t.Number(),
        instructorId: t.Optional(t.Nullable(t.Number())),
      })
    }
  );

export default app;
