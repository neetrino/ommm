import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";

/** Builds a locale-aware path to the public package category detail page. */
export function buildPackageCategoryHref(
  categoryKey: string,
  audience: PublicPackageCategoryCardsAudience,
  planId?: string,
): string {
  const base =
    audience === "member"
      ? `/user/packages/${encodeURIComponent(categoryKey)}`
      : `/packages/${encodeURIComponent(categoryKey)}`;
  if (planId === undefined || planId.length === 0) {
    return base;
  }
  return `${base}?plan=${encodeURIComponent(planId)}`;
}
