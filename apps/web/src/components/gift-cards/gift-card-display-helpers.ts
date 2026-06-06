import { formatDateForUi } from "@/lib/date-display";

export type GiftCardStatusValue = "ACTIVE" | "REDEEMED" | "EXPIRED" | "DEACTIVATED";

export function displayGiftCardDate(value: string | null): string {
  if (value === null) {
    return "—";
  }
  const formatted = formatDateForUi(value);
  return formatted.length > 0 ? formatted : "—";
}

export function giftCardStatusBadgeClass(status: GiftCardStatusValue | string): string {
  if (status === "ACTIVE") {
    return "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800";
  }
  if (status === "REDEEMED") {
    return "inline-flex rounded-full border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs text-sage-900";
  }
  if (status === "DEACTIVATED") {
    return "inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700";
  }
  return "inline-flex rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-xs text-sage-700";
}

export function isGiftCardDateExpired(
  status: string,
  expiresAt: string | null,
  now = Date.now(),
): boolean {
  if (status === "EXPIRED") {
    return true;
  }
  if (expiresAt === null) {
    return false;
  }
  const expiresAtMs = new Date(expiresAt).getTime();
  return !Number.isNaN(expiresAtMs) && expiresAtMs < now;
}
