import crypto from "crypto";
import { db } from "../../database";
import { SecurityConfig } from "../config/security.config";

const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Bez O, I, L, 0, 1

function randomCodePart(): string {
    let s = "";
    for (let i = 0; i < 5; i++) {
        const idx = crypto.randomInt(0, CHARSET.length);
        s += CHARSET[idx];
    }
    return s;
}

function generateCode(): string {
    return `${randomCodePart()}-${randomCodePart()}`;
}


export async function generateNewBackupCodes(user_id: number): Promise<string[]> {
    // Ověř, že má uživatel aktivní 2FA
    const user = await db
        .selectFrom("users")
        .select(["2fa"])
        .where("userId", "=", user_id)
        .executeTakeFirst();

    if (!user || !user["2fa"]) return [];

    // Odstraň staré kódy
    await db
        .deleteFrom("users_backup_codes")
        .where("userId", "=", user_id)
        .execute();

    // Vytvoření nových backup kódů
    const codes: string[] = [];
    const now = new Date();

    for (let i = 0; i < SecurityConfig.TFA_BACKUP_CODES_COUNT; i++) {
        codes.push(generateCode());
    }

    const values = codes.map(code => ({
        userId: user_id,
        code,
        used: false,
        used_at: null,
        used_ip: null,
        created_at: now
    }));

    await db.insertInto("users_backup_codes").values(values).execute();
    return codes;
}
