/**
 * Authentication API Tests
 * Tests for login, logout, 2FA, QR, Passkeys, and session management
 */
import { describe, expect, it } from 'bun:test';
import { app } from '../../index';

describe('Authentication API', () => {
  // Test login endpoint
  describe('POST /auth', () => {
    it('should reject login with missing credentials', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      );

      const data: any = await response.json();
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
            password: 'testpassword123',
          }),
        })
      );

      const data: any = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject login with short password', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            password: '123', // Too short
          }),
        })
      );

      const data: any = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  // Test session expansion
  describe('POST /api/v1/sessionexpand', () => {
    it('should reject session expansion without token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/sessionexpand', {
          method: 'POST',
        })
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  // Test Passkeys WebAuthn options
  describe('GET /auth-passkey', () => {
    it('should generate valid WebAuthn authentication options', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth-passkey', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.challenge).toBeDefined();
    });
  });

  // Test QR code authentication
  describe('POST /auth/qr', () => {
    it('should reject invalid or expired QR code', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: 'nonexistent-qr-token' }),
        })
      );

      const data: any = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  // Test Forgot Password
  describe('POST /forgot-pass', () => {
    it('should reject forgot-password request with missing username', async () => {
      const response = await app.handle(
        new Request('http://localhost/forgot-pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      );

      const data: any = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  // Test Logout
  describe('Logout Endpoints', () => {
    it('GET /api/logout should return no_user error without token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/logout', {
          method: 'GET',
        })
      );

      const data: any = await response.json();
      expect(data.error).toBe('no_user');
    });

    it('POST /api/logout should return no_user error without token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/logout', {
          method: 'POST',
        })
      );

      const data: any = await response.json();
      expect(data.error).toBe('no_user');
    });

    it('GET /logout (root alias) should return no_user error without token', async () => {
      const response = await app.handle(
        new Request('http://localhost/logout', {
          method: 'GET',
        })
      );

      const data: any = await response.json();
      expect(data.error).toBe('no_user');
    });

    it('POST /logout (root alias) should return no_user error without token', async () => {
      const response = await app.handle(
        new Request('http://localhost/logout', {
          method: 'POST',
        })
      );

      const data: any = await response.json();
      expect(data.error).toBe('no_user');
    });
  });

  // Test Change Password
  describe('POST /changepassword', () => {
    it('should reject change password without authentication', async () => {
      const response = await app.handle(
        new Request('http://localhost/changepassword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldpassword: 'oldpassword123',
            password: 'newpassword123',
          }),
        })
      );

      expect([400, 401]).toContain(response.status);
    });
  });
});

describe('Authorization Checks', () => {
  describe('Protected Endpoints', () => {
    it('should reject rewards API without authentication', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/rewards', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(401);
    });

    it('should reject notification rules without authentication', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/notifications/rules', {
          method: 'GET',
        })
      );

      const data: any = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject dashboard without authentication', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/dashboard', {
          method: 'GET',
        })
      );

      const data: any = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
