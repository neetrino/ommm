import type { CouponDisplayStatus } from "@/components/admin/admin-coupons-types";
import { formatAmdFromCents } from "@/lib/price-amd";

export const COUPON_STATUS_BADGE_CLASS =
  "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide";

const STATUS_TONE: Record<CouponDisplayStatus, string> = {
  DRAFT: "bg-sand-100 text-sage-700",
  ACTIVE: "bg-mint-100 text-sage-800",
  EXPIRED: "bg-sand-200 text-sage-600",
  DISABLED: "bg-red-50 text-red-800",
  USAGE_LIMIT_REACHED: "bg-peach-100 text-sand-800",
};

export function couponStatusTone(status: CouponDisplayStatus): string {
  return STATUS_TONE[status];
}

export function couponPersonLabel(person: {
  name: string | null;
  lastName: string | null;
  email: string;
}): string {
  const name = [person.name, person.lastName].filter(Boolean).join(" ");
  return name.length > 0 ? name : person.email;
}

export function couponValueLabel(
  discountType: "PERCENTAGE" | "FIXED_AMOUNT",
  discountValue: number,
  locale: string,
): string {
  if (discountType === "PERCENTAGE") {
    return `${discountValue}%`;
  }
  return formatAmdFromCents(discountValue, locale);
}
