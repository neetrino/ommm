export const MAX_NAME_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_BILLING_PERIOD_LENGTH = 32;
export const MAX_FEATURES_LENGTH = 1200;
export const MAX_BUTTON_LABEL_LENGTH = 80;

export const BILLING_PERIOD_OPTIONS = ["weekly", "monthly", "quarterly", "yearly"] as const;
export type BillingPeriodOption = (typeof BILLING_PERIOD_OPTIONS)[number];

export function parsePriceToCents(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized.length === 0) {
    return null;
  }
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }
  return Math.round(numeric * 100);
}

export function preventNumberArrowStep(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
  }
}

export function isBillingPeriodOption(value: string): value is BillingPeriodOption {
  return BILLING_PERIOD_OPTIONS.includes(value as BillingPeriodOption);
}
