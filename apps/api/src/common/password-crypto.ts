import * as argon2 from "argon2";
import bcrypt from "bcryptjs";

/** OWASP-recommended cost factor for bcrypt (balance CPU vs security). */
export const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hashes a password with bcrypt before persistence.
 * Never store or log the plain password.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a password against a stored hash.
 * Supports legacy argon2id hashes until all accounts are re-hashed on next password change/login migration.
 */
export async function verifyPassword(
  storedHash: string,
  plain: string,
): Promise<boolean> {
  if (storedHash.startsWith("$argon2")) {
    return argon2.verify(storedHash, plain);
  }
  return bcrypt.compare(plain, storedHash);
}
