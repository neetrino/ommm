import {
  MAX_PACKAGE_DURATION_DAYS,
  MAX_PACKAGE_SESSIONS,
  MIN_PACKAGE_DURATION_DAYS,
  MIN_PACKAGE_SESSIONS,
  parseDurationDays,
  parsePriceToCents,
  parseSessionsCount,
  type AdminPackageFormValues,
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

export type PackageClassTypeOption = {
  id: string;
  name: string;
};

/** Class types not yet selected in other session-type rows (current row selection stays visible). */
export function resolveClassTypeOptionsForEntry(
  entry: PackageTypeSessionFormEntry,
  allEntries: readonly PackageTypeSessionFormEntry[],
  classTypeOptions: readonly PackageClassTypeOption[],
): PackageClassTypeOption[] {
  const selectedInOtherRows = new Set(
    allEntries
      .filter((row) => row.id !== entry.id && row.classTypeId.trim().length > 0)
      .map((row) => row.classTypeId.trim()),
  );
  const currentSelection = entry.classTypeId.trim();
  return classTypeOptions.filter(
    (option) => option.id === currentSelection || !selectedInOtherRows.has(option.id),
  );
}

/** Whether another session-type row can be added (one row per class type). */
export function canAddTypeSessionRow(
  entries: readonly PackageTypeSessionFormEntry[],
  classTypeOptionCount: number,
): boolean {
  return entries.length < classTypeOptionCount;
}

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

export type TypeSessionRowFieldErrors = {
  type?: boolean;
  sessions?: boolean;
};

export type TierFieldErrors = {
  name?: boolean;
  price?: boolean;
  duration?: boolean;
  discountedPrice?: boolean;
  stockCount?: boolean;
  typeSessionRows?: Readonly<Record<string, TypeSessionRowFieldErrors>>;
};

const TYPE_SESSION_MESSAGE_KEYS: Record<TypeSessionValidationError, string> = {
  empty: "emptyError",
  missingType: "missingTypeError",
  duplicateType: "duplicateTypeError",
  invalidSessionCount: "invalidSessionCountError",
};

function isSessionCountValid(raw: string): boolean {
  const count = parseSessionsCount(raw);
  return count !== null && count >= MIN_PACKAGE_SESSIONS && count <= MAX_PACKAGE_SESSIONS;
}

function rowFieldErrors(entry: PackageTypeSessionFormEntry): TypeSessionRowFieldErrors {
  return {
    ...(!entry.classTypeId.trim() ? { type: true } : {}),
    ...(!isSessionCountValid(entry.sessionCount) ? { sessions: true } : {}),
  };
}

function collectTypeSessionRowFieldErrors(
  entries: readonly PackageTypeSessionFormEntry[],
  error: TypeSessionValidationError,
): Record<string, TypeSessionRowFieldErrors> {
  if (error === "empty") {
    const first = entries[0];
    return first !== undefined ? { [first.id]: rowFieldErrors(first) } : {};
  }

  const rows: Record<string, TypeSessionRowFieldErrors> = {};
  const seenTypeIds = new Set<string>();
  for (const entry of entries) {
    const typeId = entry.classTypeId.trim();
    const hasInput = typeId.length > 0 || entry.sessionCount.trim().length > 0;
    if (!hasInput) {
      continue;
    }

    const next: TypeSessionRowFieldErrors = rowFieldErrors(entry);
    if (typeId.length > 0 && seenTypeIds.has(typeId)) {
      next.type = true;
    }
    if (typeId.length > 0) {
      seenTypeIds.add(typeId);
    }
    if (Object.keys(next).length > 0) {
      rows[entry.id] = next;
    }
  }
  return rows;
}

/** Validates tier form values and returns field flags for inline error styling. */
export function collectTierFieldErrors(
  values: AdminPackageFormValues,
  entries: readonly PackageTypeSessionFormEntry[],
):
  | { errors: TierFieldErrors; messageKey: string; messageScope: "packages" | "typeSessions" }
  | null {
  const errors: TierFieldErrors = {};
  let messageKey = "";
  let messageScope: "packages" | "typeSessions" = "packages";

  const mark = (
    field: Exclude<keyof TierFieldErrors, "typeSessionRows">,
    key: string,
    scope: "packages" | "typeSessions" = "packages",
  ): void => {
    errors[field] = true;
    if (messageKey.length === 0) {
      messageKey = key;
      messageScope = scope;
    }
  };

  if (values.name.trim().length === 0) {
    mark("name", "sessionNameRequired");
  }

  const priceCents = parsePriceToCents(values.price);
  if (priceCents === null) {
    mark("price", "priceInvalid");
  }

  const periodDays = parseDurationDays(values.durationDays);
  if (
    periodDays === null ||
    periodDays < MIN_PACKAGE_DURATION_DAYS ||
    periodDays > MAX_PACKAGE_DURATION_DAYS
  ) {
    mark("duration", "durationDaysInvalid");
  }

  if (values.discountedPrice.trim().length > 0) {
    const discountCents = parsePriceToCents(values.discountedPrice);
    if (discountCents === null) {
      mark("discountedPrice", "discountedPriceInvalid");
    } else if (discountCents < 0) {
      mark("discountedPrice", "discountedPriceNegative");
    } else if (priceCents !== null && discountCents >= priceCents) {
      mark("discountedPrice", "discountedPriceLowerThanPrice");
    }
  }

  const typeSessions = validateTypeSessionEntries(entries);
  if (!typeSessions.ok) {
    errors.typeSessionRows = collectTypeSessionRowFieldErrors(entries, typeSessions.error);
    if (messageKey.length === 0) {
      messageKey = TYPE_SESSION_MESSAGE_KEYS[typeSessions.error];
      messageScope = "typeSessions";
    }
  }

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return {
    errors,
    messageKey: messageKey.length > 0 ? messageKey : "genericError",
    messageScope,
  };
}
