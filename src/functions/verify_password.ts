import { SecurityConfig } from "../config/security.config";

export function verify_password(password: string): boolean {
    if (password.length < SecurityConfig.PASSWORD_MIN_LENGTH) return false;
    if (password.length > SecurityConfig.PASSWORD_MAX_LENGTH) return false;

    // Musí obsahovat alespoň jedno malé písmeno
    if (SecurityConfig.PASSWORD_REQUIRE_LOWERCASE_LETTER && !/[a-z]/.test(password)) return false;

    // Musí obsahovat alespoň jedno velké písmeno
    if (SecurityConfig.PASSWORD_REQUIRE_CAPITAL_LETTER && !/[A-Z]/.test(password)) return false;

    // Musí obsahovat alespoň jedno číslo
    if (SecurityConfig.PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(password)) return false;

    // Musí obsahovat alespoň jeden speciální znak
    if (SecurityConfig.PASSWORD_REQUIRE_SPECIAL_CHARACTER && !/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~]/.test(password)) return false;

    // Nesmí obsahovat mezery
    if (/\s/.test(password)) return false;

    return true;
}