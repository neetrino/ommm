/** Mirrors API registration rules (min/max length). */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function isPasswordPolicyMet(password: string): boolean {
  const t = password.trim();
  return t.length >= PASSWORD_MIN_LENGTH && t.length <= PASSWORD_MAX_LENGTH;
}
