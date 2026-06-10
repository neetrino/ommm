import type { UserMembershipRow } from "@/lib/user-package-types";

/** One validity day = 24 hours from activation, in milliseconds. */
export const USER_PACKAGE_VALIDITY_DAY_MS = 24 * 60 * 60 * 1000;

type ValidityTimestampInput = Pick<
  UserMembershipRow,
  "currentPeriodStart" | "currentPeriodEnd" | "plan"
>;

function parseTimestamp(value: string | null | undefined): Date | null {
  if (value === null || value === undefined || value.trim() === "") {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Remaining full 24-hour validity periods until expiry.
 * Prefers `currentPeriodEnd`; falls back to activation + plan duration.
 */
export function computeRemainingValidityDays(
  membership: ValidityTimestampInput,
  now: Date = new Date(),
): number {
  const periodEnd = parseTimestamp(membership.currentPeriodEnd);
  if (periodEnd !== null) {
    const remainingMs = periodEnd.getTime() - now.getTime();
    if (remainingMs <= 0) {
      return 0;
    }
    return Math.ceil(remainingMs / USER_PACKAGE_VALIDITY_DAY_MS);
  }

  const periodStart = parseTimestamp(membership.currentPeriodStart);
  const periodDays = membership.plan.periodDays;
  if (periodStart !== null && periodDays > 0) {
    const totalMs = periodDays * USER_PACKAGE_VALIDITY_DAY_MS;
    const elapsedMs = now.getTime() - periodStart.getTime();
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    if (remainingMs <= 0) {
      return 0;
    }
    return Math.ceil(remainingMs / USER_PACKAGE_VALIDITY_DAY_MS);
  }

  return Math.max(0, periodDays);
}

export function formatMembershipValidityLabel(
  membership: ValidityTimestampInput,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  now: Date = new Date(),
): string {
  const remainingDays = computeRemainingValidityDays(membership, now);
  if (remainingDays <= 0) {
    return t("validityExpired");
  }
  return t("validityDaysRemaining", { count: remainingDays });
}
