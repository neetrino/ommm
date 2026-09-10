import { isAdminCancellableBookingStatus } from "@/components/admin/admin-booking-cancel.helpers";
import type { ClientSheetBookingItem } from "@/components/admin/admin-clients-types";

const BOOKING_CANCEL_STAFF_ROLES = [
  "COACH",
  "MANAGER",
  "CONTENT_ADMIN",
  "ADMIN",
] as const;

export type BookingHistoryCancelledBy = {
  name: string | null;
  lastName: string | null;
  email: string;
  role: string;
};

export type BookingHistoryCancelActorKind = "client" | "staff";

export function canCancelHistoryBooking(
  booking: Pick<ClientSheetBookingItem, "cancelledAt" | "status">,
): boolean {
  if (booking.cancelledAt != null) {
    return false;
  }
  return isAdminCancellableBookingStatus(booking.status);
}

export function isBookingCancelStaffRole(role: string): boolean {
  return BOOKING_CANCEL_STAFF_ROLES.some((value) => value === role);
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
  if (cancelledBy != null && isBookingCancelStaffRole(cancelledBy.role)) {
    return "staff";
  }
  return "client";
}
