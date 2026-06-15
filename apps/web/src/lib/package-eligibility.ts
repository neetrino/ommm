/** Client-side helpers mirroring API package eligibility naming. */

export function normalizePackageCategoryLabel(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function buildCombinedPackageName(sourceNames: readonly string[]): string {
  return sourceNames.map((name) => name.trim()).filter(Boolean).join(" + ");
}
