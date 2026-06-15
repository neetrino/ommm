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
  buildPackageSessionNameFromCount,
  packageRowToTierFormValues,
  createEmptyTierFormValues,
  resolveTierPricePerSessionField,
  type AdminPackageFormValues,
} from "@/components/admin/admin-package-form-utils";
import { AdminPackageCategorySelect } from "@/components/admin/admin-package-category-select";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  categoryNamesToOptions,
  mergePackageCategoryOptions,
  resolvePackageCategoryName,
} from "@/components/admin/package-category-utils";
import { buildPackageTierSlug } from "@/components/admin/admin-package-tier-utils";
import { AdminCombinedTierSessionAllocations } from "@/components/admin/admin-combined-tier-session-allocations";
import {
  buildCombinedAllocationFormValues,
  buildSourceSessionAllocationsPayload,
  sumCombinedSessionAllocations,
} from "@/components/admin/admin-combined-tier-session-allocations.util";
import { ApiError, apiFetch } from "@/lib/api";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { OmmButton } from "@/components/ui/omm-button";

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
  initialPackage?: AdminPackageRow;
  configuredTierCount?: number;
  onSaved: (saved: AdminPackageRow) => void;
  onCancel: () => void;
};

function withCombinedTierAllocations(
  base: AdminPackageFormValues,
  initialPackage: AdminPackageRow,
): AdminPackageFormValues {
  const allocations = buildCombinedAllocationFormValues(initialPackage.combinedComponents);
  const total = sumCombinedSessionAllocations(allocations);
  return {
    ...base,
    sourceSessionAllocations: allocations,
    sessionsCount: total > 0 ? String(total) : base.sessionsCount,
  };
}

