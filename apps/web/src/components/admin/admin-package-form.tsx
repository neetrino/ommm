"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminPackageFormSection } from "@/components/admin/admin-package-form-section";
import {
  createEmptyPackageFormValues,
  MAX_CATEGORY_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PACKAGE_DURATION_DAYS,
  MAX_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_DURATION_DAYS,
  MIN_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_SESSIONS,
  MAX_PACKAGE_SESSIONS,
  PACKAGE_DAYS_PER_MONTH,
  packageRowToFormValues,
  parseDurationDays,
  resolvePackageBillingPeriod,
  OMMM_INPUT_NUMBER_CLASS,
  parseGuestCount,
  parseSessionsCount,
  parsePriceToCents,
  preventNumberArrowStep,
  packageRowToTierFormValues,
  createEmptyTierFormValues,
  resolveTierPricePerSessionField,
  type AdminPackageFormValues,
} from "@/components/admin/admin-package-form-utils";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  categoryNamesToOptions,
  mergePackageCategoryOptions,
  resolvePackageCategoryName,
} from "@/components/admin/package-category-utils";
import { buildPackageTierSlug } from "@/components/admin/admin-package-tier-utils";
import { AdminPackageTypeSessionsFields } from "@/components/admin/admin-package-type-sessions-fields";
import {
  createEmptyTypeSessionEntry,
  initialTypeSessionEntries,
  sumTypeSessionEntries,
  validateTypeSessionEntries,
  type PackageTypeSessionFormEntry,
  type TypeSessionValidationError,
} from "@/components/admin/admin-package-type-sessions.util";
import { ApiError, apiFetch } from "@/lib/api";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";

export type AdminPackageFormMode = "create" | "edit" | "pricing" | "add-tier" | "edit-tier";

type CategoryOption = {
  id: string;
  label: string;
};

const FALLBACK_PACKAGE_SLUG_PREFIX = "package";

