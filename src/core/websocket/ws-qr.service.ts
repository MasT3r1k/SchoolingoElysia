import { createHmac } from 'node:crypto';
import { QRConfig } from '../../config/qr.config';
import { generateRandomString, safeCompare } from '../utils/crypto.util';

const qrValidationAttempts = new Map<string, { count: number; resetAt: number }>();

export function generateSecureQRCode() {
  const qrcode = generateRandomString(32);
  const timestamp = Date.now();
  const payload = `${qrcode}|${timestamp}`;

  const signature = createHmac('sha256', QRConfig.QR_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 16);

  return {
    qrcode,
    timestamp,
    signature,
    fullCode: `${qrcode}|${timestamp}|${signature}`,
  };
}

export function validateQRCode(fullCode: string, ip: string) {
  const now = Date.now();
  const attempts = qrValidationAttempts.get(ip);

  if (attempts) {
    if (now < attempts.resetAt) {
      if (attempts.count >= QRConfig.QR_MAX_VALIDATION_ATTEMPTS) {
        return { valid: false, error: 'rate_limited' };
      }
      attempts.count++;
    } else {
      qrValidationAttempts.set(ip, { count: 1, resetAt: now + 60_000 });
    }
  } else {
    qrValidationAttempts.set(ip, { count: 1, resetAt: now + 60_000 });
  }

  const parts = fullCode.split('|');
  if (parts.length !== 3) {
    return { valid: false, error: 'invalid_format' };
  }

  const [qrcode, ts, signature] = parts;
  const timestamp = Number(ts);

  if (!timestamp) return { valid: false, error: 'invalid_timestamp' };
  if (now - timestamp > QRConfig.QR_EXPIRY_MS) return { valid: false, error: 'expired' };

  const expected = createHmac('sha256', QRConfig.QR_SECRET)
    .update(`${qrcode}|${timestamp}`)
    .digest('hex')
    .substring(0, 16);

  if (!safeCompare(expected, signature)) {
    return { valid: false, error: 'invalid_signature' };
  }

  return { valid: true, qrcode };
}
