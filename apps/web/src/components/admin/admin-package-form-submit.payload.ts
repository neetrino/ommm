import type { AdminPackageFormSubmitPrepared } from "@/components/admin/admin-package-form-submit.types";
import {
  PACKAGE_DAYS_PER_MONTH,
  resolvePackageBillingPeriod,
  resolvePackageActiveFromStock,
} from "@/components/admin/admin-package-form-utils";
import { buildPackageTierSlug } from "@/components/admin/admin-package-tier-utils";

export function buildAdminPackageFormSubmitPayload(
  prepared: AdminPackageFormSubmitPrepared,
): Record<string, unknown> {
  const {
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
    priceCents,
    discountAmountCents,
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
  } = prepared;

  const preservedDisplayFields =
    (isEditMode || isPricingMode) && initialPackage !== undefined
      ? {
          features: initialPackage.features,
          buttonLabel: initialPackage.buttonLabel,
          displayOrder: initialPackage.displayOrder,
        }
      : {};

  const tierBillingPeriod = resolvePackageBillingPeriod(initialPackage);
  const pricingFields = {
    priceCents,
    discountedPriceCents:
      values.discountedPrice.trim().length > 0 && discountAmountCents !== null
        ? priceCents - discountAmountCents
        : null,
    ...(isAddTierMode || isEditTierMode
      ? { pricePerSessionCents: pricePerSessionCents ?? 0 }
      : {}),
    showPricePerSession: values.showPricePerSession,
    currency: "AMD" as const,
    isUnlimited: false,
    sessionsPerMonth: resolvedSessionsPerMonth,
    guestCount: guestCount ?? 0,
    availableQuantity:
      isAddTierMode || isEditTierMode
        ? values.stockCount.trim().length > 0
          ? (stockCount ?? null)
          : null
        : undefined,
    periodDays: periodDays ?? PACKAGE_DAYS_PER_MONTH,
    billingPeriod: tierBillingPeriod,
    ...(typeSessionAllocations !== undefined ? { typeSessionAllocations } : {}),
  };

  const shellTierTarget =
    isAddTierMode &&
    packageId !== undefined &&
    initialPackage !== undefined &&
    initialPackage.priceCents <= 0;
  const shouldIncludeSlugInPayload =
    isCreateMode ||
    (isAddTierMode && !shellTierTarget) ||
    (isEditMode && !isTierPackage);

  if (isCreateMode) {
    return {
      name: payloadName,
      categoryName: createCategoryName,
      categorySlug: slug,
      slug,
      priceCents: 0,
      currency: "AMD",
      isUnlimited: false,
      sessionsPerMonth: 0,
      guestCount: 0,
      periodDays: PACKAGE_DAYS_PER_MONTH,
      billingPeriod: "monthly",
      displayOrder: nextDisplayOrder ?? 1,
      isPopular: false,
      isActive: false,
    };
  }

  if (isAddTierMode) {
    if (shellTierTarget) {
      return {
        name: payloadName,
        ...(tierClassTypeId.length > 0 ? { classTypeId: tierClassTypeId } : {}),
        ...pricingFields,
      };
    }
    return {
      name: payloadName,
      ...(tierClassTypeId.length > 0 ? { classTypeId: tierClassTypeId } : {}),
      categoryName: tierCategoryName,
      categorySlug: tierCategorySlug,
      slug: buildPackageTierSlug(tierCategorySlug, resolvedSessionsPerMonth),
      description: initialPackage?.description ?? null,
      ...pricingFields,
      displayOrder: nextDisplayOrder ?? 1,
      isPopular: false,
      isActive: false,
    };
  }

  if (isPricingMode) {
    return {
      name: payloadName,
      ...pricingFields,
      isPopular: values.isPopular,
      isActive: resolvePackageActiveFromStock({
        stockCount,
        stockFieldProvided: values.stockCount.trim().length > 0,
        currentIsActive: values.isActive,
      }),
    };
  }

  if (isEditTierMode) {
    return {
      name: payloadName,
      ...pricingFields,
      isPopular: initialPackage?.isPopular ?? false,
      isActive: resolvePackageActiveFromStock({
        stockCount,
        stockFieldProvided: values.stockCount.trim().length > 0,
        currentIsActive: initialPackage?.isActive ?? true,
      }),
    };
  }

  return {
    name: payloadName,
    classTypeId: values.classTypeId,
    categoryName,
    ...(shouldIncludeSlugInPayload ? { slug } : {}),
    description: description.length > 0 ? description : null,
    ...pricingFields,
    ...preservedDisplayFields,
    isPopular: values.isPopular,
    isActive: values.isActive,
  };
}

export function resolveAdminPackageFormShouldPatch(
  prepared: AdminPackageFormSubmitPrepared,
): boolean {
  const shellTierTarget =
    prepared.isAddTierMode &&
    prepared.packageId !== undefined &&
    prepared.initialPackage !== undefined &&
    prepared.initialPackage.priceCents <= 0;

  return (
    (prepared.isEditMode ||
      prepared.isPricingMode ||
      prepared.isEditTierMode ||
      shellTierTarget) &&
    prepared.packageId !== undefined
  );
}
