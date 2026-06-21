const PASSWORD_ALPHABET =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";

export const SECURE_PASSWORD_LENGTH = 14;

/** Generates a client-side preview password; server may regenerate when auto-generate is enabled. */
export function generateSecurePassword(
  length = SECURE_PASSWORD_LENGTH,
): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let password = "";
  for (let index = 0; index < length; index += 1) {
    password += PASSWORD_ALPHABET[bytes[index] % PASSWORD_ALPHABET.length];
  }
  return password;
}
