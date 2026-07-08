import type { PublicPackagePlan } from "./publicPackagePlan";

export type PublicTypeSessionDisplayRow = {
  id: string;
  typeName: string;
  sessionCount: number;
  description: string | null;
};

export function hasPublicPackageTypeSessions(
  allocations: PublicPackagePlan["typeSessionAllocations"],
): boolean {
  return (allocations?.length ?? 0) > 1;
}

export function resolvePublicPackageTypeSessionRows(
  allocations: PublicPackagePlan["typeSessionAllocations"],
): PublicTypeSessionDisplayRow[] {
  if (allocations === undefined || allocations.length === 0) {
    return [];
  }
  return allocations.map((allocation) => {
    const typeName =
      typeof allocation.classTypeName === "string" &&
      allocation.classTypeName.trim().length > 0
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
