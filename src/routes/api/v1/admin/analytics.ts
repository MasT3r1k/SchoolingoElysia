import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { sql } from 'kysely';

// Helper functions to parse user agent
function parseBrowser(userAgent: string | null): string {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    
    // Check for specific browsers (order matters - check more specific first)
    if (ua.includes('edg/') || ua.includes('edge/')) return 'Edge';
    if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
    if (ua.includes('chrome/') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox/')) return 'Firefox';
    if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('msie') || ua.includes('trident/')) return 'Internet Explorer';
    
    return 'Other';
}

function parseOS(userAgent: string | null): string {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    
    // Check for OS
    if (ua.includes('windows nt 10.0')) return 'Windows 10/11';
    if (ua.includes('windows nt 6.3')) return 'Windows 8.1';
    if (ua.includes('windows nt 6.2')) return 'Windows 8';
    if (ua.includes('windows nt 6.1')) return 'Windows 7';
    if (ua.includes('windows')) return 'Windows (Other)';
    
    if (ua.includes('mac os x')) return 'macOS';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    if (ua.includes('android')) return 'Android';
    
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('ubuntu')) return 'Ubuntu';
    
    return 'Other';
}

export default new Elysia({ prefix: '/admin/analytics' })
    .get('/stats', async ({ query, set }) => {
        const period = query.period || 'day'; // day, week, month, custom
        let dateCondition = sql<boolean>`DATE(timestamp) = CURRENT_DATE`;

        if (period === 'week') {
            dateCondition = sql<boolean>`timestamp >= NOW() - INTERVAL 7 DAY`;
        } else if (period === 'month') {
            dateCondition = sql<boolean>`timestamp >= NOW() - INTERVAL 30 DAY`;
        } else if (period === 'custom' && query.from && query.to) {
            dateCondition = sql<boolean>`DATE(timestamp) >= ${query.from} AND DATE(timestamp) <= ${query.to}`;
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

            // Top Users - using sql.raw for simplicity
            const topUsers: any[] = [];
            try {
                const topUsersRaw = await db
                    .selectFrom('analytics_visits')
                    .innerJoin('users', (join) => join.on(sql`users.user_id`, '=', sql`analytics_visits.user_id`))
                    .leftJoin('persons', 'persons.person_id', 'users.person_id')
                    .select([
                        sql<number>`users.user_id`.as('user_id'),
                        sql<string>`CONCAT(persons.first_name, ' ', persons.last_name)`.as('username'),
                        sql<number>`COUNT(*)`.as('visits'),
                        sql<number>`COUNT(DISTINCT analytics_visits.path)`.as('actions')
                    ])
                    .where(dateCondition)
                    .where('analytics_visits.user_id', 'is not', null)
                    .groupBy([sql`users.user_id`, sql`persons.first_name`, sql`persons.last_name`])
                    .orderBy(sql`COUNT(*)`, 'desc')
                    .limit(10)
                    .execute();

                topUsersRaw.forEach((u: any) => {
                    topUsers.push({
                        user_id: Number(u.user_id),
                        username: String(u.username || ''),
                        visits: Number(u.visits),
                        actions: Number(u.actions)
                    });
                });
            } catch (error) {
                console.log('Top users unavailable:', error);
            }

            // Browser Stats
            const userAgents = await db
                .selectFrom('analytics_visits')
                .select(['user_agent'])
                .where(dateCondition)
                .execute();

            // Parse browsers and count
            const browserCounts = new Map<string, number>();
            const osCounts = new Map<string, number>();
            let totalVisits = userAgents.length;

            userAgents.forEach(visit => {
                const browser = parseBrowser(visit.user_agent);
                const os = parseOS(visit.user_agent);
                
                browserCounts.set(browser, (browserCounts.get(browser) || 0) + 1);
                osCounts.set(os, (osCounts.get(os) || 0) + 1);
            });

            // Convert to array and calculate percentages
            const browsers = Array.from(browserCounts.entries())
                .map(([name, count]) => ({
                    name,
                    visits: count,
                    percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0
                }))
                .sort((a, b) => b.visits - a.visits)
                .slice(0, 5); // Top 5 browsers

            const operatingSystems = Array.from(osCounts.entries())
                .map(([name, count]) => ({
                    name,
                    visits: count,
                    percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0
                }))
                .sort((a, b) => b.visits - a.visits)
                .slice(0, 5); // Top 5 OS

            return {
                nb_visits: summary?.nb_visits || 0,
                nb_uniq_visitors: summary?.nb_uniq_visitors || 0,
                nb_actions: summary?.nb_actions || 0,
                avg_time_on_site: Math.round(Number(summary?.avg_time_on_site || 0)),
                chartData: chartData,
                pages: topPages.map(p => ({
                    ...p,
                    avg_time_on_page: Math.round(Number(p.avg_time_on_page || 0))
                })),
                topUsers: topUsers,
                browsers: browsers,
                operatingSystems: operatingSystems
            };
        } catch (error) {
            console.error('Analytics stats error:', error);
            set.status = 500;
            return { error: 'Failed to fetch analytics' };
        }
    }, {
        query: t.Object({
            period: t.Optional(t.String()),
            date: t.Optional(t.String()),
            from: t.Optional(t.String()),
            to: t.Optional(t.String())
        })
    });
