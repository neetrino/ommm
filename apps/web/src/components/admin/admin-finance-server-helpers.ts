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
