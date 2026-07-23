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
import {
  validateTypeSessionEntries,
  type PackageTypeSessionFormEntry,
  type TypeSessionValidationError,
} from "@/components/admin/admin-package-type-sessions.util";

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

/** Form control / section to scroll into view on tier validation errors. */
export type TierFocusField =
  | "name"
  | "price"
  | "durationDays"
  | "discountedPrice"
  | "stockCount"
  | "typeSessions";

const TIER_FOCUS_FIELD_BY_ERROR: Record<
  Exclude<keyof TierFieldErrors, "typeSessionRows">,
  TierFocusField
> = {
  name: "name",
  price: "price",
  duration: "durationDays",
  discountedPrice: "discountedPrice",
  stockCount: "stockCount",
};

export function resolveTierFocusField(errors: TierFieldErrors): TierFocusField {
  for (const key of Object.keys(TIER_FOCUS_FIELD_BY_ERROR) as Array<
    Exclude<keyof TierFieldErrors, "typeSessionRows">
  >) {
    if (errors[key] === true) {
      return TIER_FOCUS_FIELD_BY_ERROR[key];
    }
  }
  if (errors.typeSessionRows !== undefined) {
    return "typeSessions";
  }
  return "name";
}

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
  | {
      errors: TierFieldErrors;
      messageKey: string;
      messageScope: "packages" | "typeSessions";
      focusField: TierFocusField;
    }
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
    focusField: resolveTierFocusField(errors),
  };
}
