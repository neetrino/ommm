export type CoachCardUser = {
  name: string | null;
  lastName?: string | null;
  email: string;
  avatarUrl: string | null;
};

export type CoachCardData = {
  id: string;
  bio: string | null;
  specialization: string | null;
  experienceYears: number | null;
  user: CoachCardUser;
};

/** Full display name for coach cards (admin + marketing). */
export function coachCardDisplayName(user: CoachCardUser): string {
  const fullName = [user.name, user.lastName].filter(Boolean).join(" ").trim();
  if (fullName.length > 0) {
    return fullName;
  }
  return user.name?.trim() || user.email;
}

/** Initials fallback when no avatar is available. */
export function coachCardInitials(user: CoachCardUser): string {
  const displayName = coachCardDisplayName(user);
  if (displayName !== user.email) {
    const parts = displayName.split(/\s+/).filter(Boolean);
    const firstInitial = parts[0]?.[0] ?? "";
    const secondInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    const compactInitials = `${firstInitial}${secondInitial}`.toUpperCase();
    if (compactInitials !== "") {
      return compactInitials;
    }
  }
  return user.email[0]?.toUpperCase() ?? "?";
}
