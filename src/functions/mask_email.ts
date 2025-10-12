/**
 * maskEmail(email, options)
 * - Shows the first character of the local part and the last one only if local part length >= 3
 * - Removes the +tag (if option stripPlus = true)
 * - Keeps the TLD and shows the first character of the SLD, replacing the rest with fixedStarsCount asterisks
 */

export interface MaskEmailOptions {
  fixedStarsCount?: number;     // number of asterisks to use in the local part (default: 3)
  stripPlus?: boolean;          // remove +tag from the email (default: true)
  domainStarsCount?: number;    // number of asterisks to use for domain masking (default: 3)
}

export function maskEmail(email: string, options: MaskEmailOptions = {}): string {
  const {
    fixedStarsCount = 3,
    stripPlus = true,
    domainStarsCount = 3,
  } = options;

  if (!email || typeof email !== "string") return email;
  const trimmed = email.trim();
  const atPos = trimmed.indexOf("@");
  if (atPos === -1) return trimmed; // invalid email, return as-is

  let local = trimmed.slice(0, atPos);
  let domain = trimmed.slice(atPos + 1);

  // remove +tag (e.g. "user+newsletter@gmail.com" → "user")
  if (stripPlus) {
    const plusIndex = local.indexOf("+");
    if (plusIndex !== -1) local = local.slice(0, plusIndex);
  }

  // --- mask local part ---
  const localLength = local.length;
  let maskedLocal: string;

  if (localLength === 0) {
    maskedLocal = "";
  } else if (localLength <= 2) {
    // short local part: show first character + asterisks
    maskedLocal = `${local[0]}${"*".repeat(fixedStarsCount)}`;
  } else {
    // longer local part: first char + fixed number of asterisks + last char
    maskedLocal = `${local[0]}${"*".repeat(fixedStarsCount)}${local[localLength - 1]}`;
  }

  // --- mask domain ---
  const domainParts = domain.split(".");
  if (domainParts.length === 0) {
    return `${maskedLocal}@${"*".repeat(domainStarsCount)}`;
  }

  const tld = domainParts.pop()!; // last part (.com, .cz, etc.)
  const sld = domainParts.pop() ?? ""; // second-level domain (gmail, seznam)
  const maskedSld = sld
    ? `${sld[0]}${"*".repeat(domainStarsCount)}`
    : "";

  // handle subdomains (e.g. mail.sub.example.com)
  const maskedSubs = domainParts.map(() => "*".repeat(3));

  const maskedDomainParts = [...maskedSubs, maskedSld, tld].filter(Boolean);
  const maskedDomain = maskedDomainParts.join(".");

  return `${maskedLocal}@${maskedDomain}`;
}
