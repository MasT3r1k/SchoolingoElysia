import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';
import { getIPData } from '../../../../functions/get_ip_data';

export default new Elysia({ prefix: '/analytics' })
    .post('/track', async ({ body, request, headers, set, store }: any) => {
        try {
            const { ip } = store;
            const header_ip = headers['x-forwarded-for'] || request.headers.get('x-forwarded-for') || 'unknown';

            const ipData = await getIPData(ip ?? typeof header_ip === 'string' ? header_ip.split(',')[0].trim() : String(header_ip));

            const userAgent = headers['user-agent'] || request.headers.get('user-agent');
            
            await db.insertInto('analytics_visits')
                .values({
                    visitor_id: body.visitor_id,
                    user_id: body.user_id || null,
                    url: body.url,
                    path: body.path,
                    method: 'GET',
                    ip_address: ipData?.ip ?? ip ?? typeof header_ip === 'string' ? header_ip.split(',')[0].trim() : String(header_ip),
                    user_agent: userAgent,
                })
                .execute();

            return { success: true };
        } catch (error) {
            console.error('Analytics tracking failed:', error);
            set.status = 500;
            return { error: 'Failed to track event' };
        }
    }, {
        body: t.Object({
            visitor_id: t.String(),
            user_id: t.Optional(t.Nullable(t.Number())),
            url: t.String(),
            path: t.String()
        })
    });
