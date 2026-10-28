/**
 * Users Domain Tests
 * Tests for user profile retrieval, session extension, preferences, avatar history, and contact management.
 */
import { describe, expect, it } from 'bun:test';
import { app } from '../../index';

describe('Users Domain Protected Endpoints', () => {
  it('GET /api/v1/user should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/user', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/user/avatar-history should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/user/avatar-history', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(401);
  });

  it('POST /api/v1/sessionexpand should reject request without token', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/sessionexpand', {
        method: 'POST',
      })
    );

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('POST /api/v1/user/update should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'UPDATE_THEME', theme: 1 }),
      })
    );

    expect(res.status).toBe(401);
  });

  it('POST /api/v1/user/email should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/user/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@schoolingo.cz' }),
      })
    );

    expect(res.status).toBe(401);
  });

  it('DELETE /api/v1/user/email should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/user/email', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@schoolingo.cz' }),
      })
    );

    expect(res.status).toBe(401);
  });

  it('POST /api/v1/user/phone should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/user/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '+420', number: '123456789' }),
      })
    );

    expect(res.status).toBe(401);
  });

  it('DELETE /api/v1/user/phone should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/user/phone', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: '123456789' }),
      })
    );

    expect(res.status).toBe(401);
  });

  it('GET /user (root alias) should require authentication', async () => {
    const res = await app.handle(
      new Request('http://localhost/user', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(401);
  });

  it('POST /sessionexpand (root alias) should reject request without token', async () => {
    const res = await app.handle(
      new Request('http://localhost/sessionexpand', {
        method: 'POST',
      })
    );

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('Token Expiration Mechanics', () => {
  it('UsersService.expandSession should return a valid future Date object', async () => {
    const { UsersService } = await import('../modules/users/users.service');
    const token = 'test-mock-token-nonexistent';
    const expires = await UsersService.expandSession(token);

    expect(expires).toBeInstanceOf(Date);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
  });
});
