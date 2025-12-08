/**
 * Authentication API Tests
 * Tests for login, logout, 2FA, and session management
 */
import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { app } from '../../index';

describe('Authentication API', () => {
    // Test login endpoint
    describe('POST /auth', () => {
        it('should reject login with missing credentials', async () => {
            const response = await app.handle(
                new Request('http://localhost/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                })
            );
            
            const data = await response.json();
            expect(data.error).toBeDefined();
            expect(data.error).toContain('Missing username');
        });

        it('should reject login with invalid username', async () => {
            const response = await app.handle(
                new Request('http://localhost/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'nonexistent_user',
                        password: 'testpassword123'
                    })
                })
            );
            
            const data = await response.json();
            expect(data.error).toBeDefined();
        });

        it('should reject login with short password', async () => {
            const response = await app.handle(
                new Request('http://localhost/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'testuser',
                        password: '123' // Too short
                    })
                })
            );
            
            const data = await response.json();
            expect(data.error).toBeDefined();
        });
    });

    // Test session expansion
    describe('POST /api/v1/sessionexpand', () => {
        it('should reject session expansion without token', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/v1/sessionexpand', {
                    method: 'POST'
                })
            );
            
            // Should return error or unauthorized
            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });
});

describe('Authorization Checks', () => {
    describe('Protected Endpoints', () => {
        it('should reject rewards API without authentication', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/v1/rewards', {
                    method: 'GET'
                })
            );
            
            expect(response.status).toBe(401);
        });

        it('should reject notification rules without authentication', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/v1/notifications/rules', {
                    method: 'GET'
                })
            );
            
            const data = await response.json();
            expect(data.error).toBeDefined();
        });

        it('should reject dashboard without authentication', async () => {
            const response = await app.handle(
                new Request('http://localhost/api/v1/dashboard', {
                    method: 'GET'
                })
            );
            
            const data = await response.json();
            expect(data.error).toBeDefined();
        });
    });
});
