// src/ws/index.ts
import { Elysia, t } from "elysia";
import { db } from "./database";

type WsClientData = {
    user: {
        userId: number;
        person: number | null;
    } | null;
    role: "user" | "guest";
};

function generateRandomText(length = 32) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const ws = new Elysia()
    .ws<
        {},            // Body
        {},            // Response
        {},            // Query
        WsClientData   // DATA (to co chceme typovat)
    >('/ws', {
        cookie: t.Object({
            token: t.Optional(t.String())
        }),

        async open(ws) {
            const token = ws.data.cookie.token;

            ws.data.user = null;
            ws.data.role = "guest";

            if (token?.value) {
                const auth = await db
                    .selectFrom("tokens")
                    .leftJoin("users", "users.userId", "tokens.userId")
                    .select(["tokens.userId", "users.person"])
                    .where("tokens.token", "=", token.value)
                    .where("tokens.expires", ">=", new Date())
                    .executeTakeFirst();

                if (auth) {
                    ws.data.user = auth;
                    ws.data.role = "user";
                    console.log("WS USER:", auth.userId);
                    return;
                }
            }

            console.log("WS GUEST");
        },

        async message(ws, raw) {
            let msg: any;
            console.log(raw)
            try {
                msg = raw;
            } catch {
                ws.send(JSON.stringify({ error: "invalid_json" }));
                return;
            }

            // ----------------- GUEST -----------------
            if (ws.data.role === "guest") {
                if (msg.type === "qrcode_request") {
                    // === Generate new qrcode value ===
                    let qrcode = '';
                    do {
                        qrcode = generateRandomText();
                        const qrcodeDB = await db.selectFrom('login_qrcodes')
                        .select([
                            'login_qrcodes.qrcode'
                        ])
                        .where('qrcode', '=', qrcode)
                        .executeTakeFirst();
                        if (qrcodeDB) {
                            qrcode = '';
                        }
                    } while (qrcode == '')

                    console.log(ws);

                    await db.insertInto('login_qrcodes')
                    .values({
                        qrcode,
                        socket: ws.id,
                        userAgent: ws.data.headers['user-agent']?.toString()!,
                        ip: ws.remoteAddress
                    })
                    .execute()

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

                    ws.send(JSON.stringify({
                        type: "qrcode_result",
                        payload: qrcode,
                    }));
                    return;
                }

                ws.close(4003, "guest_forbidden");
                return;
            }

            // ----------------- USER -----------------
            if (msg.type === "echo") {
                ws.send(JSON.stringify({
                    type: "echo",
                    msg: msg.data,
                    userId: ws.data.user!.userId
                }));
                return;
            }

            ws.send(JSON.stringify({ error: "unknown_request" }));
        },

        async close(ws) {
            // === Remove qrcodes on login page ===
            await db.deleteFrom('login_qrcodes')
            .where('socket', '=', ws.id)
            .execute();

            console.log("WS disconnected:", ws.data.user?.userId ?? "guest");
        }
    });
