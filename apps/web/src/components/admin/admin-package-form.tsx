"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminPackageFormSection } from "@/components/admin/admin-package-form-section";
import {
  BILLING_PERIOD_OPTIONS,
  createEmptyPackageFormValues,
  isBillingPeriodOption,
  MAX_BILLING_PERIOD_LENGTH,
  MAX_CATEGORY_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PACKAGE_DURATION_MONTHS,
  MAX_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_DURATION_MONTHS,
  MIN_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_SESSIONS,
  MAX_PACKAGE_SESSIONS,
  durationMonthsToPeriodDays,
  packageRowToFormValues,
  parseDurationMonths,
  OMMM_INPUT_NUMBER_CLASS,
  parseGuestCount,
  parseSessionsCount,
  parsePriceToCents,
  preventNumberArrowStep,
  type AdminPackageFormValues,
  type BillingPeriodOption,
} from "@/components/admin/admin-package-form-utils";
import { AdminPackageCategorySelect } from "@/components/admin/admin-package-category-select";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  categoryNamesToOptions,
  mergePackageCategoryOptions,
  resolvePackageCategoryName,
} from "@/components/admin/package-category-utils";
import {
  buildPackageTierPlanName,
  buildPackageTierSlug,
} from "@/components/admin/admin-package-tier-utils";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

export type AdminPackageFormMode = "create" | "edit" | "pricing" | "add-tier";

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

function buildInitialValues(
  mode: AdminPackageFormMode,
  initialCategoryName: string,
  initialPackage?: AdminPackageRow,
): AdminPackageFormValues {
  if ((mode === "edit" || mode === "pricing") && initialPackage !== undefined) {
    return packageRowToFormValues(initialPackage, initialCategoryName);
  }
  if (mode === "add-tier" && initialPackage !== undefined && initialPackage.priceCents > 0) {
    return packageRowToFormValues(initialPackage, initialCategoryName);
  }
  return createEmptyPackageFormValues(initialCategoryName);
}

