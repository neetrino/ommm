const FALLBACK_TIER_SLUG_PREFIX = "tier";

/** Internal plan name for a pricing row inside a package category. */
export function buildPackageTierPlanName(
  categoryName: string,
  sessions: number,
  ordinal: number,
): string {
  const label = categoryName.trim();
  if (label.length === 0) {
    return `${FALLBACK_TIER_SLUG_PREFIX}-${ordinal}`;
  }
  if (sessions >= 1) {
    return `${label} — ${sessions}`;
  }
  return `${label} ${ordinal}`;
}

/** Unique slug for a new tier plan under the same category. */
export function buildPackageTierSlug(categoryName: string, sessions: number): string {
  const normalized = `${categoryName}-${sessions}-${Date.now()}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  if (normalized.length > 0) {
    return normalized;
  }
  return `${FALLBACK_TIER_SLUG_PREFIX}-${Date.now()}`;
}
