import { Elysia, t } from 'elysia';

// TODO: Update directly or use environment variables
const MATOMO_CONFIG = {
    URL: process.env.MATOMO_URL || 'https://demo.matomo.org/', 
    TOKEN: process.env.MATOMO_TOKEN || 'anonymous',
    SITE_ID: process.env.MATOMO_SITE_ID || '1'
};

export default new Elysia({ prefix: '/admin/matomo' })
    .get('/stats', async ({ query, set }) => {
        const method = query.method || 'VisitsSummary.get';
        const period = query.period || 'day';
        const date = query.date || 'today';

        try {
            const params = new URLSearchParams({
                module: 'API',
                method: method as string,
                idSite: MATOMO_CONFIG.SITE_ID,
                period: period as string,
                date: date as string,
                format: 'JSON',
                token_auth: MATOMO_CONFIG.TOKEN
            });

            const response = await fetch(`${MATOMO_CONFIG.URL}?${params.toString()}`);
            
            if (!response.ok) {
                 throw new Error(`Matomo API error: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Matomo fetch error:', error);
            set.status = 500;
            return { error: 'Failed to fetch Matomo stats' };
        }
    }, {
        query: t.Object({
            method: t.Optional(t.String()),
            period: t.Optional(t.String()),
            date: t.Optional(t.String())
        })
    });
