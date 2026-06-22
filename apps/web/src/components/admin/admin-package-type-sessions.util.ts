import {
  MAX_PACKAGE_SESSIONS,
  MIN_PACKAGE_SESSIONS,
  parseSessionsCount,
} from "@/components/admin/admin-package-form-utils";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";

export type PackageTypeSessionAllocation = {
  classTypeId: string;
  sessionCount: number;
};

export type PackageTypeSessionFormEntry = {
  id: string;
  classTypeId: string;
  sessionCount: string;
};

export function createEmptyTypeSessionEntry(): PackageTypeSessionFormEntry {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    classTypeId: "",
    sessionCount: "",
  };
}

export function entriesFromPackage(pkg: AdminPackageRow): PackageTypeSessionFormEntry[] {
  const stored = pkg.typeSessionAllocations ?? [];
  if (stored.length === 0) {
    return [];
  }
  return stored.map((allocation) => ({
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${allocation.classTypeId}-${allocation.sessionCount}`,
    classTypeId: allocation.classTypeId,
    sessionCount: String(allocation.sessionCount),
  }));
}

export function initialTypeSessionEntries(
  pkg: AdminPackageRow | undefined,
): PackageTypeSessionFormEntry[] {
  if (pkg === undefined) {
    return [createEmptyTypeSessionEntry()];
  }
  const fromPackage = entriesFromPackage(pkg);
  return fromPackage.length > 0 ? fromPackage : [createEmptyTypeSessionEntry()];
}

export function sumTypeSessionEntries(
  entries: readonly PackageTypeSessionFormEntry[],
): number {
  return entries.reduce((total, entry) => {
    const parsed = parseSessionsCount(entry.sessionCount);
    return parsed === null ? total : total + parsed;
  }, 0);
}

export type TypeSessionValidationError =
  | "empty"
  | "missingType"
  | "duplicateType"
  | "invalidSessionCount";

export function hasPackageTypeSessions(pkg: AdminPackageRow): boolean {
  return (pkg.typeSessionAllocations?.length ?? 0) > 0;
}

export function resolvePackageTypeSessionAllocations(
  pkg: AdminPackageRow,
): PackageTypeSessionAllocation[] {
  return pkg.typeSessionAllocations ?? [];
}

export function resolvePackageTotalSessions(pkg: AdminPackageRow): number | null {
  const allocations = resolvePackageTypeSessionAllocations(pkg);
  if (allocations.length === 0) {
    return null;
  }
  return allocations.reduce((total, allocation) => total + allocation.sessionCount, 0);
}

export function buildTypeSessionAllocationsPayload(
  entries: readonly PackageTypeSessionFormEntry[],
): PackageTypeSessionAllocation[] | null {
  const result = validateTypeSessionEntries(entries);
  return result.ok ? result.payload : null;
}

export function validateTypeSessionEntries(
  entries: readonly PackageTypeSessionFormEntry[],
):
  | { ok: true; payload: PackageTypeSessionAllocation[] }
  | { ok: false; error: TypeSessionValidationError } {
  const payload: PackageTypeSessionAllocation[] = [];
  const seenTypeIds = new Set<string>();
  for (const entry of entries) {
    const classTypeId = entry.classTypeId.trim();
    const sessionCount = parseSessionsCount(entry.sessionCount);
    if (classTypeId.length === 0 && entry.sessionCount.trim().length === 0) {
      continue;
    }
    if (classTypeId.length === 0) {
      return { ok: false, error: "missingType" };
    }
    if (seenTypeIds.has(classTypeId)) {
      return { ok: false, error: "duplicateType" };
    }
    seenTypeIds.add(classTypeId);
    if (
      sessionCount === null ||
      sessionCount < MIN_PACKAGE_SESSIONS ||
      sessionCount > MAX_PACKAGE_SESSIONS
    ) {
      return { ok: false, error: "invalidSessionCount" };
    }
    payload.push({
      classTypeId,
      sessionCount,
    });
  }
  if (payload.length === 0) {
    return { ok: false, error: "empty" };
  }
  return { ok: true, payload };
}
