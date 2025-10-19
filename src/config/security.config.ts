import z from "zod";

namespace SConfig {
    // === TFA ===
    const TFA_TOKEN_LENGTH = z.number().default(6);

    // === TFA: Backup codes ===
    const TFA_BACKUP_CODES_COUNT = z.number().default(6);

    // === PASSWORD ===
    const PASSWORD_MIN_LENGTH = z.number().default(8);
    const PASSWORD_MAX_LENGTH = z.number().default(64);
    const PASSWORD_REQUIRE_CAPITAL_LETTER = z.boolean().default(true);
    const PASSWORD_REQUIRE_LOWERCASE_LETTER = z.boolean().default(false);
    const PASSWORD_REQUIRE_NUMBER = z.boolean().default(false);
    const PASSWORD_REQUIRE_SPECIAL_CHARACTER = z.boolean().default(false);
    const RESET_PASSWORD_EXPIRES_MINUTES = z.number().default(15);
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
    RESET_PASSWORD_EXPIRES_MINUTES: z.number().default(15)
})

export const SecurityConfig = envSchema.parse(SConfig);