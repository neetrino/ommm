/** Mirrors `DAILY_FINANCE_METHODS` in the API (display order). */
export const DAILY_FINANCE_METHODS = [
  "CASH",
  "CARD_TERMINAL",
  "CARD",
  "BANK_TRANSFER",
  "OTHER",
] as const;

export type DailyFinanceMethod = (typeof DAILY_FINANCE_METHODS)[number];

export type DailyFinanceBucket = {
  count: number;
  amountCents: number;
};

/** Response of `GET /reports/finance/today`. */
export type DailyFinanceReportPayload = {
  date: string;
  revenue: DailyFinanceBucket;
  pending: DailyFinanceBucket;
  refunded: DailyFinanceBucket;
  byMethod: Array<DailyFinanceBucket & { method: DailyFinanceMethod }>;
};

export const DAILY_FINANCE_ENDPOINT = "/reports/finance/today";
