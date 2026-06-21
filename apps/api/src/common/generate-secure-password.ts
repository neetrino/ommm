import { randomBytes } from 'node:crypto';

const PASSWORD_ALPHABET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';

/** Default length for admin-provisioned temporary passwords. */
export const SECURE_PASSWORD_LENGTH = 14;

/** Generates a cryptographically random password for one-time admin handover. */
export function generateSecurePassword(
  length = SECURE_PASSWORD_LENGTH,
): string {
  const bytes = randomBytes(length);
  let password = '';
  for (let index = 0; index < length; index += 1) {
    password += PASSWORD_ALPHABET[bytes[index] % PASSWORD_ALPHABET.length];
  }
  return password;
}
