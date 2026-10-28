import { Elysia, t } from 'elysia';
import { db } from '@database';
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
        .leftJoin('users', 'tokens.user_id', 'users.user_id')
        .select(['tokens.user_id', 'users.person_id'])
        .where('tokens.token', '=', token)
        .where('tokens.expires', '>=', moment().toDate())
        .limit(1)
        .executeTakeFirst();

        if (!auth || !auth.person_id) {
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
        .select(['person_id'])
        .where('person_id', '=', auth.person_id)
        .limit(1)
        .execute();

        if (!student.length) {
            return Response.json({ error: 'no_permission' });
        }

        const companyExists = await db
            .selectFrom('traineeship_companies')
            .select(({ fn }) => fn.count<number>('company_id').as('count'))
            .where('company_id', '=', companyId)
            .executeTakeFirst();

        if (!companyExists || companyExists.count === 0) {
            return Response.json({ error: 'invalid_company' });
        }

        const traineeshipExists = await db
            .selectFrom('traineeship_weeks')
            .select(({ fn }) => fn.count<number>('tr_week_id').as('count'))
            .where('tr_week_id', '=', traineeship)
            .executeTakeFirst();

        if (!traineeshipExists || traineeshipExists.count === 0) {
            return Response.json({ error: 'invalid_traineeship' });
        }

        let instructorExists;

        if (instructorId != undefined && instructorId != null) {
            instructorExists = await db
                .selectFrom('traineeship_instructors')
                .select(
                    ({ fn }) => fn.count<number>('traineeship_instructors.instructor_id').as('count')
                )
                .select([
                    'traineeship_instructors.firstname',
                    'traineeship_instructors.lastname'
                ])
                .where('traineeship_instructors.company_id', '=', companyId)
                .where('traineeship_instructors.instructor_id', '=', instructorId)
                .executeTakeFirst();

            if (!instructorExists || instructorExists.count === 0) {
                return Response.json({ error: 'invalid_instructor' });
            }
        }

        const isSelectedCompany = await db.selectFrom('traineeship_students')
        .select([
            'company_id',
            'instructor_id',
            'student_id',
            'traineeship_id',
        ])
        .where('student_id', '=', auth.person_id)
        .where('traineeship_id', '=', traineeship)
        .executeTakeFirst();

        try {
            if (!isSelectedCompany) {
                await db.insertInto('traineeship_students')
                .values({
                    traineeship_id: traineeship,
                    student_id: auth.person_id,
                    company_id: companyId,
                    instructor_id: instructorId ?? null
                })
                .execute();
            } else {
                await db.updateTable('traineeship_students')
                .set({
                    company_id: companyId,
                    instructor_id: instructorId ?? null
                })
                .where('traineeship_id', '=', traineeship)
                .where('student_id', '=', auth.person_id)
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
