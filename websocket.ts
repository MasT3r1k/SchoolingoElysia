// WebSocket Handler - Enhanced for real-time notifications and secure QR
import { Cookie, Elysia, t } from "elysia";
import { db } from "./database";
import { createHmac } from "crypto";
import { QRConfig } from "./src/config/qr.config";
import { wsClientManager } from "./src/functions/ws-client-manager";
import { logger } from "./src/utils/logger";

// --------------------
// CONFIG
// --------------------

const TOKEN_REVALIDATE_MS = 10_000; // 10s cache
const WS_PING_TIMEOUT_MS = 60_000;

// --------------------
// WS STATE
// --------------------

interface WsState {
    role: "user" | "guest";
    user: {
        user_id: number;
        person: number | null;
    } | null;

    auth: {
        token: string;
        tokenId: number;
        expires: number;
        lastValidated: number;
    } | null;
}

/**
 * socketId -> WsState
 */
export const wsStateStore = new Map<string, WsState>();

// --------------------
// QR RATE LIMIT
// --------------------

const qrValidationAttempts = new Map<
    string,
    { count: number; resetAt: number }
>();

// --------------------
// QR HELPERS
// --------------------

function generateRandomText(length = 32): string {
    const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join("");
}

function generateSecureQRCode() {
    const qrcode = generateRandomText(32);
    const timestamp = Date.now();
    const payload = `${qrcode}|${timestamp}`;

    const signature = createHmac("sha256", QRConfig.QR_SECRET)
        .update(payload)
        .digest("hex")
        .substring(0, 16);

    return {
        qrcode,
        timestamp,
        signature,
        fullCode: `${qrcode}|${timestamp}|${signature}`
    };
}

export function validateQRCode(fullCode: string, ip: string) {
    const now = Date.now();
    const attempts = qrValidationAttempts.get(ip);

    if (attempts) {
        if (now < attempts.resetAt) {
            if (attempts.count >= QRConfig.QR_MAX_VALIDATION_ATTEMPTS) {
                return { valid: false, error: "rate_limited" };
            }
            attempts.count++;
        } else {
            qrValidationAttempts.set(ip, {
                count: 1,
                resetAt: now + 60_000
            });
        }
    } else {
        qrValidationAttempts.set(ip, {
            count: 1,
            resetAt: now + 60_000
        });
    }

    const parts = fullCode.split("|");
    if (parts.length !== 3)
        return { valid: false, error: "invalid_format" };

    const [qrcode, ts, signature] = parts;
    const timestamp = Number(ts);

    if (!timestamp)
        return { valid: false, error: "invalid_timestamp" };

    if (now - timestamp > QRConfig.QR_EXPIRY_MS)
        return { valid: false, error: "expired" };

    const expected = createHmac("sha256", QRConfig.QR_SECRET)
        .update(`${qrcode}|${timestamp}`)
        .digest("hex")
        .substring(0, 16);

    if (expected !== signature)
        return { valid: false, error: "invalid_signature" };

    return { valid: true, qrcode };
}

// --------------------
// AUTH / STATE REVALIDATION
// --------------------

