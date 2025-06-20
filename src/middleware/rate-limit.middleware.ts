import { Elysia } from 'elysia';
import { config } from '../config/app.config';

const windowMs = parseInt(config.RATE_LIMIT_WINDOW_MS);
const max = parseInt(config.RATE_LIMIT_MAX);

const store = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = new Elysia()
  .derive(({ request }) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of store.entries()) {
      if (value.resetTime < windowStart) {
        store.delete(key);
      }
    }

    // Get or create rate limit info
    let rateLimitInfo = store.get(ip);
    if (!rateLimitInfo) {
      rateLimitInfo = { count: 0, resetTime: now + windowMs };
      store.set(ip, rateLimitInfo);
    }
    rateLimitInfo.count++;

    return { rateLimitInfo };
  })
  .onRequest(({ rateLimitInfo, set }: any) => {
    if (rateLimitInfo && rateLimitInfo.count > max) {
      set.status = 429;
      throw new Error('Too many requests');
    }
  }); 