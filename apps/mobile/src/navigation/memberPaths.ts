/**
 * Path helpers for authenticated member (`USER`) routes (aligned with web `/user/*`).
 */
export function userMemberPath(segment: string): string {
  const clean = segment.replace(/^\/+/, "");
  return `/user/${clean}`;
}

/**
 * Signed-out tab placeholders at `(main)/classes`, `(main)/plans`, etc.
 * Do not use `/user/*` here — those routes require `Role.USER`.
 */
export const guestPublicTabPath = {
  classes: "/classes",
  plans: "/plans",
  schedule: "/schedule",
} as const;
