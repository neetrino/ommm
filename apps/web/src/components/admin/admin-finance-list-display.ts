/** Shared finance list typography — aligned with user payments and admin booking rows. */
export const ADMIN_FINANCE_MONEY_CLASS =
  "whitespace-nowrap font-serif text-xl tabular-nums leading-none text-sage-950";

export const ADMIN_FINANCE_PRIMARY_TITLE_CLASS =
  "block w-full min-w-0 truncate font-serif text-xl leading-snug tracking-tight text-sage-950";

export const ADMIN_FINANCE_VALUE_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 truncate rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide";

export type FinancePickerAppearance = "compact" | "card";

const ADMIN_FINANCE_STATUS_BADGE_BASE = [
  "inline-flex w-max max-w-full shrink-0 items-center rounded-full border py-1",
  "px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
].join(" ");

const ADMIN_FINANCE_CARD_BADGE_BASE = [
  "inline-flex w-max max-w-full shrink-0 items-center rounded-full border",
  "px-3.5 py-1.5 text-sm font-semibold tracking-tight",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_20px_-16px_rgba(45,40,35,0.22)]",
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

const ADMIN_FINANCE_CARD_STATIC_CLASS = [
  ADMIN_FINANCE_CARD_BADGE_BASE,
  "justify-center gap-1.5",
].join(" ");

const ADMIN_FINANCE_CARD_PICKER_CLASS = [
  ADMIN_FINANCE_CARD_BADGE_BASE,
  "justify-center gap-1.5",
  "cursor-pointer transition-[box-shadow,transform]",
  "hover:-translate-y-px hover:shadow-[0_12px_24px_-16px_rgba(45,40,35,0.28)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

export function financePickerClass(
  appearance: FinancePickerAppearance,
  interactive: boolean,
): string {
  if (appearance === "card") {
    return interactive
      ? ADMIN_FINANCE_CARD_PICKER_CLASS
      : ADMIN_FINANCE_CARD_STATIC_CLASS;
  }
  return interactive
    ? ADMIN_FINANCE_STATUS_PICKER_CLASS
    : ADMIN_FINANCE_STATUS_STATIC_CLASS;
}

export type FinancePaymentStatus =
  | "SUCCEEDED"
  | "FAILED"
  | "PENDING"
  | "REFUNDED"
  | string;

export type FinanceMemberPaymentBehavior = "paid" | "unpaid" | "overdue" | "partial" | string;

export type FinanceCoachPayoutStatus = "paid" | "pending" | "none";

export function financePaymentStatusTone(status: FinancePaymentStatus): string {
  if (status === "SUCCEEDED") return "border-mint-200/90 bg-mint-50 text-sage-800";
  if (status === "PENDING") return "border-amber-200/90 bg-amber-50 text-amber-950";
  if (status === "REFUNDED") return "border-blue-200/80 bg-blue-50 text-sage-800";
  if (status === "FAILED") return "border-sand-100 bg-peach-100 text-sand-800";
  return "border-sage-200/80 bg-sage-50 text-sage-700";
}

export function financePaymentMethodTone(method: string | null): string {
  if (method === "CASH") return "border-sage-200/90 bg-white/90 text-sage-800";
  if (method === "CARD_TERMINAL") return "border-sand-200 bg-sand-50 text-sage-800";
  if (method === "CARD") return "border-blue-200/80 bg-blue-50/90 text-sage-800";
  if (method === "INFLUENCER") return "border-mint-200/80 bg-mint-50 text-sage-800";
  return "border-sage-200/80 bg-white/80 text-sage-700";
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
