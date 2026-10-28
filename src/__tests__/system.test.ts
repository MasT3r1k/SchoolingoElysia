/**
 * System Domain Tests
 * Tests for version tracking, Git status synchronization, and changelog endpoints.
 */
import { describe, expect, it } from 'bun:test';
import { app } from '../../index';

describe('System Domain Endpoints', () => {
  it('GET /version should return version and git info', async () => {
    const res = await app.handle(
      new Request('http://localhost/version', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.version).toBeDefined();
    expect(typeof data.version).toBe('string');
    expect(typeof data.isUpToDate).toBe('boolean');
    expect(typeof data.aheadCount).toBe('number');
    expect(typeof data.behindCount).toBe('number');
  });

  it('GET /api/v1/version should return the same structure under API prefix', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/version', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.version).toBeDefined();
    expect(typeof data.aheadCount).toBe('number');
  });

  it('GET /api/v1/changelog should return changelog entries array', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/changelog', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0].version).toBeDefined();
    }
  });

  it('POST /api/v1/refresh should return status 200 and refreshed git state', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/refresh', {
        method: 'POST',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.ok).toBe(true);
    expect(data.version).toBeDefined();
  });
});
