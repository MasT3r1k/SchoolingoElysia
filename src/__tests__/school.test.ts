/**
 * School Domain Tests
 * Tests for school configuration, study scopes, academic years, classes, and architecture.
 */
import { describe, expect, it } from 'bun:test';
import { app } from '../../index';

describe('School Domain Endpoints', () => {
  it('GET /api/v1/school should return school configuration without auth', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/school', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.breaks).toBeDefined();
    expect(Array.isArray(data.breaks)).toBe(true);
  });

  it('GET /api/v1/school/ (trailing slash) should return the same configuration', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/school/', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.breaks).toBeDefined();
  });

  it('GET /api/v1/scopes should return available fields of study', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/scopes', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /api/v1/school/degrees should return academic degrees list', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/school/degrees', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /api/v1/school/insurance should return insurance companies list', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/school/insurance', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /api/v1/school/years should return school years list', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/school/years', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /api/v1/school/classes should return classes list', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/school/classes', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /api/v1/school/architecture/overview should return architecture counters', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/school/architecture/overview', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(typeof data.buildings).toBe('number');
    expect(typeof data.rooms).toBe('number');
    expect(typeof data.hallways).toBe('number');
    expect(typeof data.inventory).toBe('number');
  });

  it('GET /api/v1/school/architecture/buildings should return buildings list', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/school/architecture/buildings', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
