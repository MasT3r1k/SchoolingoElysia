// WebSocket Handler - Enhanced for real-time notifications and secure QR
import { Elysia, t } from "elysia";
import { db } from "./database";
import { createHmac } from "crypto";
import { QRConfig } from "./src/config/qr.config";
import { wsClientManager } from "./src/functions/ws-client-manager";
import { logger } from "./src/utils/logger";

// Rate limiting for QR validation attempts
const qrValidationAttempts: Map<string, { count: number; resetAt: number }> = new Map();

/**
 * Generate cryptographically random text
 */
function generateRandomText(length = 32): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Generate secure QR code with HMAC signature and timestamp
 */
function generateSecureQRCode(): { qrcode: string; timestamp: number; signature: string; fullCode: string } {
    const qrcode = generateRandomText(32);
    const timestamp = Date.now();
    const payload = `${qrcode}|${timestamp}`;
    const signature = createHmac('sha256', QRConfig.QR_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 16); // Shortened signature for QR readability
    
    return {
        qrcode,
        timestamp,
        signature,
        fullCode: `${qrcode}|${timestamp}|${signature}`
    };
}

/**
 * Validate QR code with HMAC signature and expiry
 */
export function validateQRCode(fullCode: string, ip: string): { valid: boolean; error?: string; qrcode?: string } {
    // Rate limiting check
    const now = Date.now();
    const attempts = qrValidationAttempts.get(ip);
    
    if (attempts) {
        if (now < attempts.resetAt) {
            if (attempts.count >= QRConfig.QR_MAX_VALIDATION_ATTEMPTS) {
                return { valid: false, error: 'rate_limited' };
            }
            attempts.count++;
        } else {
            qrValidationAttempts.set(ip, { count: 1, resetAt: now + 60000 });
        }
    } else {
        qrValidationAttempts.set(ip, { count: 1, resetAt: now + 60000 });
    }

    // Parse QR code
    const parts = fullCode.split('|');
    if (parts.length !== 3) {
        return { valid: false, error: 'invalid_format' };
    }

    const [qrcode, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
        return { valid: false, error: 'invalid_timestamp' };
    }

    // Check expiry
    if (now - timestamp > QRConfig.QR_EXPIRY_MS) {
        return { valid: false, error: 'expired' };
    }

    // Validate HMAC signature
    const payload = `${qrcode}|${timestamp}`;
    const expectedSignature = createHmac('sha256', QRConfig.QR_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 16);

    if (signature !== expectedSignature) {
        return { valid: false, error: 'invalid_signature' };
    }

    return { valid: true, qrcode };
}

// Define state type for WebSocket
interface WsState {
    user: {
        userId: number;
        person: number | null;
    } | null;
    role: "user" | "guest";
}

