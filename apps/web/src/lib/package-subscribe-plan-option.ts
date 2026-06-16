import type { PublicPackagePlan } from "@/lib/public-package-plan";

export type PackageSubscribePlanOption = {
  id: string;
  name: string;
  priceCents: number;
  discountedPriceCents: number | null;
  finalPriceCents: number;
  periodDays: number;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
};

export function toPackageSubscribePlanOptions(
  plans: readonly Pick<
    PublicPackagePlan,
    | "id"
    | "name"
    | "priceCents"
    | "discountedPriceCents"
    | "periodDays"
    | "isUnlimited"
    | "sessionsPerMonth"
  >[],
): PackageSubscribePlanOption[] {
  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    priceCents: plan.priceCents,
    discountedPriceCents:
      typeof plan.discountedPriceCents === "number" ? plan.discountedPriceCents : null,
    finalPriceCents:
      typeof plan.discountedPriceCents === "number" &&
      plan.discountedPriceCents < plan.priceCents
        ? plan.discountedPriceCents
        : plan.priceCents,
    periodDays: plan.periodDays,
    isUnlimited: plan.isUnlimited,
    sessionsPerMonth: plan.sessionsPerMonth,
  }));
}
