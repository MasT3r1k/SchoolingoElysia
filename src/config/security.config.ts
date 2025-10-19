import z from "zod";

export namespace SecurityConfig {
    // === TFA ===
    export const TFA_TOKEN_LENGTH = z.number().default(6);

    // === TFA: Backup codes ===
    export const TFA_BACKUP_CODES_COUNT = z.number().default(6);

    // === PASSWORD ===
    export const PASSWORD_MIN_LENGTH = z.number().default(8);
    export const PASSWORD_MAX_LENGTH = z.number().default(64);
    export const PASSWORD_REQUIRE_CAPITAL_LETTER = z.boolean().default(true);
    export const PASSWORD_REQUIRE_LOWERCASE_LETTER = z.boolean().default(false);
    export const PASSWORD_REQUIRE_NUMBER = z.boolean().default(false);
    export const PASSWORD_REQUIRE_SPECIAL_CHARACTER = z.boolean().default(false);
    export const RESET_PASSWORD_EXPIRES_MINUTES = z.number().default(15);
}