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

            // Chart Data
            let chartData: { label: string, value: number }[] = [];

            if (period === 'day') {
                // Group by Hour for Today
                const hourlyData = await db
                    .selectFrom('analytics_visits')
                    .select([
                        sql<number>`HOUR(timestamp)`.as('hour'),
                        sql<number>`count(*)`.as('visits')
                    ])
                    .where(dateCondition)
                    .groupBy('hour')
                    .orderBy('hour')
                    .execute();

                // Fill missing hours
                for (let i = 0; i < 24; i++) {
                    const found = hourlyData.find(h => h.hour === i);
                    chartData.push({
                        label: `${i}:00`,
                        value: Number(found?.visits || 0)
                    });
                }
            } else {
                // Group by Date for Week/Month
                const dailyData = await db
                    .selectFrom('analytics_visits')
                    .select([
                        sql<string>`DATE_FORMAT(timestamp, '%Y-%m-%d')`.as('date'),
                        sql<string>`DATE_FORMAT(timestamp, '%d.%m.')`.as('formatted_date'),
                        sql<number>`count(*)`.as('visits')
                    ])
                    .where(dateCondition)
                    .groupBy('date')
                    .groupBy('formatted_date') // Add this to keep SQL mode happy if needed, though usually DATE_FORMAT is derived
                    .orderBy('date')
                    .execute();

                // We might want to fill missing days, but for now let's just show present data or logic to fill gaps
                // For simplicity in this iteration, let's map existing data. 
                // A better approach would be to generate a date range and left join, but let's see.
                // Minimal viable "wow" is smooth data.
                
                chartData = dailyData.map(d => ({
                    label: d.formatted_date,
                    value: Number(d.visits)
                }));
            }

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
                chartData: chartData,
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
