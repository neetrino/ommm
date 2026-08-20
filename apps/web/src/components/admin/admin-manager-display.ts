import type { AdminManagerDirectoryRow } from "@/components/admin/admin-managers-types";
import { coachCardInitials } from "@/components/coaches/coach-card-display";

/** Full display name for a manager directory row. */
export function managerDirectoryDisplayName(
  manager: AdminManagerDirectoryRow,
): string {
  const fullName = [manager.name, manager.lastName].filter(Boolean).join(" ").trim();
  if (fullName.length > 0) {
    return fullName;
  }
  return manager.email;
}

/** Initials fallback for the manager avatar. */
export function managerDirectoryInitials(
  manager: AdminManagerDirectoryRow,
): string {
  return coachCardInitials({
    name: manager.name,
    lastName: manager.lastName,
    email: manager.email,
    avatarUrl: null,
  });
}

export type ManagerAccessKind = "blocked" | "invited" | "active";

/** Access badge for the manager list: blocked, invited, or signed in. */
export function managerAccessKind(
  manager: Pick<AdminManagerDirectoryRow, "isBlocked" | "invitePending">,
): ManagerAccessKind {
  if (manager.isBlocked) {
    return "blocked";
  }
  if (manager.invitePending) {
    return "invited";
  }
  return "active";
}
