import { Elysia } from 'elysia';
import { env } from '../config/env.config';
import { TooManyRequestsError } from '../errors/http-errors';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup timer every 60 seconds (O(1) request-time lookup)
const CLEANUP_INTERVAL_MS = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

export interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  skipRoutes?: string[];
  keyPrefix?: string;
  enforceInDev?: boolean;
}

export function createRateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const max = options.maxRequests ?? env.RATE_LIMIT_MAX;
  const skipRoutes = options.skipRoutes ?? [
    '/api/upload',
    '/api/download',
    '/assets',
    '/docs',
    '/swagger',
    '/locales',
    '/version',
    '/api/v1/version',
    '/ws',
  ];
  const prefix = options.keyPrefix ? `${options.keyPrefix}:` : '';

  return new Elysia({ name: `rate-limiter-${options.keyPrefix || 'global'}` })
    .onRequest(({ request, set }) => {
      // 1. Never rate-limit if globally disabled
      if (!env.RATE_LIMIT_ENABLED) {
        return;
      }

      // 2. Never rate-limit CORS preflight OPTIONS requests
      if (request.method === 'OPTIONS') {
        return;
      }

      const url = new URL(request.url);

      // 3. Check if current route should bypass rate limiting
      for (const skipped of skipRoutes) {
        if (url.pathname.startsWith(skipped)) {
          return;
        }
      }

      const ip = extractClientIp(request);

      // 4. In local development, avoid blocking developer unless explicitly enforced in tests
      const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
      if (env.NODE_ENV === 'development' && isLocalhost && !options.enforceInDev) {
        set.headers['X-RateLimit-Limit'] = 'unlimited';
        set.headers['X-RateLimit-Remaining'] = 'unlimited';
        return;
      }

      const key = `${prefix}${ip}`;
      const now = Date.now();

      let record = rateLimitStore.get(key);

      if (!record || record.resetAt <= now) {
        record = {
          count: 1,
          resetAt: now + windowMs,
        };
        rateLimitStore.set(key, record);
      } else {
        record.count++;
      }

      set.headers['X-RateLimit-Limit'] = String(max);
      set.headers['X-RateLimit-Remaining'] = String(Math.max(0, max - record.count));
      set.headers['X-RateLimit-Reset'] = String(Math.ceil(record.resetAt / 1000));

      if (record.count > max) {
        const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
        set.status = 429;
        set.headers['Retry-After'] = String(retryAfterSeconds);
        throw new TooManyRequestsError('Rate limit exceeded. Please try again later.', retryAfterSeconds);
      }
    });
}

// Global API rate limiter instance
export const globalRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX,
});

// Strict rate limiter for authentication endpoints (anti-brute-force)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: env.RATE_LIMIT_AUTH_MAX,
  keyPrefix: 'auth',
});
