export type PublicTypeSessionAllocation = {
  classTypeId: string;
  classTypeName?: string;
  sessionCount: number;
  description?: string | null;
};

/** Non-empty descriptions from type session rows, joined for display. */
export function resolvePublicPackageTypeSessionDescription(
  allocations: readonly PublicTypeSessionAllocation[] | undefined,
): string | null {
  if (allocations === undefined || allocations.length === 0) {
    return null;
  }
  const descriptions = allocations
    .map((allocation) => allocation.description?.trim() ?? "")
    .filter((value) => value.length > 0);
  if (descriptions.length === 0) {
    return null;
  }
  return descriptions.join("\n\n");
}
