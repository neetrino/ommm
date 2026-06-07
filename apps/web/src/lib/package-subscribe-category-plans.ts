import { listPublicPackageCategorySubscribablePlans } from "@/components/marketing/packages/public-package-category-subscribable-plans";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

export type PackageSubscribeCategoryContext = {
  category: PublicPackageCategoryGroup;
  plan: PublicPackagePlan;
  subscribablePlans: PublicPackagePlan[];
};

/** Finds a plan and its category subscribable variants across grouped categories. */
export function resolvePackageSubscribeCategoryContext(
  categories: readonly PublicPackageCategoryGroup[],
  planId: string,
): PackageSubscribeCategoryContext | null {
  for (const category of categories) {
    const plan = category.plans.find((item) => item.id === planId);
    if (plan === undefined) {
      continue;
    }
    const subscribablePlans = listPublicPackageCategorySubscribablePlans(category);
    if (subscribablePlans.length === 0) {
      return null;
    }
    const resolvedPlan =
      subscribablePlans.find((item) => item.id === planId) ??
      category.plans.find((item) => item.id === planId) ??
      subscribablePlans[0];
    return {
      category,
      plan: resolvedPlan,
      subscribablePlans,
    };
  }
  return null;
}
