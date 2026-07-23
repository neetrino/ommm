/** Read-only payment / attendance chips — soft fill, no border. */
export const ADMIN_BOOKING_VALUE_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 truncate rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide";

const ADMIN_BOOKING_STATUS_BADGE_BASE = [
  "inline-flex w-max max-w-full shrink-0 items-center rounded-full py-1",
  "px-2 text-[11px] font-medium uppercase tracking-wide",
].join(" ");

const ADMIN_BOOKING_STATUS_BOOKED_DEFAULT_TONE = "bg-mint-100 text-sage-800";
const ADMIN_BOOKING_STATUS_BOOKED_CASH_TONE = "bg-blue-100 text-sage-800";

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

export const ADMIN_BOOKING_PAYMENT_FILTER_VALUES = [
  "PAID",
  "CASH",
  "UNPAID",
  "CANCELLED",
] as const;

export type AdminBookingPaymentStatus = (typeof ADMIN_BOOKING_PAYMENT_FILTER_VALUES)[number];

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

export type AdminBookingStatusBadgePaymentMethod = "CARD" | "CASH";

export function normalizeBookingStatusBadgePaymentMethod(
  value: string | null | undefined,
): AdminBookingStatusBadgePaymentMethod | null {
  if (value === "CARD" || value === "CASH") {
    return value;
  }
  return null;
}

export function paymentValueBadgeTone(value: AdminBookingPaymentStatus): string {
  if (value === "PAID") return "bg-mint-100 text-sage-800";
  if (value === "CASH") return "bg-sand-100 text-sand-700";
  if (value === "CANCELLED") return "bg-sand-100 text-sage-600";
  return "bg-peach-100 text-sand-700";
}

export function adminBookingPaymentLabel(
  t: (key: string) => string,
  value: AdminBookingPaymentStatus,
): string {
  if (value === "PAID") return t("paymentPaid");
  if (value === "CASH") return t("paymentCash");
  if (value === "CANCELLED") return t("paymentCancelled");
  return t("paymentUnpaid");
}

export function attendanceValueBadgeTone(value: AdminBookingAttendanceStatus): string {
  if (value === "ATTENDED") return "bg-mint-100 text-sage-800";
  if (value === "NO_SHOW") return "bg-peach-100 text-sand-700";
  if (value === "LATE_CANCEL") return "bg-sand-100 text-sand-700";
  return "bg-white/70 text-sage-500";
}

/** Light fill tones for booking status (picker + read-only). */
export function bookingStatusTone(
  status: AdminBookingListStatus,
  paymentMethod?: AdminBookingStatusBadgePaymentMethod | null,
): string {
  if (status === "BOOKED") {
    if (paymentMethod === "CASH") {
      return ADMIN_BOOKING_STATUS_BOOKED_CASH_TONE;
    }
    return ADMIN_BOOKING_STATUS_BOOKED_DEFAULT_TONE;
  }
  if (status === "COMPLETED") return "bg-blue-100 text-sage-800";
  if (status === "CANCELLED") return "bg-sand-100 text-sage-600";
  if (status === "WAITLISTED") return "bg-white/70 text-sage-500";
  return "bg-peach-100 text-sand-700";
}
