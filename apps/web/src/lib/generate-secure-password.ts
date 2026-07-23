const PASSWORD_ALPHABET =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";

export const SECURE_PASSWORD_LENGTH = 14;

/** Returns an unbiased index in `[0, alphabetLength)` using rejection sampling. */
function randomAlphabetIndex(alphabetLength: number): number {
  const limit = 256 - (256 % alphabetLength);
  let value: number;
  do {
    const bytes = new Uint8Array(1);
    crypto.getRandomValues(bytes);
    value = bytes[0];
  } while (value >= limit);
  return value % alphabetLength;
}

/** Generates a client-side preview password; server may regenerate when auto-generate is enabled. */
export function generateSecurePassword(
  length = SECURE_PASSWORD_LENGTH,
): string {
  let password = "";
  for (let index = 0; index < length; index += 1) {
    password += PASSWORD_ALPHABET[randomAlphabetIndex(PASSWORD_ALPHABET.length)];
  }
  return password;
}
