import { redirect } from "next/navigation";
import {
  FINANCE_SECTION_HREF,
  type FinanceSectionId,
} from "@/components/admin/admin-finance-module";
import {
  buildSanitizedFinanceSectionQueryString,
  financeSectionSearchNeedsSanitization,
} from "@/components/admin/admin-finance-url";

export type FinanceSummaryPayload = {
  totals: {
    revenueCents: number;
    successfulPaymentsCount: number;
    averageOrderValueCents: number;
  };
  byStatus: Array<{
    status: string;
    count: number;
    amountCents: number;
  }>;
  bySource: Record<"package" | "dropin" | "gift" | "other", { count: number; amountCents: number }>;
  giftCredits: {
    issuedCents: number;
    issuedCount: number;
    redeemedCents: number;
    redeemedCount: number;
    spentCents: number;
    spendTransactionsCount: number;
    outstandingCreditsCents: number;
  };
  influencer: {
    costCents: number;
    count: number;
  };
};

export function normalizeFinanceSearch(
  search: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(search)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  return normalized;
}

export function getFinanceStatusStats(summary: FinanceSummaryPayload, status: string) {
  return (
    summary.byStatus.find((entry) => entry.status === status) ?? {
      status,
      count: 0,
      amountCents: 0,
    }
  );
}

/** Redirects when the URL carries query keys from another finance tab or legacy `?tab=`. */
export function redirectIfUnscopedFinanceSearchParams(
  locale: string,
  section: FinanceSectionId,
  search: Record<string, string | string[] | undefined>,
): void {
  if (!financeSectionSearchNeedsSanitization(section, search)) {
    return;
  }

  const qs = buildSanitizedFinanceSectionQueryString(section, search);
  const path = FINANCE_SECTION_HREF[section];
  redirect(qs ? `/${locale}${path}?${qs}` : `/${locale}${path}`);
}
