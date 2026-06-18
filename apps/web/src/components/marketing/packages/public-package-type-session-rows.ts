import type { PublicTypeSessionAllocation } from "@/components/marketing/packages/public-package-type-session-description";

export type PublicTypeSessionDisplayRow = {
  id: string;
  typeName: string;
  sessionCount: number;
  description: string | null;
};

/** Package includes multiple class-type session rows (mix). */
export function hasPublicPackageTypeSessions(
  allocations: readonly PublicTypeSessionAllocation[] | undefined,
): boolean {
  return (allocations?.length ?? 0) > 1;
}

/** Rows for the public mix breakdown table. */
export function resolvePublicPackageTypeSessionRows(
  allocations: readonly PublicTypeSessionAllocation[] | undefined,
): PublicTypeSessionDisplayRow[] {
  if (allocations === undefined || allocations.length === 0) {
    return [];
  }
  return allocations.map((allocation) => {
    const typeName =
      typeof allocation.classTypeName === "string" && allocation.classTypeName.trim().length > 0
        ? allocation.classTypeName.trim()
        : allocation.classTypeId;
    const description = allocation.description?.trim() ?? "";
    return {
      id: allocation.classTypeId,
      typeName,
      sessionCount: allocation.sessionCount,
      description: description.length > 0 ? description : null,
    };
  });
}
