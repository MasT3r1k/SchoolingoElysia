import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

export default new Elysia({ prefix: '/admin/analytics' })
    .get('/stats', async ({ query, set }) => {
        const period = query.period || 'day'; // day, week, month
        let dateCondition = sql<boolean>`DATE(timestamp) = CURRENT_DATE`;

        if (period === 'week') {
            dateCondition = sql<boolean>`timestamp >= NOW() - INTERVAL 7 DAY`;
        } else if (period === 'month') {
            dateCondition = sql<boolean>`timestamp >= NOW() - INTERVAL 30 DAY`;
        }

        try {
            // Visits & Unique Visitors
            const summary = await db
                .selectFrom('analytics_visits')
                .select([
                    sql<number>`count(*)`.as('nb_visits'),
                    sql<number>`count(distinct visitor_id)`.as('nb_uniq_visitors'),
                    sql<number>`count(*)`.as('nb_actions'), 
                    // Calculate average duration, default to 0 if null
                    sql<number>`COALESCE(AVG(duration), 0)`.as('avg_time_on_site')
                ])
                .where(dateCondition)
                .executeTakeFirst();

            // Top Pages
            const topPages = await db
                .selectFrom('analytics_visits')
                .select([
                    'path as label',
                    sql<number>`count(*)`.as('nb_visits'),
                    sql<number>`count(distinct visitor_id)`.as('nb_uniq_visitors'),
                    sql<number>`COALESCE(AVG(duration), 0)`.as('avg_time_on_page')
                ])
                .where(dateCondition)
                .groupBy('path')
                .orderBy('nb_visits', 'desc')
                .limit(10)
                .execute();

            return {
                nb_visits: summary?.nb_visits || 0,
                nb_uniq_visitors: summary?.nb_uniq_visitors || 0,
                nb_actions: summary?.nb_actions || 0,
                avg_time_on_site: Math.round(Number(summary?.avg_time_on_site || 0)),
                pages: topPages.map(p => ({
                    ...p,
                    avg_time_on_page: Math.round(Number(p.avg_time_on_page || 0))
                }))
            };
        } catch (error) {
            console.error('Analytics stats error:', error);
            set.status = 500;
            return { error: 'Failed to fetch analytics' };
        }
    }, {
        query: t.Object({
            period: t.Optional(t.String()),
            date: t.Optional(t.String())
        })
    });
