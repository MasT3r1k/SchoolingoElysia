export namespace SecurityConfig {
    // === TFA ===
    export const TFA_TOKEN_LENGTH = 6;

    // === PASSWORD ===
    export const PASSWORD_MIN_LENGTH = 8;
    export const PASSWORD_MAX_LENGTH = 64;
    export const PASSWORD_REQUIRE_CAPITAL_LETTER = true;
    export const PASSWORD_REQUIRE_LOWERCASE_LETTER = false;
    export const PASSWORD_REQUIRE_NUMBER = false;
    export const PASSWORD_REQUIRE_SPECIAL_CHARACTER = false;
    export const RESET_PASSWORD_EXPIRES_MINUTES = 15;
}