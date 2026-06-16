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

const COMBINED_CLASS_NAME_SEPARATOR = ' + ';

/** Splits a combined class type label into its source category labels. */
export function resolveClassTypeComponentLabels(
  classType: PackageClassTypeRef,
): string[] {
  const normalized = normalizePackageCategoryLabel(classType.name);
  if (!normalized.includes(COMBINED_CLASS_NAME_SEPARATOR)) {
    return [normalized].filter((label) => label.length > 0);
  }
  return dedupeCategoryNames(normalized.split(COMBINED_CLASS_NAME_SEPARATOR));
}

function packageCategoryLabelsMatch(left: string, right: string): boolean {
  const normalizedLeft = normalizePackageCategoryLabel(left);
  const normalizedRight = normalizePackageCategoryLabel(right);
  if (
    packageCategoryComparisonKey(normalizedLeft) ===
    packageCategoryComparisonKey(normalizedRight)
  ) {
    return true;
  }
  const leftSlug = buildClassTypeSlugFromPackageCategory(normalizedLeft);
  const rightSlug = buildClassTypeSlugFromPackageCategory(normalizedRight);
  if (leftSlug.length === 0 || rightSlug.length === 0) {
    return false;
  }
  return (
    leftSlug === rightSlug || isSingularPluralSlugPair(leftSlug, rightSlug)
  );
}

function planCategoryMatchesCombinedClassComponent(
  categoryName: string,
  classType: PackageClassTypeRef,
): boolean {
  const classComponents = resolveClassTypeComponentLabels(classType);
  if (classComponents.length <= 1) {
    return false;
  }
  return classComponents.some((component) =>
    packageCategoryLabelsMatch(categoryName, component),
  );
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
  if (plan.planType === PackagePlanType.COMBINED) {
    const componentLabels = plan.allowedCategoryNames
      .map(normalizePackageCategoryLabel)
      .filter((label) => label.length > 0);
    const combinedLabel = normalizePackageCategoryLabel(plan.categoryName);
    if (combinedLabel.length === 0) {
      return dedupeCategoryNames(componentLabels);
    }
    return dedupeCategoryNames([...componentLabels, combinedLabel]);
  }
  const single = normalizePackageCategoryLabel(plan.categoryName);
  return single.length > 0 ? [single] : [];
}

export function isPlanEligibleForClassType(
  plan: PackagePlanEligibilityRef,
  classType: PackageClassTypeRef,
): boolean {
  const categories = resolvePlanAllowedCategories(plan);
  return categories.some((category) => {
    if (classTypeMatchesPackageCategory(category, classType)) {
      return true;
    }
    return planCategoryMatchesCombinedClassComponent(category, classType);
  });
}

export function buildCombinedPackageName(
  sourceNames: readonly string[],
): string {
  return sourceNames
    .map((name) => name.trim())
    .filter(Boolean)
    .join(' + ');
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
