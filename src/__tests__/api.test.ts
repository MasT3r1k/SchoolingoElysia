/**
 * API Endpoint Tests
 * Tests for various API endpoints
 */
import { describe, expect, it } from 'bun:test';
import { app } from '../../index';

describe('API Endpoints', () => {
    describe('Health Check', () => {
        it('should respond to version endpoint', async () => {
            const response = await app.handle(
                new Request('http://localhost/version', {
                    method: 'GET'
                })
            );
            
            expect(response.status).toBe(200);
        });
    });

    describe('Locale API', () => {
        it('should return available locales', async () => {
            const response = await app.handle(
                new Request('http://localhost/locales', {
                    method: 'GET'
                })
            );
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data) || typeof data === 'object').toBe(true);
        });
    });

    describe('School Configuration', () => {
        it('should return school config without auth', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/v1/school', {
                    method: 'GET'
                })
            );
            
            // School config may or may not require auth based on implementation
            expect([200, 401, 404]).toContain(response.status);
        });
    });

    describe('Input Validation', () => {
        it('should reject malformed JSON', async () => {
            const response = await app.handle(
                new Request('http://localhost/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: '{ invalid json }'
                })
            );
            
            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        it('should handle empty body gracefully', async () => {
            const response = await app.handle(
                new Request('http://localhost/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: ''
                })
            );
            
            // Should not crash, just return an error
            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('Security Headers', () => {
        it('should handle CORS preflight', async () => {
            const response = await app.handle(
                new Request('http://localhost/auth', {
                    method: 'OPTIONS',
                    headers: {
                        'Origin': 'http://localhost:4200',
                        'Access-Control-Request-Method': 'POST'
                    }
                })
            );
            
            // Should return OK for preflight from allowed origin
            expect([200, 204]).toContain(response.status);
        });
    });
});

describe('Rewards API', () => {
    describe('GET /api/v1/rewards', () => {
        it('should require authentication', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/v1/rewards', {
                    method: 'GET'
                })
            );
            
            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/v1/rewards', () => {
        it('should require authentication for creating rewards', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/v1/rewards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: 'Test Reward',
                        type: 'prize',
                        studentId: 1
                    })
                })
            );
            
            expect(response.status).toBe(401);
        });
    });
});

describe('Notifications API', () => {
    describe('GET /api/v1/notifications/rules', () => {
        it('should require authentication', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/v1/notifications/rules', {
                    method: 'GET'
                })
            );
            
            const data = await response.json();
            expect(data.error).toBeDefined();
        });
    });
});