export function AdminPackageForm({
  mode,
  packageId,
  initialCategoryName,
  categoryOptions,
  initialPackage,
  configuredTierCount = 0,
  onSaved,
  onCancel,
}: AdminPackageFormProps) {
  const t = useTranslations("adminPages.packages");
  const formKey =
    mode === "create"
      ? "create"
      : mode === "add-tier"
        ? `add-tier-${initialCategoryName}-${packageId ?? "new"}`
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

  const billingPeriodOptions: readonly DropdownOption<BillingPeriodOption>[] = BILLING_PERIOD_OPTIONS.map(
    (option) => ({
      value: option,
      label: t(`billingPeriodOptions.${option}`),
    }),
  );
  function updateValues(patch: Partial<AdminPackageFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
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
    const isEditMode = mode === "edit";
    const name = values.name.trim();
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
      ? resolvePackageCategoryName(name, categoryNameCandidates)
      : isAddTierMode
        ? tierCategoryName
        : editableCategoryName;
    const slugSource =
      name.length > 0 ? name : initialPackage?.name ?? FALLBACK_PACKAGE_SLUG_PREFIX;
    const slug = buildPackageSlug(slugSource);

    const priceCents = parsePriceToCents(values.price);
    const billingPeriod = values.billingPeriod.trim().toLowerCase();
    const durationMonths = parseDurationMonths(values.durationMonths);
    const periodDays = durationMonths !== null ? durationMonthsToPeriodDays(durationMonths) : null;
    const guestCount = parseGuestCount(values.guestCount);
    const sessionsPerMonth = parseSessionsCount(values.sessionsCount);

    if (isCreateMode || isEditMode) {
      if (name.length === 0) {
        setError(t("nameRequired"));
        return;
      }
      if (name.length > MAX_NAME_LENGTH) {
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

    if (isPricingMode || isEditMode || isAddTierMode) {
      if (priceCents === null) {
        setError(t("priceInvalid"));
        return;
      }
      if (
        !isAddTierMode &&
        (billingPeriod.length === 0 ||
          billingPeriod.length > MAX_BILLING_PERIOD_LENGTH ||
          !isBillingPeriodOption(billingPeriod))
      ) {
        setError(t("billingPeriodInvalid"));
        return;
      }
      if (
        durationMonths === null ||
        durationMonths < MIN_PACKAGE_DURATION_MONTHS ||
        durationMonths > MAX_PACKAGE_DURATION_MONTHS
      ) {
        setError(t("durationMonthsInvalid"));
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
        guestCount === null ||
        guestCount < MIN_PACKAGE_GUEST_COUNT ||
        guestCount > MAX_PACKAGE_GUEST_COUNT
      ) {
        setError(t("guestCountInvalid"));
        return;
      }
    }

    const preservedDisplayFields =
      (isEditMode || isPricingMode) && initialPackage !== undefined
        ? {
            features: initialPackage.features,
            buttonLabel: initialPackage.buttonLabel,
            displayOrder: initialPackage.displayOrder,
          }
        : {};

    const tierBillingPeriod = isBillingPeriodOption(billingPeriod) ? billingPeriod : "monthly";
    const pricingFields = {
      priceCents: priceCents ?? 0,
      currency: "AMD" as const,
      isUnlimited: false,
      sessionsPerMonth: sessionsPerMonth ?? MIN_PACKAGE_SESSIONS,
      guestCount: guestCount ?? 1,
      periodDays: periodDays ?? durationMonthsToPeriodDays(1),
      billingPeriod: tierBillingPeriod,
    };

    const shellTierTarget =
      isAddTierMode &&
      packageId !== undefined &&
      initialPackage !== undefined &&
      initialPackage.priceCents <= 0;

    const tierOrdinal = configuredTierCount + 1;
    const tierName = shellTierTarget
      ? initialPackage.name
      : buildPackageTierPlanName(
          categoryName,
          sessionsPerMonth ?? MIN_PACKAGE_SESSIONS,
          tierOrdinal,
        );

    const payload = isCreateMode
      ? {
          name,
          categoryName,
          slug,
          description: description.length > 0 ? description : null,
          priceCents: 0,
          currency: "AMD",
          isUnlimited: false,
          sessionsPerMonth: 0,
          guestCount: 1,
          periodDays: durationMonthsToPeriodDays(1),
          billingPeriod: "monthly",
          isPopular: false,
          isActive: true,
        }
      : isAddTierMode
        ? shellTierTarget
          ? pricingFields
          : {
              name: tierName,
              categoryName,
              slug: buildPackageTierSlug(categoryName, sessionsPerMonth ?? MIN_PACKAGE_SESSIONS),
              description: initialPackage?.description ?? null,
              ...pricingFields,
              isPopular: false,
              isActive: true,
            }
        : isPricingMode
          ? {
              ...pricingFields,
              isPopular: values.isPopular,
              isActive: values.isActive,
            }
          : {
              name,
              categoryName,
              slug,
              description: description.length > 0 ? description : null,
              ...pricingFields,
              ...preservedDisplayFields,
              isPopular: values.isPopular,
              isActive: values.isActive,
            };

    const shouldPatch =
      (isEditMode || isPricingMode || shellTierTarget) && packageId !== undefined;

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
                required
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

      {mode === "add-tier" ? (
        <AdminPackageFormSection
          heading={t("addTierFormHeading")}
          description={t("addTierFormDescription")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                onChange={(event) => updateValues({ sessionsCount: event.target.value })}
                onKeyDown={preventNumberArrowStep}
                placeholder={t("fieldSessionsCountPlaceholder")}
                required
                disabled={pending}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldPrice")}</span>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 z-10 inline-flex items-center text-sm font-semibold text-sage-700">
                  ֏
                </span>
                <input
                  name="price"
                  type="number"
                  className="ommm-input pl-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={values.price}
                  onChange={(event) => updateValues({ price: event.target.value })}
                  onKeyDown={preventNumberArrowStep}
                  required
                  disabled={pending}
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDurationMonths")}</span>
              <input
                name="durationMonths"
                type="number"
                className={OMMM_INPUT_NUMBER_CLASS}
                min={MIN_PACKAGE_DURATION_MONTHS}
                max={MAX_PACKAGE_DURATION_MONTHS}
                step={1}
                inputMode="numeric"
                value={values.durationMonths}
                onChange={(event) => updateValues({ durationMonths: event.target.value })}
                onKeyDown={preventNumberArrowStep}
                placeholder={t("fieldDurationMonthsPlaceholder")}
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
                required
                disabled={pending}
              />
            </label>
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
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 z-10 inline-flex items-center text-sm font-semibold text-sage-700">
                    ֏
                  </span>
                  <input
                    name="price"
                    type="number"
                    className="ommm-input pl-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={values.price}
                    onChange={(event) => updateValues({ price: event.target.value })}
                    onKeyDown={preventNumberArrowStep}
                    required
                    disabled={pending}
                  />
                </div>
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="ommm-label text-xs uppercase tracking-wide">
                  {t("fieldBillingPeriod")}
                </span>
                <DropdownSelect
                  label={t("fieldBillingPeriod")}
                  ariaLabel={t("fieldBillingPeriod")}
                  value={values.billingPeriod}
                  options={billingPeriodOptions}
                  onChange={(next) => updateValues({ billingPeriod: next })}
                  required
                  disabled={pending}
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
                  {t("fieldDurationMonths")}
                </span>
                <input
                  name="durationMonths"
                  type="number"
                  className={OMMM_INPUT_NUMBER_CLASS}
                  min={MIN_PACKAGE_DURATION_MONTHS}
                  max={MAX_PACKAGE_DURATION_MONTHS}
                  step={1}
                  inputMode="numeric"
                  value={values.durationMonths}
                  onChange={(event) => updateValues({ durationMonths: event.target.value })}
                  onKeyDown={preventNumberArrowStep}
                  placeholder={t("fieldDurationMonthsPlaceholder")}
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
                  required
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
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 transition-colors has-[:checked]:border-sand-500/40 has-[:checked]:bg-sand-50/60">
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
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 transition-colors has-[:checked]:border-sand-500/40 has-[:checked]:bg-sand-50/60">
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
                : t("saveButton")}
        </OmmButton>
      </div>
    </form>
  );
}
