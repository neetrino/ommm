/** Basic format check for sign-in / sign-up forms (not a full RFC parser). */
export function isValidEmail(value: string): boolean {
  const t = value.trim();
  return t.length >= 3 && t.includes("@") && !t.startsWith("@");
}
