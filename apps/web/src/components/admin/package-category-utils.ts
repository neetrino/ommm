import type { AdminPackagesCategoryOption } from "@/components/admin/admin-packages-category-multi-select";

/** Default grouping label for new packages when no category is selected yet. */
export const DEFAULT_PACKAGE_CATEGORY = "General";

const FALLBACK_CATEGORY_SLUG_PREFIX = "group";

/** Normalized key for safe category comparison (trim, collapse spaces, case-insensitive). */
export function normalizePackageCategoryKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

/** Display-safe category label (trim, collapse spaces). */
export function normalizePackageCategoryLabel(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** Unique slug for a new package group (display name may already exist). */
export function buildUniquePackageCategorySlug(displayName: string): string {
  const normalized = displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  const prefix = normalized.length > 0 ? normalized : FALLBACK_CATEGORY_SLUG_PREFIX;
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8)
      : `${Date.now().toString(36)}`;
  return `${prefix}-${suffix}`.slice(0, 120);
}

/** Resolve category slug from admin option id or stored row value. */
export function resolvePackageCategorySlug(
  categoryId: string,
  packages: readonly { categorySlug?: string; id?: string; slug?: string }[],
): string {
  const trimmed = categoryId.trim();
  if (trimmed.length === 0) {
    return "";
  }
  const direct = packages.find(
    (pkg) => pkg.categorySlug === trimmed || pkg.id === trimmed || pkg.slug === trimmed,
  );
  if (direct?.categorySlug !== undefined && direct.categorySlug.length > 0) {
    return direct.categorySlug;
  }
  return trimmed;
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

function addCategoryOption(
  bySlug: Map<string, string>,
  rawName: string,
  categorySlug: string,
): void {
  const label = normalizePackageCategoryLabel(rawName);
  const slug = categorySlug.trim();
  if (label.length === 0 || slug.length === 0) {
    return;
  }
  if (!bySlug.has(slug)) {
    bySlug.set(slug, label);
  }
}

/** Distinct category options from package rows (deduped by slug, sorted by label). */
export function categoryPackagesToOptions(
  packages: readonly { categoryName: string; categorySlug?: string; id?: string; slug?: string }[],
): AdminPackagesCategoryOption[] {
  const bySlug = new Map<string, string>();
  for (const pkg of packages) {
    const categorySlug = pkg.categorySlug ?? pkg.slug ?? pkg.id ?? "";
    addCategoryOption(bySlug, pkg.categoryName, categorySlug);
  }
  return [...bySlug.entries()]
    .sort((left, right) => left[1].localeCompare(right[1]))
    .map(([id, label]) => ({ id, label }));
}

/** Merge package-derived options with extra rows (e.g. optimistic updates). */
export function mergePackageCategoryOptions(
  primary: readonly AdminPackagesCategoryOption[],
  extraPackages: readonly { categoryName: string; categorySlug?: string; id?: string; slug?: string }[],
): AdminPackagesCategoryOption[] {
  const combined = [
    ...primary.map((option) => ({
      categoryName: option.label,
      categorySlug: option.id,
      slug: option.id,
    })),
    ...extraPackages,
  ];
  return categoryPackagesToOptions(combined);
}

/** Distinct category options from arbitrary name lists (legacy name-only callers). */
export function categoryNamesToOptions(
  names: readonly string[],
): AdminPackagesCategoryOption[] {
  return categoryPackagesToOptions(
    names.map((name, index) => ({
      categoryName: name,
      categorySlug: `${normalizePackageCategoryKey(name)}-${index}`,
      slug: `${normalizePackageCategoryKey(name)}-${index}`,
    })),
  );
}
