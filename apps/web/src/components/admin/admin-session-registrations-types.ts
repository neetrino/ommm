import { userDisplayName } from "@/lib/user-display-name";

export type SessionRegistrationCancelledBy = {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  role: string;
};

export type SessionRegistrationRow = {
  id: string;
  status: string;
  createdAt: string;
  cancelledAt?: string | null;
  cancelledBy?: SessionRegistrationCancelledBy | null;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
};

export const SESSION_REGISTRATION_ACTIVE_STATUS = "BOOKED" as const;
export const SESSION_REGISTRATION_CANCELLED_STATUS = "CANCELLED" as const;

export const SESSION_REGISTRATION_OCCUPIED_STATUSES = [
  "BOOKED",
  "COMPLETED",
  "MISSED",
] as const;

export const SESSION_REGISTRATION_STAFF_CANCELLABLE_STATUSES =
  SESSION_REGISTRATION_OCCUPIED_STATUSES;

export const SESSION_REGISTRATION_ROSTER_STATUSES = [
  ...SESSION_REGISTRATION_OCCUPIED_STATUSES,
  SESSION_REGISTRATION_CANCELLED_STATUS,
] as const;

export type SessionRegistrationOccupiedStatus =
  (typeof SESSION_REGISTRATION_OCCUPIED_STATUSES)[number];

export type SessionRegistrationOutcomeStatus = Exclude<
  SessionRegistrationOccupiedStatus,
  typeof SESSION_REGISTRATION_ACTIVE_STATUS
>;

export function isActiveSessionRegistration(row: SessionRegistrationRow): boolean {
  return row.status === SESSION_REGISTRATION_ACTIVE_STATUS;
}

/** Booked, attended, or no-show — still a roster seat (not cancelled). */
export function isOccupiedSessionRegistration(row: SessionRegistrationRow): boolean {
  return SESSION_REGISTRATION_OCCUPIED_STATUSES.some((status) => status === row.status);
}

export function isStaffCancellableSessionRegistration(
  row: SessionRegistrationRow,
): boolean {
  return SESSION_REGISTRATION_STAFF_CANCELLABLE_STATUSES.some(
    (status) => status === row.status,
  );
}

export function isRosterSessionRegistration(row: SessionRegistrationRow): boolean {
  return SESSION_REGISTRATION_ROSTER_STATUSES.some((status) => status === row.status);
}

/** Occupied members first; cancelled stay visible below. */
export function compareSessionRegistrationRows(
  left: SessionRegistrationRow,
  right: SessionRegistrationRow,
): number {
  const leftCancelled = left.status === SESSION_REGISTRATION_CANCELLED_STATUS ? 1 : 0;
  const rightCancelled = right.status === SESSION_REGISTRATION_CANCELLED_STATUS ? 1 : 0;
  return leftCancelled - rightCancelled;
}

export function sessionRegistrationOutcome(
  status: string,
): SessionRegistrationOutcomeStatus | null {
  if (status === "COMPLETED" || status === "MISSED") {
    return status;
  }
  return null;
}

export function sessionCancelledByDisplayName(
  actor: SessionRegistrationCancelledBy,
): string {
  return userDisplayName(actor.name, actor.lastName, actor.email);
}

const DASHBOARD_SHELL_ROLES = [
  "USER",
  "COACH",
  "MANAGER",
  "CONTENT_ADMIN",
  "ADMIN",
] as const;

export type DashboardShellRole = (typeof DASHBOARD_SHELL_ROLES)[number];

export function isDashboardShellRole(role: string): role is DashboardShellRole {
  return DASHBOARD_SHELL_ROLES.some((value) => value === role);
}
