import type { AuthUserSummary } from "../lib/api/authClient";

/**
 * Line shown after “Welcome back,” — full `name` from profile when set, else email local-part.
 */
export function sessionGreetingDisplayName(user: AuthUserSummary): string {
  const trimmed = user.name?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  const local = user.email.split("@")[0]?.trim() ?? "";
  if (local.length > 0) {
    return local;
  }
  return "Member";
}
