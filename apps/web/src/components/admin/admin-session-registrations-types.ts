export type SessionRegistrationRow = {
  id: string;
  status: string;
  createdAt: string;
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

export const SESSION_REGISTRATION_OCCUPIED_STATUSES = [
  "BOOKED",
  "COMPLETED",
  "MISSED",
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

export function sessionRegistrationOutcome(
  status: string,
): SessionRegistrationOutcomeStatus | null {
  if (status === "COMPLETED" || status === "MISSED") {
    return status;
  }
  return null;
}
