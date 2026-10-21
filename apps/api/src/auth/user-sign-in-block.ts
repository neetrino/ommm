/** Archived and blocked accounts cannot sign in or keep a session. */
export function isSignInBlocked(user: {
  isBlocked: boolean;
  deletedAt?: Date | null;
}): boolean {
  return user.isBlocked || user.deletedAt != null;
}