async function revalidateWsState(ws: any): Promise<WsState> {
    const wsId = ws.id;
    const tokenCookie = ws.data.cookie.token as Cookie<string> | undefined;
    const now = Date.now();

    const prev =
        wsStateStore.get(wsId) ??
        ({
            role: "guest",
            user: null,
            auth: null
        } satisfies WsState);

    // -------- NO TOKEN --------
    if (!tokenCookie?.value) {
        if (prev.role === "user") {
            wsClientManager.unregister(wsId);
            ws.send(JSON.stringify({ type: "session_lost" }));
        }

        const state: WsState = { role: "guest", user: null, auth: null };
        wsStateStore.set(wsId, state);
        return state;
    }

    // -------- CACHE HIT --------
    if (
        prev.auth &&
        prev.auth.token === tokenCookie.value &&
        now - prev.auth.lastValidated < TOKEN_REVALIDATE_MS &&
        now < prev.auth.expires
    ) {
        return prev;
    }

    // -------- DB VALIDATION --------
    const auth = await db
        .selectFrom("tokens")
        .leftJoin("users", "users.user_id", "tokens.user_id")
        .select([
            "tokens.token_id",
            "tokens.expires",
            "tokens.user_id",
            "users.person_id"
        ])
        .where("tokens.token", "=", tokenCookie.value)
        .where("tokens.expires", ">=", new Date())
        .executeTakeFirst();

    // -------- INVALID TOKEN --------
    if (!auth) {
        if (prev.role === "user") {
            wsClientManager.unregister(wsId);
            ws.send(JSON.stringify({ type: "session_expired" }));
        }

        const state: WsState = { role: "guest", user: null, auth: null };
        wsStateStore.set(wsId, state);
        return state;
    }

    // -------- VALID TOKEN --------
    const state: WsState = {
        role: "user",
        user: {
            user_id: auth.user_id,
            person: auth.person_id
        },
        auth: {
            token: tokenCookie.value,
            tokenId: auth.token_id,
            expires: +new Date(auth.expires),
            lastValidated: now
        }
    };

    if (
        prev.role !== "user" ||
        prev.user?.user_id !== auth.user_id
    ) {
        wsClientManager.register(
            wsId,
            ws,
            auth.user_id,
            auth.person_id
        );

        ws.send(
            JSON.stringify({
                type: "authenticated",
                user_id: auth.user_id
            })
        );
    }

    wsStateStore.set(wsId, state);
    return state;
}

// --------------------
// WEBSOCKET
// --------------------

export const ws = new Elysia().ws("/ws", {
    cookie: t.Object({
        token: t.Optional(t.String())
    }),

    // ---------- OPEN ----------
    async open(ws) {
        wsStateStore.set(ws.id, {
            role: "guest",
            user: null,
            auth: null
        });

        logger.log(`[WS] connected ${ws.id}`);
    },

    // ---------- MESSAGE ----------
    async message(ws, raw) {
        const state = await revalidateWsState(ws);
        const msg = raw as any;

        // ----- GUEST -----
        if (state.role === "guest") {
            if (msg.type === "qrcode_request") {
                const { qrcode, fullCode } = generateSecureQRCode();

                await db.insertInto("login_qrcodes").values({
                    qrcode,
                    socket: ws.id,
                    user_agent:
                        ws.data.headers?.["user-agent"]?.toString() ??
                        "unknown",
                    ip: ws.remoteAddress
                }).execute();

                ws.send(
                    JSON.stringify({
                        type: "qrcode_result",
                        payload: fullCode,
                        expiresIn: QRConfig.QR_EXPIRY_MS
                    })
                );
                return;
            }

            if (msg.type === "ping") {
                ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
                return;
            }

            return;
        }

        // ----- USER -----
        if (msg.type === "echo") {
            ws.send({
                type: "echo",
                msg: msg.data,
                user_id: state.user!.user_id
            });
            return;
        }

        if (msg.type === "notification_read") {
            await db
                .updateTable("notifications")
                .set({ read_at: new Date() })
                .where(
                    "notification_id",
                    "=",
                    msg.notificationId
                )
                .where(
                    "user_id",
                    "=",
                    state.user!.user_id
                )
                .execute();

            ws.send({
                type: "notification_read_ack",
                notificationId: msg.notificationId
            });
            return;
        }

        if (msg.type === "get_unread_count") {
            const r = await db
                .selectFrom("notifications")
                .select(db.fn.count("notification_id").as("count"))
                .where("user_id", "=", state.user!.user_id)
                .where("read_at", "is", null)
                .executeTakeFirst();

            ws.send({
                type: "unread_count",
                count: Number(r?.count ?? 0)
            });
            return;
        }

        ws.send({ error: "unknown_request" });
    },

    // ---------- CLOSE ----------
    async close(ws) {
        const state = wsStateStore.get(ws.id);

        if (state?.role === "user") {
            wsClientManager.unregister(ws.id);
        }

        await db
            .deleteFrom("login_qrcodes")
            .where("socket", "=", ws.id)
            .execute();

        wsStateStore.delete(ws.id);

        logger.log(`[WS] disconnected ${ws.id}`);
    }
});
