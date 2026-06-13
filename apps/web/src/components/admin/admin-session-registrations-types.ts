export type SessionRegistrationRow = {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
};

export const SESSION_REGISTRATION_ACTIVE_STATUS = "BOOKED" as const;

export function isActiveSessionRegistration(row: SessionRegistrationRow): boolean {
  return row.status === SESSION_REGISTRATION_ACTIVE_STATUS;
}