function buildInitialValues(
  mode: AdminPackageFormMode,
  initialCategoryName: string,
  initialPackage?: AdminPackageRow,
): AdminPackageFormValues {
  if (mode === "edit-tier" && initialPackage !== undefined) {
    const base = packageRowToTierFormValues(initialPackage, initialCategoryName);
    if (
      initialPackage.planType === "COMBINED" &&
      (initialPackage.combinedComponents?.length ?? 0) >= 2
    ) {
      return withCombinedTierAllocations(base, initialPackage);
    }
    return base;
  }
  if (
    (mode === "edit" || mode === "pricing") &&
    initialPackage !== undefined
  ) {
    return packageRowToFormValues(initialPackage, initialCategoryName);
  }
  if (mode === "add-tier" && initialPackage !== undefined) {
    if (
      initialPackage.planType === "COMBINED" &&
      (initialPackage.combinedComponents?.length ?? 0) >= 2
    ) {
      const base =
        initialPackage.priceCents > 0
          ? packageRowToTierFormValues(initialPackage, initialCategoryName)
          : createEmptyTierFormValues(initialCategoryName);
      return withCombinedTierAllocations(base, initialPackage);
    }
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
  initialPackage,
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryNamesFromApi, setCategoryNamesFromApi] = useState<readonly string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const submitLockRef = useRef(false);

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
      })
      .finally(() => {
        if (!cancelled) {
          setCategoriesLoading(false);
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

  function updateValues(patch: Partial<AdminPackageFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function updateTierPricingValues(patch: Partial<AdminPackageFormValues>) {
    setValues((current) => {
      const next = { ...current, ...patch };
      if ("price" in patch || "sessionsCount" in patch) {
        const derived = resolveTierPricePerSessionField(next.price, next.sessionsCount);
        next.pricePerSession =
          derived.length > 0 ? derived : next.pricePerSession;
      }
      return next;
    });
  }

  const isCombinedTierForm =
    (mode === "add-tier" || mode === "edit-tier") &&
    initialPackage?.planType === "COMBINED" &&
    (initialPackage.combinedComponents?.length ?? 0) >= 2;

  function updateCombinedAllocation(componentId: string, rawValue: string) {
    setValues((current) => {
      const nextAllocations = {
        ...current.sourceSessionAllocations,
        [componentId]: rawValue,
      };
      const total = sumCombinedSessionAllocations(nextAllocations);
      const sessionsCount = total > 0 ? String(total) : current.sessionsCount;
      const derivedPerSession = resolveTierPricePerSessionField(current.price, sessionsCount);
      return {
        ...current,
        sourceSessionAllocations: nextAllocations,
        sessionsCount,
        pricePerSession:
          derivedPerSession.length > 0 ? derivedPerSession : current.pricePerSession,
      };
    });
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
    const tierCategoryName = resolvePackageCategoryName(
      initialCategoryName.trim(),
      categoryNameCandidates,
    );
    const editableCategoryName = resolvePackageCategoryName(
      values.categoryName.trim(),
      categoryNameCandidates,
    );
    const categoryName = isCreateMode
      ? resolvePackageCategoryName(detailsName, categoryNameCandidates)
      : isAddTierMode
        ? tierCategoryName
        : editableCategoryName;

    const priceCents = parsePriceToCents(values.price);
    const sessionsPerMonth = parseSessionsCount(values.sessionsCount);
    const pricePerSessionCents =
      parsePriceToCents(values.pricePerSession) ??
      (priceCents !== null && sessionsPerMonth !== null
        ? parsePriceToCents(
            resolveTierPricePerSessionField(String(priceCents), String(sessionsPerMonth)),
          )
        : null);
    const periodDays = parseDurationDays(values.durationDays);
    const guestCount = parseGuestCount(values.guestCount);
    const resolvedSessions = sessionsPerMonth ?? MIN_PACKAGE_SESSIONS;
    const generatedSessionName = buildPackageSessionNameFromCount(resolvedSessions);
    const isTierPackage =
      initialPackage !== undefined && initialPackage.priceCents > 0;
    const usesGeneratedSessionName =
      isPricingMode || isAddTierMode || isEditTierMode || (isEditMode && isTierPackage);
    const slugSource = usesGeneratedSessionName
      ? generatedSessionName
      : detailsName.length > 0
        ? detailsName
        : initialPackage?.name ?? FALLBACK_PACKAGE_SLUG_PREFIX;
    const slug = buildPackageSlug(slugSource);
    const payloadName = usesGeneratedSessionName ? generatedSessionName : detailsName;

    if (isCreateMode || isEditMode) {
      if (detailsName.length === 0) {
        setError(t("nameRequired"));
        return;
      }
      if (detailsName.length > MAX_NAME_LENGTH) {
        setError(t("nameTooLong"));
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

    if (isAddTierMode && categoryName.length === 0) {
      setError(t("categoryRequired"));
      return;
    }

    if (isPricingMode || isEditMode || isAddTierMode || isEditTierMode) {
      if (priceCents === null) {
        setError(t("priceInvalid"));
        return;
      }
      if (isAddTierMode || isEditTierMode) {
        if (pricePerSessionCents === null) {
          setError(t("pricePerSessionInvalid"));
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
        sessionsPerMonth === null ||
        sessionsPerMonth < MIN_PACKAGE_SESSIONS ||
        sessionsPerMonth > MAX_PACKAGE_SESSIONS
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

    let sourceSessionAllocations: Array<{ componentId: string; sessionCount: number }> | undefined;
    if (isCombinedTierForm && initialPackage?.combinedComponents !== undefined) {
      const allocationPayload = buildSourceSessionAllocationsPayload(
        initialPackage.combinedComponents,
        values.sourceSessionAllocations,
      );
      if (allocationPayload === null) {
        setError(t("combinedForm.sourceAllocationInvalid"));
        return;
      }
      sourceSessionAllocations = allocationPayload;
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
      ...(isAddTierMode || isEditTierMode
        ? { pricePerSessionCents: pricePerSessionCents ?? 0 }
        : {}),
      currency: "AMD" as const,
      isUnlimited: false,
      sessionsPerMonth: sessionsPerMonth ?? MIN_PACKAGE_SESSIONS,
      guestCount: guestCount ?? 0,
      periodDays: periodDays ?? PACKAGE_DAYS_PER_MONTH,
      billingPeriod: tierBillingPeriod,
      ...(sourceSessionAllocations !== undefined
        ? { sourceSessionAllocations }
        : {}),
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
          description: description.length > 0 ? description : null,
          priceCents: 0,
          currency: "AMD",
          isUnlimited: false,
          sessionsPerMonth: 0,
          guestCount: 0,
          periodDays: PACKAGE_DAYS_PER_MONTH,
          billingPeriod: "monthly",
          isPopular: false,
          isActive: true,
        }
      : isAddTierMode
        ? shellTierTarget
          ? {
              name: generatedSessionName,
              ...pricingFields,
            }
          : {
              name: generatedSessionName,
              categoryName,
              slug: buildPackageTierSlug(categoryName, sessionsPerMonth ?? MIN_PACKAGE_SESSIONS),
              description: initialPackage?.description ?? null,
              ...pricingFields,
              isPopular: false,
              isActive: true,
            }
        : isPricingMode
          ? {
              name: generatedSessionName,
              ...pricingFields,
              isPopular: values.isPopular,
              isActive: values.isActive,
            }
          : isEditTierMode
            ? {
                name: generatedSessionName,
                ...pricingFields,
                isPopular: initialPackage?.isPopular ?? false,
                isActive: initialPackage?.isActive ?? true,
              }
            : {
              name: payloadName,
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
      className="flex flex-col gap-5"
    >
      {mode === "create" || mode === "edit" ? (
        <AdminPackageFormSection
          heading={t("formSections.details.heading")}
          description={t("formSections.details.description")}
        >
          <div className="flex flex-col gap-4">
            {mode === "edit" ? (
              <label className="flex flex-col gap-1.5">
                <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldCategory")}</span>
                <AdminPackageCategorySelect
                  value={values.categoryName}
                  options={mergedCategoryOptions}
                  onChange={(next) => updateValues({ categoryName: next })}
                  disabled={pending}
                  loading={categoriesLoading}
                  required
                  ariaLabel={t("fieldCategory")}
                />
              </label>
            ) : null}
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldName")}</span>
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
        <AdminPackageFormSection
          heading={
            mode === "edit-tier" ? t("editTierFormHeading") : t("addTierFormHeading")
          }
          description={
            mode === "edit-tier" ? t("editTierFormDescription") : t("addTierFormDescription")
          }
        >
          <div className="flex flex-col gap-4">
            {isCombinedTierForm && initialPackage?.combinedComponents !== undefined ? (
              <AdminCombinedTierSessionAllocations
                components={initialPackage.combinedComponents}
                allocations={values.sourceSessionAllocations}
                totalSessions={sumCombinedSessionAllocations(values.sourceSessionAllocations)}
                onAllocationChange={updateCombinedAllocation}
                disabled={pending}
              />
            ) : (
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldSessionsCount")}</span>
              <input
                name="sessionsCount"
                type="number"
                className={OMMM_INPUT_NUMBER_CLASS}
                min={MIN_PACKAGE_SESSIONS}
                max={MAX_PACKAGE_SESSIONS}
                step={1}
                inputMode="numeric"
                value={values.sessionsCount}
                onChange={(event) => updateTierPricingValues({ sessionsCount: event.target.value })}
                onKeyDown={preventNumberArrowStep}
                placeholder={t("fieldSessionsCountPlaceholder")}
                required
                disabled={pending}
              />
            </label>
            )}
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
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldPricePerSession")}</span>
              <AmdMoneyInput
                name="pricePerSession"
                value={values.pricePerSession}
                onValueChange={(nextValue) => updateValues({ pricePerSession: nextValue })}
                disabled={pending}
                align="start"
                placeholder={t("fieldPricePerSessionPlaceholder")}
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
              <span className="text-xs text-sage-500">{t("fieldValidityHint")}</span>
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
          </div>
        </AdminPackageFormSection>
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

      <div className="-mx-5 mt-1 flex flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/65 px-5 py-4 backdrop-blur-sm sm:-mx-7 sm:px-7">
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
