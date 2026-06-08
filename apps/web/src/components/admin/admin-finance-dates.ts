import type { FinanceDateRangeDays } from "@/components/admin/admin-finance-types";

export function computeFinanceFromDate(days: FinanceDateRangeDays): string {
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  return from.toISOString();
}

export function computeFinanceMonthStart(): string {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return start.toISOString();
}

export function currentFinanceMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}
