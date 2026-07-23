import {
  buildPackageSlug,
  FALLBACK_PACKAGE_SLUG_PREFIX,
} from "@/components/admin/admin-package-form.helpers";
import type { AdminPackageFormSubmitPrepared } from "@/components/admin/admin-package-form-submit.types";
import type { AdminPackageFormSubmitParams } from "@/components/admin/admin-package-form-submit.types";
import {
  MAX_CATEGORY_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PACKAGE_DURATION_DAYS,
  MAX_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_DURATION_DAYS,
  MIN_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_STOCK_COUNT,
  MAX_PACKAGE_STOCK_COUNT,
  MIN_PACKAGE_SESSIONS,
  MAX_PACKAGE_SESSIONS,
  parseDurationDays,
  parseGuestCount,
  parseStockCount,
  parseSessionsCount,
  parsePriceToCents,
  resolveTierPricePerSessionField,
} from "@/components/admin/admin-package-form-utils";
import {
  normalizePackageCategoryLabel,
  resolvePackageCategoryName,
  buildUniquePackageCategorySlug,
  resolvePackageCategorySlug,
} from "@/components/admin/package-category-utils";
import {
  validateTypeSessionEntries,
  type TypeSessionValidationError,
} from "@/components/admin/admin-package-type-sessions.util";
import {
  collectTierFieldErrors,
  type TierFocusField,
} from "@/components/admin/admin-package-tier-field-errors";
import type { PackageTranslateFn } from "@/components/admin/admin-package-form-submit.types";

type PrepareResult =
  | { ok: true; prepared: AdminPackageFormSubmitPrepared }
  | { ok: false; error: string; focusField?: TierFocusField };

function resolveTypeSessionErrorMessage(
  error: TypeSessionValidationError,
  t: PackageTranslateFn,
): string {
  const typeSessionsT = (key: string) => t(`typeSessionsForm.${key}`);
  if (error === "duplicateType") {
    return typeSessionsT("duplicateTypeError");
  }
  if (error === "missingType") {
    return typeSessionsT("missingTypeError");
  }
  if (error === "invalidSessionCount") {
    return typeSessionsT("invalidSessionCountError");
  }
  if (error === "empty") {
    return typeSessionsT("emptyError");
  }
  return typeSessionsT("invalidEntries");
}

