import { Elysia, t } from 'elysia';
import { db } from '../../../../../database';

export default new Elysia({ prefix: '/analytics' })
    .post('/duration', async ({ body, set }: any) => {
        try {
            if (!body.id || !body.duration) {
                set.status = 400;
                return { error: 'Missing ID or duration' };
            }

            await db.updateTable('analytics_visits')
                .set({ duration: Math.floor(body.duration / 1000) }) // convert ms to seconds
                .where('id', '=', body.id)
                .execute();

            return { success: true };
        } catch (error) {
            console.error('Analytics duration update failed:', error);
            set.status = 500;
            return { error: 'Failed to update event duration' };
        }
    }, {
        body: t.Object({
            id: t.Number(),
            duration: t.Number()
        })
    });
