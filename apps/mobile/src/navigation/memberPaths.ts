/**
 * Path helpers for authenticated member (`USER`) routes (aligned with web `/user/*`).
 */
export function userMemberPath(segment: string): string {
  const clean = segment.replace(/^\/+/, "");
  return `/user/${clean}`;
}
