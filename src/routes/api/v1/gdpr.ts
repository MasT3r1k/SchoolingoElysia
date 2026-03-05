import { Elysia, t } from 'elysia'
import { db } from '../../../../database'
import { sql } from 'kysely'

export const gdprRoutes = new Elysia({ prefix: '/gdpr' })
    .get('/consents', async ({ user }: any) => {
        if (!user) return { error: 'Unauthorized' }

        const ownConsents = await db.selectFrom('gdpr_consents')
            .leftJoin('gdpr_user_consents', (join) => 
                join.onRef('gdpr_user_consents.consent_id', '=', 'gdpr_consents.id')
                    .on('gdpr_user_consents.user_id', '=', user.user_id)
            )
            .select([
                'gdpr_consents.id as consent_id',
                'gdpr_consents.title',
                'gdpr_consents.type',
                'gdpr_consents.description',
                'gdpr_consents.purpose',
                'gdpr_consents.instructions',
                'gdpr_consents.required',
                'gdpr_user_consents.granted',
                'gdpr_user_consents.granted_at',
                'gdpr_user_consents.expires_at',
                sql<string | null>`NULL`.as('person_name'),
                sql<number>`${user.user_id}`.as('target_user_id')
            ])
            .where('gdpr_consents.active', '=', true)
            .execute()

        let allConsents = [...ownConsents]
        
        // If user is a parent, fetch children's consents
        const children = await db.selectFrom('family_relations')
            .innerJoin('persons', 'persons.person_id', 'family_relations.source_id')
            .innerJoin('users', 'users.person_id', 'persons.person_id')
            .where('family_relations.target_id', '=', user.person_id)
            .select(['users.user_id', 'persons.first_name', 'persons.last_name'])
            .execute()

        for (const child of children) {
            const childConsents = await db.selectFrom('gdpr_consents')
                .leftJoin('gdpr_user_consents', (join) => 
                    join.onRef('gdpr_user_consents.consent_id', '=', 'gdpr_consents.id')
                        .on('gdpr_user_consents.user_id', '=', child.user_id)
                )
                .select([
                    'gdpr_consents.id as consent_id',
                    'gdpr_consents.title',
                    'gdpr_consents.type',
                    'gdpr_consents.description',
                    'gdpr_consents.purpose',
                    'gdpr_consents.instructions',
                    'gdpr_consents.required',
                    'gdpr_user_consents.granted',
                    'gdpr_user_consents.granted_at',
                    'gdpr_user_consents.expires_at',
                    sql<string>`CONCAT(persons.first_name, ' ', persons.last_name)`.as('person_name'),
                    sql<number>`${child.user_id}`.as('target_user_id')
                ])
                .where('gdpr_consents.active', '=', true)
                .execute()
            allConsents = [...allConsents, ...childConsents as any]
        }

        return { consents: allConsents }
    })
    .put('/consents', async ({ user, body }: any) => {
        if (!user) return { error: 'Unauthorized' }
        const { consent_id, granted, target_user_id } = body as { consent_id: number, granted: boolean | null, target_user_id: number }

        // Security check: if target_user_id is different from current user, check if it's their child
        if (target_user_id !== user.user_id) {
            const isChild = await db.selectFrom('family_relations')
                .innerJoin('users', 'users.person_id', 'family_relations.source_id')
                .where('family_relations.target_id', '=', user.person_id)
                .where('users.user_id', '=', target_user_id)
                .select('family_relation_id')
                .executeTakeFirst()
            
            if (!isChild) return { error: 'Forbidden' }
        }

        const existing = await db.selectFrom('gdpr_user_consents')
            .where('user_id', '=', target_user_id)
            .where('consent_id', '=', consent_id)
            .select('id')
            .executeTakeFirst()

        if (existing) {
            await db.updateTable('gdpr_user_consents')
                .set({
                    granted,
                    granted_at: granted !== null ? new Date() : null
                })
                .where('id', '=', existing.id)
                .execute()
        } else {
            await db.insertInto('gdpr_user_consents')
                .values({
                    user_id: target_user_id,
                    consent_id,
                    granted,
                    granted_at: granted !== null ? new Date() : null
                })
                .execute()
        }

        return { success: true }
    }, {
        body: t.Object({
            consent_id: t.Number(),
            granted: t.Union([t.Boolean(), t.Null()]),
            target_user_id: t.Number()
        })
    })
    .get('/training', async ({ user }: any) => {
        if (!user) return { error: 'Unauthorized' }

        const training = await db.selectFrom('gdpr_training')
            .leftJoin('gdpr_user_training', (join) =>
                join.onRef('gdpr_user_training.training_id', '=', 'gdpr_training.id')
                    .on('gdpr_user_training.user_id', '=', user.user_id)
            )
            .select([
                'gdpr_training.id as training_id',
                'gdpr_training.name',
                'gdpr_training.description',
                'gdpr_user_training.status',
                'gdpr_user_training.score',
                'gdpr_user_training.completed_at',
                'gdpr_user_training.expires_at'
            ])
            .where('gdpr_training.active', '=', true)
            .execute()

        // Map status to what frontend expects if needed, or ensure it matches
        return { training: training.map(t => ({
            ...t,
            status: t.status || 'not_started'
        })) }
    })
    .get('/export-requests', async ({ user }: any) => {
        if (!user) return { error: 'Unauthorized' }

        const requests = await db.selectFrom('gdpr_requests')
            .where('user_id', '=', user.user_id)
            .orderBy('requested_at', 'desc')
            .selectAll()
            .execute()

        return { requests }
    })
    .post('/export', async ({ user }: any) => {
        if (!user) return { error: 'Unauthorized' }

        const result = await db.insertInto('gdpr_requests')
            .values({
                user_id: user.user_id,
                type: 'export',
                status: 'pending',
                requested_at: new Date()
            })
            .executeTakeFirst()

        return { success: true, request_id: Number(result.insertId) }
    })
    .delete('/account', async ({ user }: any) => {
        if (!user) return { error: 'Unauthorized' }

        await db.insertInto('gdpr_requests')
            .values({
                user_id: user.user_id,
                type: 'deletion',
                status: 'pending',
                requested_at: new Date()
            })
            .execute()

        return { success: true }
    })
    .post('/report', async ({ user, body }: any) => {
        if (!user) return { error: 'Unauthorized' }
        const { type, subject, message } = body as { type: 'breach' | 'objection', subject: string, message: string }

        await db.insertInto('gdpr_reports')
            .values({
                user_id: user.user_id,
                type,
                subject,
                message,
                status: 'new'
            })
            .execute()

        return { success: true }
    }, {
        body: t.Object({
            type: t.Union([t.Literal('breach'), t.Literal('objection')]),
            subject: t.String(),
            message: t.String()
        })
    })
    .patch('/training/:id/status', async ({ user, params, body }: any) => {
        if (!user) return { error: 'Unauthorized' }
        const { status } = body as { status: 'not_started' | 'in_progress' | 'completed' | 'failed' }

        const existing = await db.selectFrom('gdpr_user_training')
            .where('user_id', '=', user.user_id)
            .where('training_id', '=', Number(params.id))
            .select('id')
            .executeTakeFirst()

        if (existing) {
            await db.updateTable('gdpr_user_training')
                .set({ status })
                .where('id', '=', existing.id)
                .execute()
        } else {
            await db.insertInto('gdpr_user_training')
                .values({
                    user_id: user.user_id,
                    training_id: Number(params.id),
                    status,
                    completed_at: status === 'completed' ? new Date() : null
                })
                .execute()
        }

        return { success: true }
    }, {
        body: t.Object({
            status: t.String()
        })
    })

    // --- ADMIN ROUTES ---
    .group('/admin', (app) => app
        .derive(async ({ user } : any) => {
            if (!user || !['management', 'admin_staff', 'manager'].includes(user.role)) {
                throw new Error('Unauthorized admin access')
            }
            return { isAdmin: true }
        })
        .get('/consents', async () => {
            const consents = await db.selectFrom('gdpr_consents')
                .leftJoin('gdpr_user_consents', 'gdpr_user_consents.consent_id', 'gdpr_consents.id')
                .select([
                    'gdpr_consents.id',
                    'gdpr_consents.title',
                    'gdpr_consents.type',
                    'gdpr_consents.description',
                    'gdpr_consents.purpose',
                    'gdpr_consents.instructions',
                    'gdpr_consents.required',
                    'gdpr_consents.target_group',
                    'gdpr_consents.active',
                    sql<number>`count(gdpr_user_consents.id)`.as('respondents_count'),
                    sql<number>`count(CASE WHEN gdpr_user_consents.granted = 1 THEN 1 END)`.as('granted_count')
                ])
                .groupBy('gdpr_consents.id')
                .execute()

            return { consents }
        })
        .post('/consents', async ({ body }) => {
            const result = await db.insertInto('gdpr_consents')
                .values({
                    ...body as any,
                    active: true
                })
                .executeTakeFirst()
            return { success: true, id: Number(result.insertId) }
        }, {
            body: t.Object({
                title: t.String(),
                type: t.String(),
                description: t.Optional(t.String()),
                purpose: t.Optional(t.String()),
                instructions: t.Optional(t.String()),
                required: t.Boolean(),
                target_group: t.Optional(t.String())
            })
        })
        .put('/consents/:id', async ({ params, body }) => {
            await db.updateTable('gdpr_consents')
                .set(body as any)
                .where('id', '=', Number(params.id))
                .execute()
            return { success: true }
        })
        .delete('/consents/:id', async ({ params }) => {
            await db.deleteFrom('gdpr_consents')
                .where('id', '=', Number(params.id))
                .execute()
            return { success: true }
        })
        .get('/reports', async () => {
            const reports = await db.selectFrom('gdpr_reports')
                .innerJoin('users', 'users.user_id', 'gdpr_reports.user_id')
                .innerJoin('persons', 'persons.person_id', 'users.person_id')
                .select([
                    'gdpr_reports.id as report_id',
                    'gdpr_reports.type',
                    'gdpr_reports.subject',
                    'gdpr_reports.message',
                    'gdpr_reports.status',
                    'gdpr_reports.created_at',
                    sql<string>`CONCAT(persons.first_name, ' ', persons.last_name)`.as('user_name')
                ])
                .orderBy('gdpr_reports.created_at', 'desc')
                .execute()

            return { reports }
        })
        .patch('/reports/:id/status', async ({ params, body }) => {
            await db.updateTable('gdpr_reports')
                .set({ status: (body as any).status })
                .where('id', '=', Number(params.id))
                .execute()
            return { success: true }
        }, {
            body: t.Object({
                status: t.Union([t.Literal('new'), t.Literal('processing'), t.Literal('closed')])
            })
        })
        .delete('/reports/:id', async ({ params }) => {
            await db.deleteFrom('gdpr_reports')
                .where('id', '=', Number(params.id))
                .execute()
            return { success: true }
        })
        .get('/training', async () => {
            const training = await db.selectFrom('gdpr_training')
                .selectAll()
                .execute()
            return { training: training.map(t => ({ ...t, training_id: t.id })) }
        })
        .post('/training', async ({ body }) => {
            const result = await db.insertInto('gdpr_training')
                .values({
                    ...body as any,
                    active: true
                })
                .executeTakeFirst()
            return { success: true, id: Number(result.insertId) }
        }, {
            body: t.Object({
                name: t.String(),
                description: t.Optional(t.String()),
                valid_days: t.Optional(t.Number()),
                target_group: t.Optional(t.String())
            })
        })
        .put('/training/:id', async ({ params, body }) => {
            await db.updateTable('gdpr_training')
                .set(body as any)
                .where('id', '=', Number(params.id))
                .execute()
            return { success: true }
        })
        .delete('/training/:id', async ({ params }) => {
            await db.deleteFrom('gdpr_training')
                .where('id', '=', Number(params.id))
                .execute()
            return { success: true }
        })
        .get('/reviews', async () => {
            const reviews = await db.selectFrom('gdpr_reviews')
                .selectAll()
                .orderBy('date', 'desc')
                .execute()
            return { reviews: reviews.map(r => ({ ...r, review_id: r.id })) }
        })
        .post('/reviews', async ({ body }) => {
            const result = await db.insertInto('gdpr_reviews')
                .values(body as any)
                .executeTakeFirst()
            return { success: true, id: Number(result.insertId) }
        }, {
            body: t.Object({
                title: t.String(),
                description: t.Optional(t.String()),
                date: t.String(), // String representation of date
                status: t.Union([t.Literal('planned'), t.Literal('completed'), t.Literal('cancelled')]),
                result: t.Optional(t.String())
            })
        })
        .put('/reviews/:id', async ({ params, body }) => {
            await db.updateTable('gdpr_reviews')
                .set(body as any)
                .where('id', '=', Number(params.id))
                .execute()
            return { success: true }
        })
        .delete('/reviews/:id', async ({ params }) => {
            await db.deleteFrom('gdpr_reviews')
                .where('id', '=', Number(params.id))
                .execute()
            return { success: true }
        })
    )

export default gdprRoutes
