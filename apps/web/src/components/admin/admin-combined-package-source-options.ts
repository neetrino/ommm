import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type { CombinedPackageSourceOption } from "@/components/admin/admin-combined-package-source-select";
import {
  normalizePackageCategoryKey,
  normalizePackageCategoryLabel,
} from "@/components/admin/package-category-utils";

function pickRepresentativePlan(plans: readonly AdminPackageRow[]): AdminPackageRow {
  const priced = [...plans].filter((plan) => plan.priceCents > 0);
  if (priced.length > 0) {
    return priced.sort((left, right) => left.displayOrder - right.displayOrder)[0];
  }
  return [...plans].sort((left, right) => left.displayOrder - right.displayOrder)[0];
}

/** One selectable row per active single package category (shell or priced tier). */
export function buildCombinedPackageSourceOptions(
  packages: readonly AdminPackageRow[],
): {
  options: CombinedPackageSourceOption[];
  planById: Map<string, AdminPackageRow>;
} {
  const activeSingles = packages.filter(
    (plan) => plan.isActive && plan.planType !== "COMBINED",
  );
  const byCategory = new Map<string, AdminPackageRow[]>();
  for (const plan of activeSingles) {
    const categoryLabel = normalizePackageCategoryLabel(plan.categoryName);
    if (categoryLabel.length === 0) {
      continue;
    }
    const key = normalizePackageCategoryKey(categoryLabel);
    const group = byCategory.get(key) ?? [];
    group.push(plan);
    byCategory.set(key, group);
  }

  const planById = new Map<string, AdminPackageRow>();
  const options = [...byCategory.values()]
    .map((group) => {
      const plan = pickRepresentativePlan(group);
      planById.set(plan.id, plan);
      const label =
        normalizePackageCategoryLabel(plan.categoryName).length > 0
          ? normalizePackageCategoryLabel(plan.categoryName)
          : plan.name;
      return {
        id: plan.id,
        label,
        categoryName: plan.categoryName,
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));

  return { options, planById };
}
