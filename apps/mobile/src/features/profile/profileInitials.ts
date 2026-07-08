type ProfileInitialsInput = {
  name: string | null;
  lastName: string | null;
  email: string;
};

/** First letters of name and surname; falls back to email when names are missing. */
export function buildProfileInitials(input: ProfileInitialsInput): string {
  const first = input.name?.trim() ?? "";
  const last = input.lastName?.trim() ?? "";

  if (first.length > 0 && last.length > 0) {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
  }

  const combined = `${first} ${last}`.trim();
  const parts = combined.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  const one = parts[0]?.[0] ?? input.email[0] ?? "M";
  return one.toUpperCase();
}
