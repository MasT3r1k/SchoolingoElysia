/**
 * WebSocket Tests
 * Tests for WebSocket connections, QR code generation, and notifications
 */
import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { validateQRCode } from '../../websocket';
import { QRConfig } from '../config/qr.config';
import { createHmac } from 'crypto';

describe('QR Code Security', () => {
    describe('validateQRCode', () => {
        it('should reject invalid format', () => {
            const result = validateQRCode('invalid-qr-code', '127.0.0.1');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('invalid_format');
        });

        it('should reject QR code with wrong number of parts', () => {
            const result = validateQRCode('part1|part2', '127.0.0.1');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('invalid_format');
        });

        it('should reject expired QR code', () => {
            const oldTimestamp = Date.now() - 60000; // 1 minute ago
            const qrcode = 'testqrcode123456789012345678901234';
            const payload = `${qrcode}|${oldTimestamp}`;
            const signature = createHmac('sha256', QRConfig.QR_SECRET)
                .update(payload)
                .digest('hex')
                .substring(0, 16);
            
            const result = validateQRCode(`${qrcode}|${oldTimestamp}|${signature}`, '127.0.0.1');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('expired');
        });

        it('should reject QR code with invalid signature', () => {
            const timestamp = Date.now();
            const qrcode = 'testqrcode123456789012345678901234';
            const wrongSignature = 'wrongsignature12';
            
            const result = validateQRCode(`${qrcode}|${timestamp}|${wrongSignature}`, '127.0.0.1');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('invalid_signature');
        });

        it('should accept valid QR code', () => {
            const timestamp = Date.now();
            const qrcode = 'testqrcode123456789012345678901234';
            const payload = `${qrcode}|${timestamp}`;
            const signature = createHmac('sha256', QRConfig.QR_SECRET)
                .update(payload)
                .digest('hex')
                .substring(0, 16);
            
            const result = validateQRCode(`${qrcode}|${timestamp}|${signature}`, '127.0.0.1');
            expect(result.valid).toBe(true);
            expect(result.qrcode).toBe(qrcode);
        });

        it('should rate limit validation attempts', () => {
            const timestamp = Date.now();
            const qrcode = 'testqrcode123456789012345678901234';
            const wrongSignature = 'wrongsignature12';
            const testIp = '192.168.1.100';
            
            // Make multiple failed attempts
            for (let i = 0; i < QRConfig.QR_MAX_VALIDATION_ATTEMPTS; i++) {
                validateQRCode(`${qrcode}|${timestamp}|${wrongSignature}`, testIp);
            }
            
            // Next attempt should be rate limited
            const result = validateQRCode(`${qrcode}|${timestamp}|${wrongSignature}`, testIp);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('rate_limited');
        });
    });
});

describe('QR Configuration', () => {
    it('should have valid rotation interval', () => {
        expect(QRConfig.QR_ROTATION_INTERVAL_MS).toBeGreaterThan(0);
        expect(QRConfig.QR_ROTATION_INTERVAL_MS).toBeLessThanOrEqual(60000); // Max 1 minute
    });

    it('should have valid expiry time', () => {
        expect(QRConfig.QR_EXPIRY_MS).toBeGreaterThan(QRConfig.QR_ROTATION_INTERVAL_MS);
    });

    it('should have valid max validation attempts', () => {
        expect(QRConfig.QR_MAX_VALIDATION_ATTEMPTS).toBeGreaterThan(0);
        expect(QRConfig.QR_MAX_VALIDATION_ATTEMPTS).toBeLessThanOrEqual(10);
    });

    it('should have a secret configured', () => {
        expect(QRConfig.QR_SECRET).toBeDefined();
        expect(QRConfig.QR_SECRET.length).toBeGreaterThanOrEqual(10);
    });
});