export function prepareAdminPackageFormSubmit(
  params: AdminPackageFormSubmitParams,
): PrepareResult {
  const {
    mode,
    packageId,
    initialCategoryName,
    initialPackage,
    nextDisplayOrder,
    values,
    typeSessionEntries,
    categoryOptions,
    mergedCategoryOptions,
    categoryNameCandidates,
    classTypeNameById,
    t,
    setTierFieldErrors,
  } = params;

  const isCreateMode = mode === "create";
  const isPricingMode = mode === "pricing";
  const isAddTierMode = mode === "add-tier";
  const isEditTierMode = mode === "edit-tier";
  const isEditMode = mode === "edit";

  if (isAddTierMode || isEditTierMode) {
    const tierValidation = collectTierFieldErrors(values, typeSessionEntries);
    if (tierValidation !== null) {
      setTierFieldErrors(tierValidation.errors);
      return {
        ok: false,
        error:
          tierValidation.messageScope === "typeSessions"
            ? t(`typeSessionsForm.${tierValidation.messageKey}`)
            : t(tierValidation.messageKey),
        focusField: tierValidation.focusField,
      };
    }
    setTierFieldErrors({});
  }

  const detailsName = values.name.trim();
  const description = values.description.trim();
  const createCategoryName = normalizePackageCategoryLabel(detailsName);
  const tierCategorySlug = resolvePackageCategorySlug(
    initialCategoryName.trim(),
    initialPackage !== undefined ? [initialPackage] : categoryOptions.map((option) => ({
      categoryName: option.label,
      categorySlug: option.id,
      slug: option.id,
    })),
  );
  const tierCategoryOption = mergedCategoryOptions.find((option) => option.id === tierCategorySlug);
  const tierCategoryName =
    tierCategoryOption?.label ??
    (normalizePackageCategoryLabel(initialCategoryName) ||
      normalizePackageCategoryLabel(initialPackage?.categoryName ?? ""));
  const selectedClassTypeName = classTypeNameById.get(values.classTypeId) ?? "";
  const selectedClassCategoryName =
    selectedClassTypeName.length > 0
      ? resolvePackageCategoryName(selectedClassTypeName, categoryNameCandidates)
      : "";
  const editableCategoryName = normalizePackageCategoryLabel(values.categoryName.trim());
  const categoryName = isCreateMode
    ? createCategoryName
    : isAddTierMode
      ? tierCategoryName
      : isEditMode && selectedClassCategoryName.length > 0
        ? selectedClassCategoryName
        : editableCategoryName;

  const priceCents = parsePriceToCents(values.price);
  const discountedPriceCents = parsePriceToCents(values.discountedPrice);
  const parsedSessionsPerMonth = parseSessionsCount(values.sessionsCount);
  const periodDays = parseDurationDays(values.durationDays);
  const guestCount = parseGuestCount(values.guestCount);
  const stockCount = parseStockCount(values.stockCount);
  const tierClassTypeId = (initialPackage?.classTypeId ?? values.classTypeId).trim();
  const sessionName = values.name.trim();
  const isTierPackage =
    initialPackage !== undefined && initialPackage.priceCents > 0;
  const usesSessionNameField =
    isPricingMode || isAddTierMode || isEditTierMode || (isEditMode && isTierPackage);
  const slugSource = usesSessionNameField
    ? sessionName
    : detailsName.length > 0
      ? detailsName
      : initialPackage?.name ?? FALLBACK_PACKAGE_SLUG_PREFIX;
  const slug = isCreateMode
    ? buildUniquePackageCategorySlug(slugSource)
    : buildPackageSlug(slugSource);
  const payloadName = usesSessionNameField ? sessionName : detailsName;

  if (isCreateMode || isEditMode) {
    if (detailsName.length === 0) {
      return { ok: false, error: t("nameRequired") };
    }
    if (detailsName.length > MAX_NAME_LENGTH) {
      return { ok: false, error: t("nameTooLong") };
    }
    if (isEditMode) {
      if (values.classTypeId.trim().length === 0) {
        return { ok: false, error: t("classTypeRequired") };
      }
      if (categoryName.length === 0) {
        return { ok: false, error: t("categoryRequired") };
      }
      if (categoryName.length > MAX_CATEGORY_NAME_LENGTH) {
        return { ok: false, error: t("categoryTooLong") };
      }
      if (description.length > MAX_DESCRIPTION_LENGTH) {
        return { ok: false, error: t("descriptionTooLong") };
      }
    }
  }

  if (isAddTierMode && categoryName.length === 0) {
    return { ok: false, error: t("categoryRequired") };
  }

  if (usesSessionNameField) {
    if (sessionName.length === 0) {
      return { ok: false, error: t("sessionNameRequired") };
    }
    if (sessionName.length > MAX_NAME_LENGTH) {
      return { ok: false, error: t("sessionNameTooLong") };
    }
  }

  if (isPricingMode || isEditMode || isAddTierMode || isEditTierMode) {
    if (priceCents === null) {
      return { ok: false, error: t("priceInvalid") };
    }
    if (values.discountedPrice.trim().length > 0) {
      if (discountedPriceCents === null) {
        return { ok: false, error: t("discountedPriceInvalid") };
      }
      if (discountedPriceCents < 0) {
        return { ok: false, error: t("discountedPriceNegative") };
      }
      if (discountedPriceCents >= priceCents) {
        return { ok: false, error: t("discountedPriceLowerThanPrice") };
      }
    }
    if (
      periodDays === null ||
      periodDays < MIN_PACKAGE_DURATION_DAYS ||
      periodDays > MAX_PACKAGE_DURATION_DAYS
    ) {
      return { ok: false, error: t("durationDaysInvalid") };
    }
    if (
      !isAddTierMode &&
      !isEditTierMode &&
      (parsedSessionsPerMonth === null ||
        parsedSessionsPerMonth < MIN_PACKAGE_SESSIONS ||
        parsedSessionsPerMonth > MAX_PACKAGE_SESSIONS)
    ) {
      return { ok: false, error: t("sessionsCountInvalid") };
    }
    if (
      values.guestCount.trim().length > 0 &&
      (guestCount === null ||
        guestCount < MIN_PACKAGE_GUEST_COUNT ||
        guestCount > MAX_PACKAGE_GUEST_COUNT)
    ) {
      return { ok: false, error: t("guestCountInvalid") };
    }
    if (
      (isAddTierMode || isEditTierMode) &&
      values.stockCount.trim().length > 0 &&
      (stockCount === null ||
        stockCount < MIN_PACKAGE_STOCK_COUNT ||
        stockCount > MAX_PACKAGE_STOCK_COUNT)
    ) {
      return { ok: false, error: t("stockCountInvalid") };
    }
  }

  let typeSessionAllocations: Array<{ classTypeId: string; sessionCount: number }> | undefined;
  let resolvedSessionsPerMonth = parsedSessionsPerMonth;
  if (isAddTierMode || isEditTierMode) {
    const typeSessionValidation = validateTypeSessionEntries(typeSessionEntries);
    if (!typeSessionValidation.ok) {
      return {
        ok: false,
        error: resolveTypeSessionErrorMessage(typeSessionValidation.error, t),
        focusField: "typeSessions",
      };
    }
    typeSessionAllocations = typeSessionValidation.payload;
    resolvedSessionsPerMonth = typeSessionValidation.payload.reduce(
      (sum, allocation) => sum + allocation.sessionCount,
      0,
    );
  }
  const pricePerSessionCents =
    parsePriceToCents(values.pricePerSession) ??
    (priceCents !== null && resolvedSessionsPerMonth !== null
      ? parsePriceToCents(
          resolveTierPricePerSessionField(
            String(priceCents),
            String(resolvedSessionsPerMonth),
            String(discountedPriceCents ?? ""),
          ),
        )
      : null);
  if (
    resolvedSessionsPerMonth === null ||
    resolvedSessionsPerMonth < MIN_PACKAGE_SESSIONS ||
    resolvedSessionsPerMonth > MAX_PACKAGE_SESSIONS
  ) {
    return { ok: false, error: t("sessionsCountInvalid") };
  }

  if (!isCreateMode && priceCents === null) {
    return { ok: false, error: t("priceInvalid") };
  }

  return {
    ok: true,
    prepared: {
      mode,
      packageId,
      initialPackage,
      nextDisplayOrder,
      values,
      isCreateMode,
      isPricingMode,
      isAddTierMode,
      isEditTierMode,
      isEditMode,
      description,
      createCategoryName,
      tierCategorySlug,
      tierCategoryName,
      categoryName,
      priceCents: priceCents ?? 0,
      discountedPriceCents,
      periodDays,
      guestCount,
      stockCount,
      tierClassTypeId,
      payloadName,
      slug,
      isTierPackage,
      resolvedSessionsPerMonth,
      typeSessionAllocations,
      pricePerSessionCents,
    },
  };
}
