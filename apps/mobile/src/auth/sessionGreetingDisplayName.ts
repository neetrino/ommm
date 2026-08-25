import type { AuthUserSummary } from "../lib/api/authClient";

function emailLocalPartOrMember(user: AuthUserSummary): string {
  const local = user.email.split("@")[0]?.trim() ?? "";
  if (local.length > 0) {
    return local;
  }
  return "Member";
}

/**
 * Line shown after “Welcome back,” — first `name` from profile when set, else email local-part.
 */
export function sessionGreetingDisplayName(user: AuthUserSummary): string {
  const trimmed = user.name?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  return emailLocalPartOrMember(user);
}

/** Account hub header — `name` + `lastName` when set, else same fallback as greeting. */
export function sessionFullDisplayName(user: AuthUserSummary): string {
  const parts = [user.name?.trim(), user.lastName?.trim()].filter(
    (part): part is string => part !== undefined && part.length > 0,
  );
  if (parts.length > 0) {
    return parts.join(" ");
  }
  return emailLocalPartOrMember(user);
}
