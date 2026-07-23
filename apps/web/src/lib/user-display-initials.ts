/**
 * Initials for avatars when no profile photo is set (given name + family name).
 */
export function userDisplayInitials(
  name: string | null | undefined,
  lastName: string | null | undefined,
  email?: string | null,
): string {
  const given = name?.trim() ?? "";
  const family = lastName?.trim() ?? "";

  if (given.length > 0 && family.length > 0) {
    return `${given.charAt(0)}${family.charAt(0)}`.toUpperCase();
  }

  const combined = `${given} ${family}`.trim();
  if (combined.length > 0) {
    const parts = combined.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
    }
    return parts[0]!.charAt(0).toUpperCase();
  }

  const mail = email?.trim();
  if (mail && mail.length > 0) {
    return mail.charAt(0).toUpperCase();
  }

  return "?";
}
