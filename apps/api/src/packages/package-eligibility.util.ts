import { PackagePlanType } from '@prisma/client';
import { buildClassTypeSlugFromPackageCategory } from './package-category-class-type.sync';

export type PackageClassTypeRef = {
  id: string;
  name: string;
  slug: string;
};

export type PackagePlanEligibilityRef = {
  planType: PackagePlanType;
  categoryName: string;
  allowedCategoryNames: string[];
};

export function normalizePackageCategoryLabel(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function packageCategoryComparisonKey(name: string): string {
  return normalizePackageCategoryLabel(name).toLocaleLowerCase();
}

function isSingularPluralSlugPair(left: string, right: string): boolean {
  return left === `${right}s` || right === `${left}s`;
}

/** Whether a session class type is covered by a package category label. */
export function classTypeMatchesPackageCategory(
  categoryName: string,
  classType: PackageClassTypeRef,
): boolean {
  const normalized = normalizePackageCategoryLabel(categoryName);
  if (normalized.length === 0) {
    return false;
  }
  if (
    packageCategoryComparisonKey(classType.name) ===
    packageCategoryComparisonKey(normalized)
  ) {
    return true;
  }
  const slug = buildClassTypeSlugFromPackageCategory(normalized);
  if (slug.length === 0) {
    return false;
  }
  return (
    classType.slug === slug || isSingularPluralSlugPair(classType.slug, slug)
  );
}

export function resolvePlanAllowedCategories(
  plan: PackagePlanEligibilityRef,
): string[] {
  if (
    plan.planType === PackagePlanType.COMBINED &&
    plan.allowedCategoryNames.length > 0
  ) {
    return plan.allowedCategoryNames.map(normalizePackageCategoryLabel).filter(
      (label) => label.length > 0,
    );
  }
  const single = normalizePackageCategoryLabel(plan.categoryName);
  return single.length > 0 ? [single] : [];
}

export function isPlanEligibleForClassType(
  plan: PackagePlanEligibilityRef,
  classType: PackageClassTypeRef,
): boolean {
  const categories = resolvePlanAllowedCategories(plan);
  return categories.some((category) =>
    classTypeMatchesPackageCategory(category, classType),
  );
}

export function buildCombinedPackageName(sourceNames: readonly string[]): string {
  return sourceNames.map((name) => name.trim()).filter(Boolean).join(' + ');
}

export function dedupeCategoryNames(categories: readonly string[]): string[] {
  const byKey = new Map<string, string>();
  for (const raw of categories) {
    const label = normalizePackageCategoryLabel(raw);
    if (label.length === 0) {
      continue;
    }
    const key = packageCategoryComparisonKey(label);
    if (!byKey.has(key)) {
      byKey.set(key, label);
    }
  }
  return [...byKey.values()];
}
