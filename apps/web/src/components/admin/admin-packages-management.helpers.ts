import type { Dispatch, SetStateAction } from "react";

export function revealPackageCategoryInFilters(
  categorySlug: string,
  setSelectedCategoryIds: Dispatch<SetStateAction<ReadonlySet<string>>>,
  setExpandedCategoryKeys: Dispatch<SetStateAction<ReadonlySet<string>>>,
): void {
  const normalizedSlug = categorySlug.trim();
  if (normalizedSlug.length === 0) {
    return;
  }
  setSelectedCategoryIds((current) => {
    if (current.has(normalizedSlug)) {
      return current;
    }
    const next = new Set(current);
    next.add(normalizedSlug);
    return next;
  });
  setExpandedCategoryKeys((current) => {
    if (current.has(normalizedSlug)) {
      return current;
    }
    const next = new Set(current);
    next.add(normalizedSlug);
    return next;
  });
}
