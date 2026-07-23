import { isDancesPackageCategory } from "@/components/marketing/packages/public-package-category-dances";
import { isMatPilatesPackageCategory } from "@/components/marketing/packages/public-package-category-mat-pilates";
import { isYogaPackageCategory } from "@/components/marketing/packages/public-package-category-yoga";
import { isReformerIndividualPackageCategory } from "@/components/marketing/packages/public-package-category-reformer-individual";
import { isReformerGroupPackageCategory } from "@/components/marketing/packages/public-package-category-reformer-group";
import { listDancesCategoryDisplayPlans } from "@/components/marketing/packages/public-package-dances-display-tiers";
import { listMatPilatesCategoryDisplayPlans } from "@/components/marketing/packages/public-package-mat-pilates-display-tiers";
import { listYogaCategoryDisplayPlans } from "@/components/marketing/packages/public-package-yoga-display-tiers";
import { listReformerIndividualCategoryDisplayPlans } from "@/components/marketing/packages/public-package-reformer-individual-display-tiers";
import { listReformerGroupCategoryDisplayPlans } from "@/components/marketing/packages/public-package-reformer-group-display-tiers";
import {
  listConfiguredPublicPackagePlans,
  type PublicPackageCategoryGroup,
} from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Resolves display tiers for a public package category (marketing canonical tiers when configured). */
export function listPublicPackageCategoryDisplayPlans(
  category: PublicPackageCategoryGroup,
): PublicPackagePlan[] {
  if (isDancesPackageCategory(category)) {
    return listDancesCategoryDisplayPlans(category.plans);
  }
  if (isReformerGroupPackageCategory(category)) {
    return listReformerGroupCategoryDisplayPlans(category.plans);
  }
  if (isReformerIndividualPackageCategory(category)) {
    return listReformerIndividualCategoryDisplayPlans(category.plans);
  }
  if (isMatPilatesPackageCategory(category)) {
    return listMatPilatesCategoryDisplayPlans(category.plans);
  }
  if (isYogaPackageCategory(category)) {
    return listYogaCategoryDisplayPlans(category.plans);
  }
  return listConfiguredPublicPackagePlans(category.plans);
}
