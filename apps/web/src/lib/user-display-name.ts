/** Full display name for headers and greetings (name + surname, else email). */
export function userDisplayName(
  name: string | null,
  lastName: string | null,
  email: string,
): string {
  const full = [name?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  if (full.length > 0) {
    return full;
  }
  return email.trim();
}
