import z from "zod";

// === QR Code Configuration ===
const qrEnvSchema = z.object({
    // Rotation interval in milliseconds (default: 5 seconds)
    QR_ROTATION_INTERVAL_MS: z.number().default(5000),
    // QR code validity in milliseconds (default: 30 seconds - allows 2 previous codes)
    QR_EXPIRY_MS: z.number().default(30000),
    // Maximum validation attempts per IP per minute
    QR_MAX_VALIDATION_ATTEMPTS: z.number().default(5),
    // Secret for HMAC signature
    QR_SECRET: z.string().default(process.env.QR_SECRET || 'schoolingo-qr-secret-change-in-production'),
});

export const QRConfig = qrEnvSchema.parse({
    QR_ROTATION_INTERVAL_MS: parseInt(process.env.QR_ROTATION_INTERVAL_MS || '5000'),
    QR_EXPIRY_MS: parseInt(process.env.QR_EXPIRY_MS || '30000'),
    QR_MAX_VALIDATION_ATTEMPTS: parseInt(process.env.QR_MAX_VALIDATION_ATTEMPTS || '5'),
    QR_SECRET: process.env.QR_SECRET || 'schoolingo-qr-secret-change-in-production',
});