function buildPackageSlug(name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  if (normalized.length > 0) {
    return normalized;
  }
  const fallbackSuffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now()}`;
  return `${FALLBACK_PACKAGE_SLUG_PREFIX}-${fallbackSuffix}`;
}

type AdminPackageFormProps = {
  mode: AdminPackageFormMode;
  packageId?: string;
  initialCategoryName: string;
  categoryOptions: readonly CategoryOption[];
  classTypeOptions: readonly { id: string; name: string }[];
  initialPackage?: AdminPackageRow;
  nextDisplayOrder?: number;
  onSaved: (saved: AdminPackageRow) => void;
  onCancel: () => void;
};

function buildInitialValues(
  mode: AdminPackageFormMode,
  initialCategoryName: string,
  initialPackage?: AdminPackageRow,
): AdminPackageFormValues {
  if (mode === "edit-tier" && initialPackage !== undefined) {
    return packageRowToTierFormValues(initialPackage, initialCategoryName);
  }
  if (
    (mode === "edit" || mode === "pricing") &&
    initialPackage !== undefined
  ) {
    return packageRowToFormValues(initialPackage, initialCategoryName);
  }
  if (mode === "add-tier" && initialPackage !== undefined) {
    if (initialPackage.priceCents > 0) {
      return {
        ...packageRowToTierFormValues(initialPackage, initialCategoryName),
        guestCount: "",
        price: "",
        pricePerSession: "",
        durationDays: "",
      };
    }
    return createEmptyTierFormValues(initialCategoryName);
  }
  return createEmptyPackageFormValues(initialCategoryName);
}

export function AdminPackageForm({
  mode,
  packageId,
  initialCategoryName,
  categoryOptions,
  classTypeOptions,
  initialPackage,
  nextDisplayOrder,
  onSaved,
  onCancel,
}: AdminPackageFormProps) {
  const t = useTranslations("adminPages.packages");
  const formKey =
    mode === "create"
      ? "create"
      : mode === "add-tier"
        ? `add-tier-${initialCategoryName}-${packageId ?? "new"}`
        : mode === "edit-tier"
          ? `edit-tier-${packageId ?? "unknown"}`
          : packageId !== undefined
          ? `${mode}-${packageId}`
          : mode;
  const [values, setValues] = useState<AdminPackageFormValues>(() =>
    buildInitialValues(mode, initialCategoryName, initialPackage),
  );
  const [typeSessionEntries, setTypeSessionEntries] = useState<PackageTypeSessionFormEntry[]>(() =>
    mode === "add-tier" || mode === "edit-tier"
      ? initialTypeSessionEntries(mode === "edit-tier" ? initialPackage : undefined)
      : [],
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryNamesFromApi, setCategoryNamesFromApi] = useState<readonly string[]>([]);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (mode !== "add-tier" && mode !== "edit-tier") {
      return;
    }
    setTypeSessionEntries(
      initialTypeSessionEntries(mode === "edit-tier" ? initialPackage : undefined),
    );
  }, [formKey, initialPackage, mode]);

  useEffect(() => {
    let cancelled = false;
    void apiFetch<string[]>("/packages/admin/categories")
      .then((names) => {
        if (!cancelled) {
          setCategoryNamesFromApi(names);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategoryNamesFromApi([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mergedCategoryOptions = useMemo(() => {
    const fromProps = categoryNamesToOptions(categoryOptions.map((option) => option.label));
    const fromApi = categoryNamesToOptions(categoryNamesFromApi);
    const merged = mergePackageCategoryOptions(fromProps, [
      ...fromApi.map((option) => option.label),
      ...(values.categoryName.length > 0 ? [values.categoryName] : []),
    ]);
    return merged;
  }, [categoryNamesFromApi, categoryOptions, values.categoryName]);

  const categoryNameCandidates = useMemo(
    () => mergedCategoryOptions.map((option) => option.label),
    [mergedCategoryOptions],
  );
  const classTypeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const classType of classTypeOptions) {
      map.set(classType.id, classType.name.trim());
    }
    return map;
  }, [classTypeOptions]);

  function updateValues(patch: Partial<AdminPackageFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function updateTierPricingValues(patch: Partial<AdminPackageFormValues>) {
    setValues((current) => {
      const next = { ...current, ...patch };
      if ("price" in patch || "discountedPrice" in patch) {
        const sessionsCount = String(sumTypeSessionEntries(typeSessionEntries));
        const derived = resolveTierPricePerSessionField(
          next.price,
          sessionsCount,
          next.discountedPrice,
        );
        next.pricePerSession =
          derived.length > 0 ? derived : next.pricePerSession;
      }
      return next;
    });
  }

  function resolveTypeSessionErrorMessage(error: TypeSessionValidationError): string {
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }

    setError(null);

    const isCreateMode = mode === "create";
    const isPricingMode = mode === "pricing";
    const isAddTierMode = mode === "add-tier";
    const isEditTierMode = mode === "edit-tier";
    const isEditMode = mode === "edit";
    const detailsName = values.name.trim();
    const description = values.description.trim();
    const createCategoryName = resolvePackageCategoryName(
      detailsName,
      categoryNameCandidates,
    );
    const tierCategoryName = resolvePackageCategoryName(
      initialCategoryName.trim(),
      categoryNameCandidates,
    );
    const selectedClassTypeName = classTypeNameById.get(values.classTypeId) ?? "";
    const selectedClassCategoryName =
      selectedClassTypeName.length > 0
        ? resolvePackageCategoryName(selectedClassTypeName, categoryNameCandidates)
        : "";
    const editableCategoryName = resolvePackageCategoryName(
      values.categoryName.trim(),
      categoryNameCandidates,
    );
    const categoryName = isCreateMode
      ? createCategoryName
      : isAddTierMode
        ? tierCategoryName
        : isEditMode && selectedClassCategoryName.length > 0
          ? selectedClassCategoryName
        : editableCategoryName;

    const priceCents = parsePriceToCents(values.price);
    const discountAmountCents = parsePriceToCents(values.discountedPrice);
    const parsedSessionsPerMonth = parseSessionsCount(values.sessionsCount);
    const periodDays = parseDurationDays(values.durationDays);
    const guestCount = parseGuestCount(values.guestCount);
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
    const slug = buildPackageSlug(slugSource);
    const payloadName = usesSessionNameField ? sessionName : detailsName;

    if (isCreateMode || isEditMode) {
      if (detailsName.length === 0) {
        setError(t("nameRequired"));
        return;
      }
      if (detailsName.length > MAX_NAME_LENGTH) {
        setError(t("nameTooLong"));
        return;
      }
      if (isEditMode) {
        if (values.classTypeId.trim().length === 0) {
          setError(t("classTypeRequired"));
          return;
        }
        if (categoryName.length === 0) {
          setError(t("categoryRequired"));
          return;
        }
        if (categoryName.length > MAX_CATEGORY_NAME_LENGTH) {
          setError(t("categoryTooLong"));
          return;
        }
        if (description.length > MAX_DESCRIPTION_LENGTH) {
          setError(t("descriptionTooLong"));
          return;
        }
      }
    }

    if (isAddTierMode && categoryName.length === 0) {
      setError(t("categoryRequired"));
      return;
    }

    if (usesSessionNameField) {
      if (sessionName.length === 0) {
        setError(t("sessionNameRequired"));
        return;
      }
      if (sessionName.length > MAX_NAME_LENGTH) {
        setError(t("sessionNameTooLong"));
        return;
      }
    }

    if (isPricingMode || isEditMode || isAddTierMode || isEditTierMode) {
      if (priceCents === null) {
        setError(t("priceInvalid"));
        return;
      }
      if (values.discountedPrice.trim().length > 0) {
        if (discountAmountCents === null) {
          setError(t("discountedPriceInvalid"));
          return;
        }
        if (discountAmountCents < 0) {
          setError(t("discountedPriceNegative"));
          return;
        }
        if (discountAmountCents >= priceCents) {
          setError(t("discountedPriceLowerThanPrice"));
          return;
        }
      }
      if (
        periodDays === null ||
        periodDays < MIN_PACKAGE_DURATION_DAYS ||
        periodDays > MAX_PACKAGE_DURATION_DAYS
      ) {
        setError(t("durationDaysInvalid"));
        return;
      }
      if (
        !isAddTierMode &&
        !isEditTierMode &&
        (parsedSessionsPerMonth === null ||
          parsedSessionsPerMonth < MIN_PACKAGE_SESSIONS ||
          parsedSessionsPerMonth > MAX_PACKAGE_SESSIONS)
      ) {
        setError(t("sessionsCountInvalid"));
        return;
      }
      if (
        values.guestCount.trim().length > 0 &&
        (guestCount === null ||
          guestCount < MIN_PACKAGE_GUEST_COUNT ||
          guestCount > MAX_PACKAGE_GUEST_COUNT)
      ) {
        setError(t("guestCountInvalid"));
        return;
      }
    }

    let typeSessionAllocations: Array<{ classTypeId: string; sessionCount: number }> | undefined;
    let resolvedSessionsPerMonth = parsedSessionsPerMonth;
    if (isAddTierMode || isEditTierMode) {
      const typeSessionValidation = validateTypeSessionEntries(typeSessionEntries);
      if (!typeSessionValidation.ok) {
        setError(resolveTypeSessionErrorMessage(typeSessionValidation.error));
        return;
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
              String(discountAmountCents ?? ""),
            ),
          )
        : null);
    if (
      resolvedSessionsPerMonth === null ||
      resolvedSessionsPerMonth < MIN_PACKAGE_SESSIONS ||
      resolvedSessionsPerMonth > MAX_PACKAGE_SESSIONS
    ) {
      setError(t("sessionsCountInvalid"));
      return;
    }

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
      priceCents: priceCents ?? 0,
      discountedPriceCents:
        values.discountedPrice.trim().length > 0 && discountAmountCents !== null
          ? (priceCents ?? 0) - discountAmountCents
          : null,
      ...(isAddTierMode || isEditTierMode
        ? { pricePerSessionCents: pricePerSessionCents ?? 0 }
        : {}),
      showPricePerSession: values.showPricePerSession,
      currency: "AMD" as const,
      isUnlimited: false,
      sessionsPerMonth: resolvedSessionsPerMonth,
      guestCount: guestCount ?? 0,
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

    const payload = isCreateMode
      ? {
          name: payloadName,
          categoryName,
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
          isActive: true,
        }
      : isAddTierMode
        ? shellTierTarget
          ? {
              name: payloadName,
              ...(tierClassTypeId.length > 0 ? { classTypeId: tierClassTypeId } : {}),
              ...pricingFields,
            }
          : {
              name: payloadName,
              ...(tierClassTypeId.length > 0 ? { classTypeId: tierClassTypeId } : {}),
              categoryName,
              slug: buildPackageTierSlug(categoryName, resolvedSessionsPerMonth),
              description: initialPackage?.description ?? null,
              ...pricingFields,
              displayOrder: nextDisplayOrder ?? 1,
              isPopular: false,
              isActive: true,
            }
        : isPricingMode
          ? {
              name: payloadName,
              ...pricingFields,
              isPopular: values.isPopular,
              isActive: values.isActive,
            }
          : isEditTierMode
            ? {
                name: payloadName,
                ...pricingFields,
                isPopular: initialPackage?.isPopular ?? false,
                isActive: initialPackage?.isActive ?? true,
              }
            : {
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

    const shouldPatch =
      (isEditMode || isPricingMode || isEditTierMode || shellTierTarget) &&
      packageId !== undefined;

    submitLockRef.current = true;
    setPending(true);
    try {
      const saved = shouldPatch
        ? await apiFetch<AdminPackageRow>(`/packages/plans/${packageId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiFetch<AdminPackageRow>("/packages/plans", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError(t("genericError"));
      }
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form
      key={formKey}
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div
        className={`flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6${
          mode === "create" || mode === "add-tier" || mode === "edit-tier" ? "" : ""
        }`}
      >
      {mode === "create" ? (
        <label className="flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldGroupName")}</span>
          <input
            name="name"
            className="ommm-input"
            maxLength={MAX_NAME_LENGTH}
            value={values.name}
            onChange={(event) => updateValues({ name: event.target.value })}
            placeholder={t("fieldGroupNamePlaceholder")}
            disabled={pending}
          />
        </label>
      ) : mode === "edit" ? (
        <AdminPackageFormSection
          heading={t("formSections.details.heading")}
          description={t("formSections.details.description")}
        >
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldGroupName")}</span>
              <input
                name="name"
                className="ommm-input"
                maxLength={MAX_NAME_LENGTH}
                value={values.name}
                onChange={(event) => updateValues({ name: event.target.value })}
                disabled={pending}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">
                {t("fieldClassType")}
              </span>
              <OmmFormDropdown
                value={values.classTypeId}
                ariaLabel={t("fieldClassType")}
                placeholderLabel={t("fieldClassTypePlaceholder")}
                options={classTypeOptions.map((classType) => ({
                  value: classType.id,
                  label: classType.name,
                }))}
                onChange={(nextValue) => updateValues({ classTypeId: nextValue })}
                disabled={pending}
                name="classTypeId"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDescription")}</span>
              <textarea
                name="description"
                className="ommm-input min-h-24 resize-y"
                maxLength={MAX_DESCRIPTION_LENGTH}
                value={values.description}
                onChange={(event) => updateValues({ description: event.target.value })}
                disabled={pending}
              />
            </label>
          </div>
        </AdminPackageFormSection>
      ) : null}

      {mode === "add-tier" || mode === "edit-tier" ? (
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("fieldPageName")}
            </span>
            <input
              name="name"
              className="ommm-input"
              maxLength={MAX_NAME_LENGTH}
              value={values.name}
              onChange={(event) => updateValues({ name: event.target.value })}
              placeholder={t("fieldPageNamePlaceholder")}
              required
              disabled={pending}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldPrice")}</span>
              <AmdMoneyInput
                name="price"
                value={values.price}
                onValueChange={(nextValue) => updateTierPricingValues({ price: nextValue })}
                disabled={pending}
                required
                align="start"
                placeholder={t("fieldPricePlaceholder")}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">
                {t("fieldDiscountedPrice")}
              </span>
              <AmdMoneyInput
                name="discountedPrice"
                value={values.discountedPrice}
                onValueChange={(nextValue) => updateTierPricingValues({ discountedPrice: nextValue })}
                disabled={pending}
                align="start"
                placeholder={t("fieldDiscountedPricePlaceholder")}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDurationDays")}</span>
              <input
                name="durationDays"
                type="number"
                className={OMMM_INPUT_NUMBER_CLASS}
                min={MIN_PACKAGE_DURATION_DAYS}
                max={MAX_PACKAGE_DURATION_DAYS}
                step={1}
                inputMode="numeric"
                value={values.durationDays}
                onChange={(event) => updateValues({ durationDays: event.target.value })}
                onKeyDown={preventNumberArrowStep}
                placeholder={t("fieldDurationDaysPlaceholder")}
                required
                disabled={pending}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldGuestCount")}</span>
              <input
                name="guestCount"
                type="number"
                className={OMMM_INPUT_NUMBER_CLASS}
                min={MIN_PACKAGE_GUEST_COUNT}
                max={MAX_PACKAGE_GUEST_COUNT}
                step={1}
                inputMode="numeric"
                value={values.guestCount}
                onChange={(event) => updateValues({ guestCount: event.target.value })}
                onKeyDown={preventNumberArrowStep}
                placeholder={t("fieldGuestCountPlaceholder")}
                disabled={pending}
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 border-t border-[rgba(212,196,183,0.25)] pt-4">
            <p className="ommm-label text-xs uppercase tracking-wide">
              {t("formSections.typeSessions.heading")}
            </p>
            <AdminPackageTypeSessionsFields
              entries={typeSessionEntries}
              classTypeOptions={classTypeOptions}
              disabled={pending}
              onChange={setTypeSessionEntries}
              onAddRow={() =>
                setTypeSessionEntries((current) => [...current, createEmptyTypeSessionEntry()])
              }
              onRemoveRow={(entryId) =>
                setTypeSessionEntries((current) =>
                  current.length <= 1 ? current : current.filter((entry) => entry.id !== entryId),
                )
              }
            />
          </div>
        </div>
      ) : null}

      {mode === "pricing" || mode === "edit" ? (
        <>
          <AdminPackageFormSection
            heading={t("formSections.pricing.heading")}
            description={t("formSections.pricing.description")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldPrice")}</span>
                <AmdMoneyInput
                  name="price"
                  value={values.price}
                  onValueChange={(nextValue) => updateValues({ price: nextValue })}
                  required
                  disabled={pending}
                  align="start"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="ommm-label text-xs uppercase tracking-wide">
                  {t("fieldDiscountedPrice")}
                </span>
                <AmdMoneyInput
                  name="discountedPrice"
                  value={values.discountedPrice}
                  onValueChange={(nextValue) => updateValues({ discountedPrice: nextValue })}
                  disabled={pending}
                  align="start"
                  placeholder={t("fieldDiscountedPricePlaceholder")}
                />
                <span className="text-xs text-sage-500">{t("fieldDiscountedPriceHint")}</span>
              </label>
            </div>
          </AdminPackageFormSection>

          <AdminPackageFormSection
            heading={t("formSections.session.heading")}
            description={t("formSections.session.description")}
          >
            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="ommm-label text-xs uppercase tracking-wide">
                  {t("fieldSessionsCount")}
                </span>
                <input
                  name="sessionsCount"
                  type="number"
                  className={OMMM_INPUT_NUMBER_CLASS}
                  min={MIN_PACKAGE_SESSIONS}
                  max={MAX_PACKAGE_SESSIONS}
                  step={1}
                  inputMode="numeric"
                  value={values.sessionsCount}
                  onChange={(event) => updateValues({ sessionsCount: event.target.value })}
                  onKeyDown={preventNumberArrowStep}
                  placeholder={t("fieldSessionsCountPlaceholder")}
                  required
                  disabled={pending}
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="ommm-label text-xs uppercase tracking-wide">
                  {t("fieldSessionName")}
                </span>
                <input
                  name="name"
                  className="ommm-input"
                  maxLength={MAX_NAME_LENGTH}
                  value={values.name}
                  onChange={(event) => updateValues({ name: event.target.value })}
                  placeholder={t("fieldSessionNamePlaceholder")}
                  required
                  disabled={pending}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="ommm-label text-xs uppercase tracking-wide">
                  {t("fieldDurationDays")}
                </span>
                <input
                  name="durationDays"
                  type="number"
                  className={OMMM_INPUT_NUMBER_CLASS}
                  min={MIN_PACKAGE_DURATION_DAYS}
                  max={MAX_PACKAGE_DURATION_DAYS}
                  step={1}
                  inputMode="numeric"
                  value={values.durationDays}
                  onChange={(event) => updateValues({ durationDays: event.target.value })}
                  onKeyDown={preventNumberArrowStep}
                  placeholder={t("fieldDurationDaysPlaceholder")}
                  required
                  disabled={pending}
                />
                <span className="text-xs text-sage-500">{t("fieldValidityHint")}</span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="ommm-label text-xs uppercase tracking-wide">
                  {t("fieldGuestCount")}
                </span>
                <input
                  name="guestCount"
                  type="number"
                  className={OMMM_INPUT_NUMBER_CLASS}
                  min={MIN_PACKAGE_GUEST_COUNT}
                  max={MAX_PACKAGE_GUEST_COUNT}
                  step={1}
                  inputMode="numeric"
                  value={values.guestCount}
                  onChange={(event) => updateValues({ guestCount: event.target.value })}
                  onKeyDown={preventNumberArrowStep}
                  placeholder={t("fieldGuestCountPlaceholder")}
                  disabled={pending}
                />
                <span className="text-xs text-sage-500">{t("fieldGuestCountHint")}</span>
              </label>
            </div>
          </AdminPackageFormSection>

          {mode === "pricing" || mode === "edit" ? (
          <AdminPackageFormSection
            heading={t("formSections.visibility.heading")}
            description={t("formSections.visibility.description")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 transition-[background-color,border-color,box-shadow] hover:border-white hover:bg-white hover:shadow-sm focus-within:ring-2 focus-within:ring-sand-500/20 has-[:checked]:border-sand-500/40 has-[:checked]:bg-sand-50/60 has-[:disabled]:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={values.isPopular}
                  onChange={(event) => updateValues({ isPopular: event.target.checked })}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-sage-300 text-sand-600 focus:ring-sand-500/30"
                  disabled={pending}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-sage-800">{t("fieldPopular")}</span>
                  <span className="text-xs text-sage-500">{t("fieldPopularHint")}</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 transition-[background-color,border-color,box-shadow] hover:border-white hover:bg-white hover:shadow-sm focus-within:ring-2 focus-within:ring-sand-500/20 has-[:checked]:border-sand-500/40 has-[:checked]:bg-sand-50/60 has-[:disabled]:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={values.isActive}
                  onChange={(event) => updateValues({ isActive: event.target.checked })}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-sage-300 text-sand-600 focus:ring-sand-500/30"
                  disabled={pending}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-sage-800">{t("fieldActive")}</span>
                  <span className="text-xs text-sage-500">{t("fieldActiveHint")}</span>
                </span>
              </label>
            </div>
          </AdminPackageFormSection>
          ) : null}
        </>
      ) : null}

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">
          {error}
        </p>
      ) : null}
      </div>

      <div className="shrink-0 flex w-full flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/85 px-5 py-4 backdrop-blur-sm sm:rounded-b-[28px] sm:px-7">
        <OmmButton type="button" variant="secondary" size="md" onClick={onCancel} disabled={pending}>
          {t("cancelButton")}
        </OmmButton>
        <OmmButton type="submit" variant="primary" size="md" disabled={pending}>
          {pending
            ? t("savingButton")
            : mode === "create"
              ? t("createButton")
              : mode === "pricing"
              ? t("savePricingButton")
              : mode === "add-tier"
                ? t("saveTierButton")
                : mode === "edit-tier"
                  ? t("saveTierChangesButton")
                  : t("saveButton")}
        </OmmButton>
      </div>
    </form>
  );
}
