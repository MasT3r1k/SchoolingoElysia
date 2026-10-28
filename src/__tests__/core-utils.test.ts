/**
 * Core Utilities & Error Handling Tests
 * Tests for cryptographic functions, response helpers, and standardized HTTP errors.
 */
import { describe, expect, it } from 'bun:test';
import {
  generateSecureToken,
  hashToken,
  generateNumericCode,
  generateRandomString,
  safeCompare,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
} from '@core';

describe('Core Cryptographic Utilities', () => {
  it('generateSecureToken should return base64url encoded token of expected length', () => {
    const token32 = generateSecureToken(32);
    expect(typeof token32).toBe('string');
    expect(token32.length).toBeGreaterThanOrEqual(40); // 32 bytes base64url is ~43 chars

    const token16 = generateSecureToken(16);
    expect(typeof token16).toBe('string');
    expect(token16.length).toBeLessThan(token32.length);

    // Tokens must be unique
    const anotherToken = generateSecureToken(32);
    expect(token32).not.toBe(anotherToken);
  });

  it('hashToken should compute deterministic SHA-256 hash', () => {
    const raw = 'my-super-secret-token-12345';
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // 256 bits = 64 hex characters
    expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);

    const differentHash = hashToken('another-token');
    expect(hash1).not.toBe(differentHash);
  });

  it('generateNumericCode should return digits only of specified length', () => {
    const code6 = generateNumericCode(6);
    expect(code6.length).toBe(6);
    expect(/^\d{6}$/.test(code6)).toBe(true);

    const code8 = generateNumericCode(8);
    expect(code8.length).toBe(8);
    expect(/^\d{8}$/.test(code8)).toBe(true);
  });

  it('generateRandomString should return alphanumeric string of specified length', () => {
    const str16 = generateRandomString(16);
    expect(str16.length).toBe(16);
    expect(/^[a-zA-Z0-9]{16}$/.test(str16)).toBe(true);

    const str32 = generateRandomString(32);
    expect(str32.length).toBe(32);
  });

  it('safeCompare should safely compare strings in constant time', () => {
    expect(safeCompare('secret_token_123', 'secret_token_123')).toBe(true);
    expect(safeCompare('secret_token_123', 'wrong_token')).toBe(false);
    expect(safeCompare('short', 'longer_string_here')).toBe(false);
    expect(safeCompare('', '')).toBe(true);
  });
});

describe('Standardized Response Helpers', () => {
  it('createSuccessResponse should format success JSON with optional metadata', () => {
    const payload = { id: 1, name: 'Schoolingo' };
    const res = createSuccessResponse(payload, { durationMs: 12 });

    expect(res.success).toBe(true);
    expect(res.data).toEqual(payload);
    expect(res.meta?.durationMs).toBe(12);
  });

  it('createErrorResponse should format error JSON according to RFC 7807', () => {
    const err = createErrorResponse('INVALID_CREDENTIALS', 'Wrong password', 401, { attemptsLeft: 2 });

    expect(err.success).toBe(false);
    expect(err.error.code).toBe('INVALID_CREDENTIALS');
    expect(err.error.message).toBe('Wrong password');
    expect(err.error.statusCode).toBe(401);
    expect(err.error.details).toEqual({ attemptsLeft: 2 });
  });

  it('createPaginatedResponse should calculate pagination metadata properly', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const paginated = createPaginatedResponse(items, 10, 1, 2);

    expect(paginated.success).toBe(true);
    expect(paginated.data).toEqual(items);
    expect(paginated.pagination.total).toBe(10);
    expect(paginated.pagination.page).toBe(1);
    expect(paginated.pagination.pageSize).toBe(2);
    expect(paginated.pagination.totalPages).toBe(5);
    expect(paginated.pagination.hasNext).toBe(true);
    expect(paginated.pagination.hasPrev).toBe(false);
  });
});

describe('HTTP Error Hierarchy', () => {
  it('BadRequestError should have 400 status code', () => {
    const err = new BadRequestError('Bad input', { field: 'username' });
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('BAD_REQUEST');
    expect(err.message).toBe('Bad input');
    expect(err.details).toEqual({ field: 'username' });
    expect(err instanceof AppError).toBe(true);
  });

  it('UnauthorizedError should have 401 status code', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.errorCode).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError should have 403 status code', () => {
    const err = new ForbiddenError('No admin privileges');
    expect(err.statusCode).toBe(403);
    expect(err.errorCode).toBe('FORBIDDEN');
  });

  it('NotFoundError should have 404 status code', () => {
    const err = new NotFoundError('User not found');
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe('NOT_FOUND');
  });

  it('ConflictError should have 409 status code', () => {
    const err = new ConflictError('Email already registered');
    expect(err.statusCode).toBe(409);
    expect(err.errorCode).toBe('CONFLICT');
  });

  it('ValidationError should have 422 status code', () => {
    const err = new ValidationError('Payload invalid');
    expect(err.statusCode).toBe(422);
    expect(err.errorCode).toBe('VALIDATION_ERROR');
  });

  it('TooManyRequestsError should have 429 status code and retryAfter', () => {
    const err = new TooManyRequestsError('Rate limit exceeded', 60);
    expect(err.statusCode).toBe(429);
    expect(err.errorCode).toBe('TOO_MANY_REQUESTS');
    expect(err.retryAfter).toBe(60);
  });

  it('InternalServerError should have 500 status code and not be operational', () => {
    const err = new InternalServerError();
    expect(err.statusCode).toBe(500);
    expect(err.errorCode).toBe('INTERNAL_SERVER_ERROR');
    expect(err.isOperational).toBe(false);
  });
});
