import type { StudioAnalyticsPayload } from './studio-analytics.types';

const EMPTY_AMOUNT_BUCKET = { count: 0, amountCents: 0 };

/** Removes revenue and payment aggregates before returning analytics to managers. */
export function stripFinanceFromStudioAnalytics(
  payload: StudioAnalyticsPayload,
): StudioAnalyticsPayload {
  return {
    ...payload,
    comparison: {
      ...payload.comparison,
      revenueCents: { current: 0, previous: 0, trendPercent: null },
    },
    kpis: {
      ...payload.kpis,
      revenueCents: 0,
      successfulPaymentsCount: 0,
      averageOrderValueCents: 0,
    },
    daily: payload.daily.map((day) => ({ ...day, revenueCents: 0 })),
    revenue: {
      bySource: {
        package: EMPTY_AMOUNT_BUCKET,
        dropin: EMPTY_AMOUNT_BUCKET,
        gift: EMPTY_AMOUNT_BUCKET,
        other: EMPTY_AMOUNT_BUCKET,
      },
      byStatus: [],
      byPaymentMethod: [],
      byClassType: payload.revenue.byClassType.map((row) => ({
        ...row,
        amountCents: 0,
      })),
      byCoach: payload.revenue.byCoach.map((row) => ({
        ...row,
        amountCents: 0,
      })),
      byPackage: payload.revenue.byPackage.map((row) => ({
        ...row,
        count: 0,
        amountCents: 0,
      })),
      topClients: [],
      giftCredits: {
        issuedCents: 0,
        issuedCount: 0,
        redeemedCents: 0,
        redeemedCount: 0,
        spentCents: 0,
        spendTransactionsCount: 0,
        outstandingCreditsCents: 0,
      },
      influencer: {
        costCents: 0,
        count: 0,
      },
    },
  };
}
