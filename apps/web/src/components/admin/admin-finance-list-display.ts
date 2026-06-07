/** Shared finance list typography — aligned with user payments and admin booking rows. */
export const ADMIN_FINANCE_MONEY_CLASS =
  "whitespace-nowrap font-serif text-xl tabular-nums leading-none text-sage-950";

export const ADMIN_FINANCE_PRIMARY_TITLE_CLASS =
  "block w-full min-w-0 truncate font-serif text-xl leading-snug tracking-tight text-sage-950";

export const ADMIN_FINANCE_VALUE_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 truncate rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide";

const ADMIN_FINANCE_STATUS_BADGE_BASE = [
  "inline-flex w-max max-w-full shrink-0 items-center rounded-full py-1",
  "px-2 text-[11px] font-medium uppercase tracking-wide",
].join(" ");

/** Read-only payment status in finance lists. */
export const ADMIN_FINANCE_STATUS_STATIC_CLASS = [
  ADMIN_FINANCE_STATUS_BADGE_BASE,
  "justify-center",
].join(" ");

/** Interactive payment status picker in finance lists. */
export const ADMIN_FINANCE_STATUS_PICKER_CLASS = [
  ADMIN_FINANCE_STATUS_BADGE_BASE,
  "justify-center gap-1",
  "cursor-pointer transition-[box-shadow,opacity]",
  "hover:shadow-[0_4px_12px_-8px_rgba(45,40,35,0.16)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

export type FinancePaymentStatus =
  | "SUCCEEDED"
  | "FAILED"
  | "PENDING"
  | "REFUNDED"
  | string;

export type FinanceMemberPaymentBehavior = "paid" | "unpaid" | "overdue" | "partial" | string;

export type FinanceCoachPayoutStatus = "paid" | "pending" | "none";

export function financePaymentStatusTone(status: FinancePaymentStatus): string {
  if (status === "SUCCEEDED") return "bg-mint-100 text-sage-800";
  if (status === "PENDING") return "bg-amber-100 text-amber-900";
  if (status === "REFUNDED") return "bg-blue-100 text-sage-700";
  if (status === "FAILED") return "bg-peach-100 text-sand-700";
  return "bg-sage-100 text-sage-700";
}

export function financeMemberPaymentTone(behavior: FinanceMemberPaymentBehavior): string {
  if (behavior === "paid") return "bg-mint-100 text-sage-800";
  if (behavior === "overdue") return "bg-peach-100 text-sand-700";
  if (behavior === "partial") return "bg-sand-100 text-sand-700";
  if (behavior === "unpaid") return "bg-amber-100 text-amber-900";
  return "bg-sage-100 text-sage-700";
}

export function financeCoachPayoutTone(status: FinanceCoachPayoutStatus): string {
  if (status === "paid") return "bg-mint-100 text-sage-800";
  if (status === "pending") return "bg-amber-100 text-amber-900";
  return "bg-sage-100 text-sage-700";
}

export function financeSourceTone(source: string): string {
  if (source === "package") return "bg-mint-100 text-sage-800";
  if (source === "dropin") return "bg-sand-100 text-sand-700";
  if (source === "gift") return "bg-blue-100 text-sage-700";
  return "bg-white/70 text-sage-600";
}