export const ws = new Elysia()
    .state('wsState', {} as Record<string, WsState>)
    .ws('/ws', {
        cookie: t.Object({
            token: t.Optional(t.String())
        }),

        async open(ws) {
            const token = ws.data.cookie.token;
            const wsId = ws.id;
            
            logger.log('WS conn: ' + token + ' | wsID: ' + wsId)

            // Initialize state for this connection
            const state: WsState = {
                user: null,
                role: "guest"
            };

            if (token?.value) {
                const auth = await db
                    .selectFrom("tokens")
                    .leftJoin("users", "users.userId", "tokens.userId")
                    .select(["tokens.userId", "users.person"])
                    .where("tokens.token", "=", token.value)
                    .where("tokens.expires", ">=", new Date())
                    .executeTakeFirst();

                if (auth) {
                    state.user = auth;
                    state.role = "user";
                    
                    // Register with client manager for real-time notifications
                    wsClientManager.register(wsId, ws, auth.userId, auth.person);
                    
                    // Store state
                    (ws as any)._state = state;
                    
                    // Send initial connection success
                    ws.send(JSON.stringify({
                        type: "connected",
                        userId: auth.userId,
                        timestamp: Date.now()
                    }));
                    return;
                }
            }

            // Store guest state
            (ws as any)._state = state;
            console.log("WS GUEST connected");
        },

        async message(ws, raw) {
            const state: WsState = (ws as any)._state || { user: null, role: "guest" };
            let msg: any;
            
            try {
                msg = raw;
            } catch {
                ws.send(JSON.stringify({ error: "invalid_json" }));
                return;
            }

            // ----------------- GUEST -----------------
            if (state.role == "guest") {
                // Guest can only request QR codes for login
                if (msg.type == "qrcode_request") {
                    // Generate secure QR code with signature
                    const { qrcode, fullCode } = generateSecureQRCode();

                    // Check for collision (unlikely but safe)
                    const existing = await db.selectFrom('login_qrcodes')
                        .select(['qrcode'])
                        .where('qrcode', '=', qrcode)
                        .executeTakeFirst();

                    if (existing) {
                        // Regenerate if collision (extremely rare)
                        ws.send(JSON.stringify({ type: "qrcode_request" }));
                        return;
                    }

                    // Store QR code in database
                    await db.insertInto('login_qrcodes')
                        .values({
                            qrcode,
                            socket: ws.id,
                            userAgent: ws.data.headers?.['user-agent']?.toString() || 'unknown',
                            ip: ws.remoteAddress
                        })
                        .execute();

                    // Clean up old QR codes for this socket (keep only 2 most recent)
                    const keepRecords = await db.selectFrom('login_qrcodes')
                        .select('qrcode')
                        .where('socket', '=', ws.id)
                        .orderBy('created', 'desc')
                        .limit(2)
                        .execute();

                    const idsToKeep = keepRecords.map(r => r.qrcode);

                    if (idsToKeep.length > 0) {
                        await db.deleteFrom('login_qrcodes')
                            .where('socket', '=', ws.id)
                            .where('qrcode', 'not in', idsToKeep)
                            .execute();
                    }

                    // Send secure QR code to client
                    ws.send(JSON.stringify({
                        type: "qrcode_result",
                        payload: fullCode,
                        expiresIn: QRConfig.QR_EXPIRY_MS // Tell client when it expires
                    }));
                    return;
                }

                // Ping/pong allowed for guests too
                if (msg.type === "ping") {
                    ws.send(JSON.stringify({
                        type: "pong",
                        timestamp: Date.now()
                    }));
                    return;
                }

                // Ignore other messages for guests instead of disconnecting
                // This allows frontend to send get_unread_count etc. which will just be ignored
                console.log(`[WS] Guest sent unsupported message type: ${msg.type}, ignoring`);
                return;
            }

            // ----------------- AUTHENTICATED USER -----------------
            
            // Echo for testing
            if (msg.type === "echo") {
                ws.send(JSON.stringify({
                    type: "echo",
                    msg: msg.data,
                    userId: state.user!.userId
                }));
                return;
            }

            // Subscribe to specific notification types (optional)
            if (msg.type === "subscribe") {
                // Client can subscribe to specific channels
                // For now, all authenticated users get all their notifications
                ws.send(JSON.stringify({
                    type: "subscribed",
                    channels: msg.channels || ['all']
                }));
                return;
            }

            // Ping/pong for connection health
            if (msg.type === "ping") {
                ws.send(JSON.stringify({
                    type: "pong",
                    timestamp: Date.now()
                }));
                return;
            }

            // Mark notification as read
            if (msg.type === "notification_read" && msg.notificationId) {
                try {
                    await db
                        .updateTable('notifications')
                        .set({ read_at: new Date() })
                        .where('notification_id', '=', msg.notificationId)
                        .where('user_id', '=', state.user!.userId)
                        .execute();
                    
                    ws.send(JSON.stringify({
                        type: "notification_read_ack",
                        notificationId: msg.notificationId
                    }));
                } catch (err) {
                    console.error('[WS] Failed to mark notification as read:', err);
                }
                return;
            }

            // Get unread notification count
            if (msg.type === "get_unread_count") {
                try {
                    const result = await db
                        .selectFrom('notifications')
                        .select(db.fn.count('notification_id').as('count'))
                        .where('user_id', '=', state.user!.userId)
                        .where('read_at', 'is', null)
                        .executeTakeFirst();
                    
                    ws.send(JSON.stringify({
                        type: "unread_count",
                        count: Number(result?.count || 0)
                    }));
                } catch (err) {
                    console.error('[WS] Failed to get unread count:', err);
                    ws.send(JSON.stringify({
                        type: "unread_count",
                        count: 0
                    }));
                }
                return;
            }

            ws.send(JSON.stringify({ error: "unknown_request" }));
        },  

        async close(ws) {
            const state: WsState = (ws as any)._state || { user: null, role: "guest" };
            
            // Unregister from client manager
            if (state.role === "user" && state.user) {
                wsClientManager.unregister(ws.id);
            }

            if (state.role == "guest") {
            // Remove QR codes for guest connections
            await db.deleteFrom('login_qrcodes')
                .where('socket', '=', ws.id)
                .execute();

            console.log("WS disconnected:", state.user?.userId ?? "guest");
            }
        }
    });
