import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

/**
 * Generate a cryptographically secure random token (256-bit entropy by default)
 */
export function generateSecureToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('base64url');
}

/**
 * Hash a session token or sensitive identifier with SHA-256 for safe DB storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate numeric random code (e.g. for SMS / 2FA backup codes)
 */
export function generateNumericCode(length = 6): string {
  const digits = '0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += digits[bytes[i] % digits.length];
  }
  return result;
}

/**
 * Generate secure random alphanumeric string
 */
export function generateRandomString(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
