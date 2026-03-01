import z from "zod";

namespace SConfig {
    // === TFA ===
    const TFA_TOKEN_LENGTH = 6;

    // === TFA: Backup codes ===
    const TFA_BACKUP_CODES_COUNT = 6;

    // === PASSWORD ===
    const PASSWORD_MIN_LENGTH = 8
    const PASSWORD_MAX_LENGTH = 64;
    const PASSWORD_REQUIRE_CAPITAL_LETTER = true;
    const PASSWORD_REQUIRE_LOWERCASE_LETTER = false;
    const PASSWORD_REQUIRE_NUMBER = false;
    const PASSWORD_REQUIRE_SPECIAL_CHARACTER = false;
    const RESET_PASSWORD_EXPIRES_MINUTES = 15;
    const TOKEN_SHORT_EXPIRE_MNUTES = 15

    // === LOGIN RATE LIMIT ===
    const LOGIN_MAX_ATTEMPTS = 5;
    const LOGIN_LOCKOUT_MINUTES = 15;
    const IP_RATE_LIMIT_MAX_ATTEMPTS = 20;
    const IP_RATE_LIMIT_MINUTES = 60;
}

const envSchema = z.object({
    TFA_TOKEN_LENGTH: z.number().default(6),
    TFA_BACKUP_CODES_COUNT: z.number().default(6),
    PASSWORD_MIN_LENGTH: z.number().default(8),
    PASSWORD_MAX_LENGTH: z.number().default(64),
    PASSWORD_REQUIRE_CAPITAL_LETTER: z.boolean().default(true),
    PASSWORD_REQUIRE_LOWERCASE_LETTER: z.boolean().default(false),
    PASSWORD_REQUIRE_NUMBER: z.boolean().default(false),
    PASSWORD_REQUIRE_SPECIAL_CHARACTER: z.boolean().default(false),
    RESET_PASSWORD_EXPIRES_MINUTES: z.number().default(15),
    TOKEN_SHORT_EXPIRE_MNUTES: z.number().default(15),
    LOGIN_MAX_ATTEMPTS: z.number().default(5),
    LOGIN_LOCKOUT_MINUTES: z.number().default(15),
    IP_RATE_LIMIT_MAX_ATTEMPTS: z.number().default(20),
    IP_RATE_LIMIT_MINUTES: z.number().default(60)
})

export const SecurityConfig = envSchema.parse(SConfig);