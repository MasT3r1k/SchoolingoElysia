import { Elysia } from 'elysia';
import { MainConfig } from '../../../../config/main.config';

const app = new Elysia()
  .get('/marks/config', async ({ cookie }) => {
    const token = cookie.token.value;
    if (!token) {
      return Response.json({ error: 'no_user', details: 'no_cookie' });
    }

    const config = {
      max_weight: MainConfig.MARK_MAX_WEIGHT,
      min_weight: MainConfig.MARK_MIN_WEIGHT,
      mark_display: MainConfig.MARK_DISPLAY,
      mark_ids: MainConfig.ALLOWED_MARKS,
      max_points: MainConfig.MAX_POINTS,
      min_points: MainConfig.MIN_POINTS,
      max_topic_length: MainConfig.MARK_MAX_TOPIC_LENGTH,
      min_topic_length: MainConfig.MARK_MIN_TOPIC_LENGTH,
    }

    return Response.json(config)
  });

export default app;