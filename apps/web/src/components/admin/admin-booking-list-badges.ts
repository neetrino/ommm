/** Read-only payment / attendance chips — soft fill, no border. */
export const ADMIN_BOOKING_VALUE_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 truncate rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide";

const ADMIN_BOOKING_STATUS_BADGE_BASE = [
  "inline-flex w-max max-w-full shrink-0 items-center rounded-full py-1",
  "px-2 text-[11px] font-medium uppercase tracking-wide",
].join(" ");

/** Read-only booking status (waitlist). */
export const ADMIN_BOOKING_STATUS_STATIC_CLASS = [
  ADMIN_BOOKING_STATUS_BADGE_BASE,
  "justify-center",
].join(" ");

/** Interactive booking status — light fill + chevron, width follows label. */
export const ADMIN_BOOKING_STATUS_PICKER_CLASS = [
  ADMIN_BOOKING_STATUS_BADGE_BASE,
  "justify-center gap-1",
  "cursor-pointer transition-[box-shadow,opacity]",
  "hover:shadow-[0_4px_12px_-8px_rgba(45,40,35,0.16)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

export type AdminBookingPaymentStatus = "PAID" | "CASH" | "UNPAID" | "REFUNDED";

export type AdminBookingAttendanceStatus =
  | "ATTENDED"
  | "NOT_ATTENDED"
  | "NO_SHOW"
  | "LATE_CANCEL"
  | null;

export type AdminBookingListStatus =
  | "BOOKED"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED"
  | "WAITLISTED";

export function paymentValueBadgeTone(value: AdminBookingPaymentStatus): string {
  if (value === "PAID") return "bg-mint-100 text-sage-800";
  if (value === "CASH") return "bg-sand-100 text-sand-700";
  if (value === "REFUNDED") return "bg-blue-100 text-sage-700";
  return "bg-peach-100 text-sand-700";
}

export function attendanceValueBadgeTone(value: AdminBookingAttendanceStatus): string {
  if (value === "ATTENDED") return "bg-mint-100 text-sage-800";
  if (value === "NO_SHOW") return "bg-peach-100 text-sand-700";
  if (value === "LATE_CANCEL") return "bg-sand-100 text-sand-700";
  return "bg-white/70 text-sage-500";
}

/** Light fill tones for booking status (picker + read-only). */
export function bookingStatusTone(status: AdminBookingListStatus): string {
  if (status === "BOOKED") return "bg-mint-100 text-sage-800";
  if (status === "COMPLETED") return "bg-blue-100 text-sage-800";
  if (status === "CANCELLED") return "bg-sand-100 text-sage-600";
  if (status === "WAITLISTED") return "bg-white/70 text-sage-500";
  return "bg-peach-100 text-sand-700";
}
