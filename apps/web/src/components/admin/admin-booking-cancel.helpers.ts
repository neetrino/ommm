export const ADMIN_CANCELLABLE_BOOKING_STATUSES = [
  "BOOKED",
  "COMPLETED",
  "MISSED",
] as const;

export type AdminCancellableBookingStatus =
  (typeof ADMIN_CANCELLABLE_BOOKING_STATUSES)[number];

export function isAdminCancellableBookingStatus(
  status: string,
): status is AdminCancellableBookingStatus {
  return ADMIN_CANCELLABLE_BOOKING_STATUSES.some((value) => value === status);
}

export function isPastAdminCancelBookingStatus(status: string): boolean {
  return status === "COMPLETED" || status === "MISSED";
}
