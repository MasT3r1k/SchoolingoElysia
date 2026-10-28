/**
 * Rate Limiting Guard Tests
 * Tests for IP extraction, sliding window accounting, upload bypassing, CORS preflight bypass, and 429 limits.
 */
import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { extractClientIp, createRateLimiter } from '@core/middleware/rate-limit.guard';
import { errorPlugin } from '@core/plugins/error.plugin';

describe('extractClientIp Helper', () => {
  it('should extract first IP from comma-separated x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178' },
    });
    expect(extractClientIp(req)).toBe('203.0.113.195');
  });

  it('should extract x-real-ip if present', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '198.51.100.42' },
    });
    expect(extractClientIp(req)).toBe('198.51.100.42');
  });

  it('should fallback to 127.0.0.1 if no headers present', () => {
    const req = new Request('http://localhost');
    expect(extractClientIp(req)).toBe('127.0.0.1');
  });
});

describe('createRateLimiter Middleware', () => {
  it('should set X-RateLimit headers and allow requests within limit', async () => {
    const testApp = new Elysia()
      .use(errorPlugin)
      .use(createRateLimiter({ windowMs: 10_000, maxRequests: 5, keyPrefix: 'test-allow' }))
      .get('/test', () => ({ ok: true }));

    const res = await testApp.handle(
      new Request('http://localhost/test', {
        headers: { 'x-real-ip': '10.0.0.1' },
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4');
  });

  it('should reject requests exceeding limit with 429 status', async () => {
    const testApp = new Elysia()
      .use(errorPlugin)
      .use(createRateLimiter({ windowMs: 10_000, maxRequests: 2, keyPrefix: 'test-limit' }))
      .get('/limited', () => ({ ok: true }));

    const headers = { 'x-real-ip': '10.0.0.2' };

    // Request 1: allowed
    const res1 = await testApp.handle(new Request('http://localhost/limited', { headers }));
    expect(res1.status).toBe(200);

    // Request 2: allowed
    const res2 = await testApp.handle(new Request('http://localhost/limited', { headers }));
    expect(res2.status).toBe(200);

    // Request 3: blocked (limit exceeded)
    const res3 = await testApp.handle(new Request('http://localhost/limited', { headers }));
    expect(res3.status).toBe(429);
  });

  it('should bypass CORS preflight OPTIONS requests without consuming tokens', async () => {
    const testApp = new Elysia()
      .use(errorPlugin)
      .use(createRateLimiter({ windowMs: 10_000, maxRequests: 1, keyPrefix: 'test-options' }))
      .options('/api/data', () => new Response(null, { status: 204 }))
      .get('/api/data', () => ({ ok: true }));

    const headers = { 'x-real-ip': '10.0.0.99' };

    // Multiple preflight requests must not trigger rate limit
    for (let i = 0; i < 5; i++) {
      const res = await testApp.handle(new Request('http://localhost/api/data', { method: 'OPTIONS', headers }));
      expect([200, 204]).toContain(res.status);
    }

    // The actual request should still be allowed
    const resActual = await testApp.handle(new Request('http://localhost/api/data', { method: 'GET', headers }));
    expect(resActual.status).toBe(200);
  });

  it('should bypass skipped routes like /api/upload', async () => {
    const testApp = new Elysia()
      .use(errorPlugin)
      .use(
        createRateLimiter({
          windowMs: 10_000,
          maxRequests: 1,
          skipRoutes: ['/api/upload'],
          keyPrefix: 'test-bypass',
        })
      )
      .post('/api/upload', () => ({ uploaded: true }))
      .get('/regular', () => ({ ok: true }));

    const headers = { 'x-real-ip': '10.0.0.3' };

    // Multiple upload requests should not be blocked
    for (let i = 0; i < 3; i++) {
      const res = await testApp.handle(
        new Request('http://localhost/api/upload', { method: 'POST', headers })
      );
      expect(res.status).toBe(200);
    }
  });
});
