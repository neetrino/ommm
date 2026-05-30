const MAX_TYPE_SLUG_LENGTH = 120;

/** Builds a URL-safe slug from a class type display name. */
export function buildClassTypeSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_TYPE_SLUG_LENGTH);
}
