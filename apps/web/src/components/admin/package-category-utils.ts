import type { AdminPackagesCategoryOption } from "@/components/admin/admin-packages-category-multi-select";

/** Normalized key for safe category comparison (trim, collapse spaces, case-insensitive). */
export function normalizePackageCategoryKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

/** Display-safe category label (trim, collapse spaces). */
export function normalizePackageCategoryLabel(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** Returns the canonical existing category label when input matches, otherwise null. */
export function findMatchingPackageCategory(
  input: string,
  candidates: readonly string[],
): string | null {
  const key = normalizePackageCategoryKey(input);
  if (key.length === 0) {
    return null;
  }
  for (const candidate of candidates) {
    const label = normalizePackageCategoryLabel(candidate);
    if (label.length === 0) {
      continue;
    }
    if (normalizePackageCategoryKey(label) === key) {
      return label;
    }
  }
  return null;
}

/** Reuse an existing category label when matched; otherwise return a normalized new label. */
export function resolvePackageCategoryName(
  input: string,
  candidates: readonly string[],
): string {
  const match = findMatchingPackageCategory(input, candidates);
  if (match !== null) {
    return match;
  }
  return normalizePackageCategoryLabel(input);
}

function addCategoryLabel(
  byKey: Map<string, string>,
  rawName: string,
): void {
  const label = normalizePackageCategoryLabel(rawName);
  if (label.length === 0) {
    return;
  }
  const key = normalizePackageCategoryKey(label);
  if (!byKey.has(key)) {
    byKey.set(key, label);
  }
}

/** Distinct category options from arbitrary name lists (deduped, sorted). */
export function categoryNamesToOptions(
  names: readonly string[],
): AdminPackagesCategoryOption[] {
  const byKey = new Map<string, string>();
  for (const name of names) {
    addCategoryLabel(byKey, name);
  }
  return [...byKey.values()]
    .sort((left, right) => left.localeCompare(right))
    .map((label) => ({ id: label, label }));
}

/** Merge package-derived options with extra names (e.g. from API or optimistic updates). */
export function mergePackageCategoryOptions(
  primary: readonly AdminPackagesCategoryOption[],
  extraNames: readonly string[],
): AdminPackagesCategoryOption[] {
  const byKey = new Map<string, string>();
  for (const option of primary) {
    addCategoryLabel(byKey, option.label);
  }
  for (const name of extraNames) {
    addCategoryLabel(byKey, name);
  }
  return [...byKey.values()]
    .sort((left, right) => left.localeCompare(right))
    .map((label) => ({ id: label, label }));
}
