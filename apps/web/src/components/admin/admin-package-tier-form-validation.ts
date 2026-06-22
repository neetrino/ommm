import {
  MAX_PACKAGE_DURATION_DAYS,
  MIN_PACKAGE_DURATION_DAYS,
  MIN_PACKAGE_SESSIONS,
  MAX_PACKAGE_SESSIONS,
  parseDurationDays,
  parsePriceToCents,
  parseSessionsCount,
  type AdminPackageFormValues,
} from "@/components/admin/admin-package-form-utils";
import {
  validateTypeSessionEntries,
  type PackageTypeSessionFormEntry,
  type TypeSessionValidationError,
} from "@/components/admin/admin-package-type-sessions.util";

export type TypeSessionRowFieldErrors = {
  type?: boolean;
  sessions?: boolean;
};

export type AdminPackageTierFieldErrors = {
  name?: boolean;
  price?: boolean;
  duration?: boolean;
  discountedPrice?: boolean;
  typeSessionRows?: Readonly<Record<string, TypeSessionRowFieldErrors>>;
};

export function hasTierFieldErrors(errors: AdminPackageTierFieldErrors): boolean {
  if (errors.name || errors.price || errors.duration || errors.discountedPrice) {
    return true;
  }
  return Object.keys(errors.typeSessionRows ?? {}).length > 0;
}

function isValidSessionCount(sessionCount: number | null): boolean {
  return (
    sessionCount !== null &&
    sessionCount >= MIN_PACKAGE_SESSIONS &&
    sessionCount <= MAX_PACKAGE_SESSIONS
  );
}

/** Maps type/session rows to per-field error flags for inline highlighting. */
export function resolveTypeSessionRowFieldErrors(
  entries: readonly PackageTypeSessionFormEntry[],
): Record<string, TypeSessionRowFieldErrors> {
  const rows: Record<string, TypeSessionRowFieldErrors> = {};
  const seenTypeIds = new Set<string>();
  let hasCompleteRow = false;

  for (const entry of entries) {
    const typeId = entry.classTypeId.trim();
    const sessionCount = parseSessionsCount(entry.sessionCount);
    const hasType = typeId.length > 0;
    const hasSessionInput = entry.sessionCount.trim().length > 0;

    if (!hasType && !hasSessionInput) {
      continue;
    }

    const rowErrors: TypeSessionRowFieldErrors = {};
    if (!hasType) {
      rowErrors.type = true;
    }
    if (!isValidSessionCount(sessionCount)) {
      rowErrors.sessions = true;
    }

    if (hasType && isValidSessionCount(sessionCount)) {
      if (seenTypeIds.has(typeId)) {
        rowErrors.type = true;
      } else {
        seenTypeIds.add(typeId);
        hasCompleteRow = true;
      }
    }

    if (Object.keys(rowErrors).length > 0) {
      rows[entry.id] = rowErrors;
    }
  }

  if (!hasCompleteRow) {
    const fallbackEntry =
      entries.find((entry) => entry.classTypeId.trim().length > 0 || entry.sessionCount.trim().length > 0) ??
      entries[0];
    if (fallbackEntry !== undefined) {
      const existing = rows[fallbackEntry.id] ?? {};
      rows[fallbackEntry.id] = {
        type: !fallbackEntry.classTypeId.trim() || existing.type === true,
        sessions: !isValidSessionCount(parseSessionsCount(fallbackEntry.sessionCount)) || existing.sessions === true,
      };
    }
  }

  return rows;
}

function typeSessionErrorMessageKey(error: TypeSessionValidationError): string {
  if (error === "duplicateType") {
    return "duplicateTypeError";
  }
  if (error === "missingType") {
    return "missingTypeError";
  }
  if (error === "invalidSessionCount") {
    return "invalidSessionCountError";
  }
  if (error === "empty") {
    return "emptyError";
  }
  return "invalidEntries";
}

export function validateTierFormFields(
  values: AdminPackageFormValues,
  entries: readonly PackageTypeSessionFormEntry[],
):
  | { ok: true }
  | { ok: false; errors: AdminPackageTierFieldErrors; typeSessionMessageKey: string | null; messageKey: string } {
  const errors: AdminPackageTierFieldErrors = {};
  let messageKey = "";

  if (values.name.trim().length === 0) {
    errors.name = true;
    messageKey = "sessionNameRequired";
  }

  const priceCents = parsePriceToCents(values.price);
  if (priceCents === null) {
    errors.price = true;
    messageKey = messageKey || "priceInvalid";
  }

  const periodDays = parseDurationDays(values.durationDays);
  if (
    periodDays === null ||
    periodDays < MIN_PACKAGE_DURATION_DAYS ||
    periodDays > MAX_PACKAGE_DURATION_DAYS
  ) {
    errors.duration = true;
    messageKey = messageKey || "durationDaysInvalid";
  }

  const discountAmountCents = parsePriceToCents(values.discountedPrice);
  if (values.discountedPrice.trim().length > 0) {
    if (discountAmountCents === null) {
      errors.discountedPrice = true;
      messageKey = messageKey || "discountedPriceInvalid";
    } else if (discountAmountCents < 0) {
      errors.discountedPrice = true;
      messageKey = messageKey || "discountedPriceNegative";
    } else if (priceCents !== null && discountAmountCents >= priceCents) {
      errors.discountedPrice = true;
      messageKey = messageKey || "discountedPriceLowerThanPrice";
    }
  }

  const typeSessionValidation = validateTypeSessionEntries(entries);
  let typeSessionMessageKey: string | null = null;
  if (!typeSessionValidation.ok) {
    errors.typeSessionRows = resolveTypeSessionRowFieldErrors(entries);
    typeSessionMessageKey = typeSessionErrorMessageKey(typeSessionValidation.error);
    messageKey = messageKey || typeSessionMessageKey;
  }

  if (hasTierFieldErrors(errors)) {
    return {
      ok: false,
      errors,
      typeSessionMessageKey,
      messageKey: messageKey || "genericError",
    };
  }

  return { ok: true };
}
