/**
 * Path helpers for authenticated member (`USER`) routes (aligned with web `/user/*`).
 */
export function userMemberPath(segment: string): string {
  const clean = segment.replace(/^\/+/, "");
  return `/user/${clean}`;
}

/**
 * Path helpers for authenticated coach routes (aligned with web `/coach/*`).
 */
export function coachPath(segment: string): string {
  const clean = segment.replace(/^\/+/, "");
  return `/coach/${clean}`;
}
