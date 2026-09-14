export const USER_BOOKING_STATUS_BADGE_CLASS =
  "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide";

/** Pill colors for a member booking status. */
export function userBookingStatusClassName(status: string): string {
  if (status === "BOOKED") {
    return "bg-mint-100 text-mint-900";
  }
  if (status === "CANCELLED") {
    return "bg-red-100 text-red-800";
  }
  if (status === "COMPLETED") {
    return "bg-sky-100 text-sky-900";
  }
  if (status === "NO_SHOW" || status === "MISSED") {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-sage-100 text-sage-700";
}
