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

export type AdminPackageFormValues = {
  name: string;
  description: string;
  price: string;
  periodDays: string;
  billingPeriod: BillingPeriodOption;
  features: string;
  buttonLabel: string;
  displayOrder: string;
  isPopular: boolean;
  isActive: boolean;
  classTypeId: string;
};

export function createEmptyPackageFormValues(classTypeId: string): AdminPackageFormValues {
  return {
    name: "",
    description: "",
    price: "",
    periodDays: "30",
    billingPeriod: "monthly",
    features: "",
    buttonLabel: "Choose plan",
    displayOrder: "0",
    isPopular: false,
    isActive: true,
    classTypeId,
  };
}

export function packageRowToFormValues(
  pkg: {
    name: string;
    description: string | null;
    priceCents: number;
    periodDays: number;
    billingPeriod: string;
    features: string[];
    buttonLabel: string;
    displayOrder: number;
    isPopular: boolean;
    isActive: boolean;
    classTypeId: string | null;
  },
  fallbackClassTypeId: string,
): AdminPackageFormValues {
  const billingPeriod = isBillingPeriodOption(pkg.billingPeriod) ? pkg.billingPeriod : "monthly";
  return {
    name: pkg.name,
    description: pkg.description ?? "",
    price: (pkg.priceCents / 100).toFixed(2),
    periodDays: String(pkg.periodDays),
    billingPeriod,
    features: pkg.features.join("\n"),
    buttonLabel: pkg.buttonLabel,
    displayOrder: String(pkg.displayOrder),
    isPopular: pkg.isPopular,
    isActive: pkg.isActive,
    classTypeId: pkg.classTypeId ?? fallbackClassTypeId,
  };
}
