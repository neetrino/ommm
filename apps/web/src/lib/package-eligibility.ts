/** Client-side helpers mirroring API package eligibility naming. */

export function normalizePackageCategoryLabel(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
