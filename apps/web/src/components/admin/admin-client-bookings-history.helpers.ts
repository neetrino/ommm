import { isAdminCancellableBookingStatus } from "@/components/admin/admin-booking-cancel.helpers";
import {
  isDashboardShellRole,
  sessionCancelledByDisplayName,
  type DashboardShellRole,
  type SessionRegistrationCancelledBy,
} from "@/components/admin/admin-session-registrations-types";
import type { ClientSheetBookingItem } from "@/components/admin/admin-clients-types";

const BOOKING_CANCEL_STAFF_ROLES = [
  "COACH",
  "MANAGER",
  "CONTENT_ADMIN",
  "ADMIN",
] as const;

export type BookingHistoryCancelledBy = SessionRegistrationCancelledBy;

export type BookingHistoryCancelActorKind = "client" | "staff";

export function canCancelHistoryBooking(
  booking: Pick<ClientSheetBookingItem, "cancelledAt" | "status">,
): boolean {
  if (booking.cancelledAt != null) {
    return false;
  }
  return isAdminCancellableBookingStatus(booking.status);
}

export function isBookingStaffRole(role: string): boolean {
  return BOOKING_CANCEL_STAFF_ROLES.some((value) => value === role);
}

export type BookingActorCopy = {
  client: string;
  staff: (input: { name: string; role: string }) => string;
  roleLabel: (role: DashboardShellRole) => string;
};

export type BookingBookedByCopy = BookingActorCopy & {
  /** Admin bookings show the role only, without the person's name. */
  roleOnly: (input: { role: string }) => string;
};

function bookingActorRoleLabel(
  actor: BookingHistoryCancelledBy,
  copy: BookingActorCopy,
): string {
  return isDashboardShellRole(actor.role)
    ? copy.roleLabel(actor.role)
    : actor.role;
}

function bookingActorStaffText(
  actor: BookingHistoryCancelledBy,
  copy: BookingActorCopy,
): string {
  return copy.staff({
    name: sessionCancelledByDisplayName(actor),
    role: bookingActorRoleLabel(actor, copy),
  });
}

function bookingBookedByStaffText(
  actor: BookingHistoryCancelledBy,
  copy: BookingBookedByCopy,
): string {
  const role = bookingActorRoleLabel(actor, copy);
  if (actor.role === "ADMIN") {
    return copy.roleOnly({ role });
  }
  return copy.staff({
    name: sessionCancelledByDisplayName(actor),
    role,
  });
}

/**
 * Who cancelled: staff actor when recorded, otherwise the client
 * (self-cancel or older rows without cancelledBy).
 */
export function bookingHistoryCancelActorKind(
  cancelledAt: string | null | undefined,
  cancelledBy: BookingHistoryCancelledBy | null | undefined,
): BookingHistoryCancelActorKind | null {
  if (cancelledAt == null) {
    return null;
  }
  if (cancelledBy != null && isBookingStaffRole(cancelledBy.role)) {
    return "staff";
  }
  return "client";
}

export function bookingHistoryCancelledByText(
  cancelledAt: string | null | undefined,
  cancelledBy: BookingHistoryCancelledBy | null | undefined,
  copy: BookingActorCopy,
): string | null {
  const kind = bookingHistoryCancelActorKind(cancelledAt, cancelledBy);
  if (kind === "client") {
    return copy.client;
  }
  if (kind !== "staff" || cancelledBy == null) {
    return null;
  }
  return bookingActorStaffText(cancelledBy, copy);
}

export type BookingBookedByMark = {
  kind: BookingHistoryCancelActorKind;
  label: string;
};

/** Null when the creator was not recorded (bookings from before this field). */
export function bookingHistoryBookedByMark(
  createdBy: BookingHistoryCancelledBy | null | undefined,
  copy: BookingBookedByCopy,
): BookingBookedByMark | null {
  if (createdBy == null) {
    return null;
  }
  if (!isBookingStaffRole(createdBy.role)) {
    return { kind: "client", label: copy.client };
  }
  return { kind: "staff", label: bookingBookedByStaffText(createdBy, copy) };
}

/** Null when the creator was not recorded (bookings from before this field). */
export function bookingHistoryBookedByText(
  createdBy: BookingHistoryCancelledBy | null | undefined,
  copy: BookingBookedByCopy,
): string | null {
  return bookingHistoryBookedByMark(createdBy, copy)?.label ?? null;
}
