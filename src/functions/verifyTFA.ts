import * as OTPAuth from "otpauth";
import { db } from "../../database";
import { SecurityConfig } from "../config/security.config";

export async function verifyTFA(code: string, user_id: number, allow_backup_codes: boolean = true, check_if_enabled_2FA: boolean = true): Promise<boolean> {
    const user = await db.selectFrom("users")
    .select(["2fa_secret", "2fa"])
    .where("userId", "=", user_id)
    .executeTakeFirst()

    if (!user) return false;

    if (check_if_enabled_2FA && (!user?.["2fa"] || !user?.["2fa_secret"])) {
        return true;
    }

    const backupCodes = await db.selectFrom("users_backup_codes")
    .select(["code"])
    .where("userId", "=", user_id)
    .where("used", "=", false)
    .where("code", "=", code)
    .limit(1)
    .execute()

    let isApproved2FA = false;
    let totp = new OTPAuth.TOTP({
        issuer: "Schoolingo",
        algorithm: "SHA1",
        digits: SecurityConfig.TFA_TOKEN_LENGTH,
        secret: user["2fa_secret"]!
    });

    let delta = totp.validate({ token: code });
    if (delta !== null) {
        isApproved2FA = true;
    }

    if (!isApproved2FA && backupCodes.length && allow_backup_codes) {
        await db.updateTable("users_backup_codes")
        .set("used", true)
        .where("userId", "=", user_id)
        .where("code", "=", code)
        .limit(1)
        .execute();
        isApproved2FA = true;
    }

    return isApproved2FA;
}