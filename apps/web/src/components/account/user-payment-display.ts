import { isManualPaymentMethod } from "@/lib/manual-payment-method";
import type { UserPaymentRow } from "@/lib/user-package-types";

export type UserPaymentSource = "package" | "dropin" | "gift" | "membership" | "other";

export function statusBadgeClass(status: string): string {
  if (status === "SUCCEEDED") return "bg-mint-100 text-mint-900";
  if (status === "PENDING") return "bg-amber-100 text-amber-900";
  if (status === "REFUNDED") return "bg-sky-100 text-sky-900";
  if (status === "FAILED") return "bg-rose-100 text-rose-900";
  return "bg-sage-100 text-sage-700";
}

export function normalizePaymentSource(description: string | null): UserPaymentSource {
  const normalized = (description ?? "").toLowerCase();
  if (normalized.startsWith("membership")) return "membership";
  if (normalized.startsWith("package")) return "package";
  if (normalized.startsWith("drop-in")) return "dropin";
  if (normalized.startsWith("gift")) return "gift";
  return "other";
}

export function resolveRelatedItemName(description: string | null): string | null {
  if (!description) {
    return null;
  }
  const [head, ...tail] = description.split(":");
  if (tail.length === 0) {
    return null;
  }
  const candidate = tail.join(":").trim();
  return candidate.length > 0 ? candidate : head.trim() || null;
}

export function resolvePaymentMethodLabel(
  paymentMethod: string | null,
  t: (key: string) => string,
): string {
  if (paymentMethod === null || !isManualPaymentMethod(paymentMethod)) {
    return t("common.notAvailable");
  }
  return t(`paymentMethods.${paymentMethod}`);
}

export function toPaymentIso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

export function formatPaymentTime(value: Date | string, locale: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function statusSortRank(status: string): number {
  if (status === "PENDING") return 0;
  if (status === "FAILED") return 1;
  if (status === "REFUNDED") return 2;
  if (status === "SUCCEEDED") return 3;
  return 4;
}

export function comparePayments(
  left: UserPaymentRow,
  right: UserPaymentRow,
  sortOrder: "newest" | "oldest",
): number {
  const leftTime = new Date(left.createdAt).getTime();
  const rightTime = new Date(right.createdAt).getTime();
  const dateDiff = leftTime - rightTime;
  if (dateDiff !== 0) {
    return sortOrder === "newest" ? -dateDiff : dateDiff;
  }
  const statusDiff = statusSortRank(left.status) - statusSortRank(right.status);
  if (statusDiff !== 0) {
    return statusDiff;
  }
  return left.id.localeCompare(right.id);
}
