"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { AdminPackageFormSection } from "@/components/admin/admin-package-form-section";
import {
  BILLING_PERIOD_OPTIONS,
  createEmptyPackageFormValues,
  isBillingPeriodOption,
  MAX_BILLING_PERIOD_LENGTH,
  MAX_BUTTON_LABEL_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_FEATURES_LENGTH,
  MAX_NAME_LENGTH,
  packageRowToFormValues,
  parsePriceToCents,
  preventNumberArrowStep,
  type AdminPackageFormValues,
  type BillingPeriodOption,
} from "@/components/admin/admin-package-form-utils";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

export type AdminPackageFormMode = "create" | "edit";

type CategoryOption = {
  id: string;
  label: string;
};

type AdminPackageFormProps = {
  mode: AdminPackageFormMode;
  packageId?: string;
  initialClassTypeId: string;
  categoryOptions: readonly CategoryOption[];
  initialPackage?: AdminPackageRow;
  onSaved: () => void;
  onCancel: () => void;
};

function buildInitialValues(
  mode: AdminPackageFormMode,
  initialClassTypeId: string,
  initialPackage?: AdminPackageRow,
): AdminPackageFormValues {
  if (mode === "edit" && initialPackage !== undefined) {
    return packageRowToFormValues(initialPackage, initialClassTypeId);
  }
  return createEmptyPackageFormValues(initialClassTypeId);
}

export function AdminPackageForm({
  mode,
  packageId,
  initialClassTypeId,
  categoryOptions,
  initialPackage,
  onSaved,
  onCancel,
}: AdminPackageFormProps) {
  const t = useTranslations("adminPages.packages");
  const formKey = mode === "edit" && packageId !== undefined ? `edit-${packageId}` : `create-${initialClassTypeId}`;
  const [values, setValues] = useState<AdminPackageFormValues>(() =>
    buildInitialValues(mode, initialClassTypeId, initialPackage),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const billingPeriodOptions: readonly DropdownOption<BillingPeriodOption>[] = BILLING_PERIOD_OPTIONS.map(
    (option) => ({
      value: option,
      label: t(`billingPeriodOptions.${option}`),
    }),
  );
  const categoryDropdownOptions: readonly DropdownOption<string>[] = categoryOptions.map((option) => ({
    value: option.id,
    label: option.label,
  }));

  function updateValues(patch: Partial<AdminPackageFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }

    setError(null);

    const name = values.name.trim();
    const description = values.description.trim();
    const classTypeId = values.classTypeId.trim();

    if (name.length === 0) {
      setError(t("nameRequired"));
      return;
    }
    if (name.length > MAX_NAME_LENGTH) {
      setError(t("nameTooLong"));
      return;
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError(t("descriptionTooLong"));
      return;
    }
    if (classTypeId.length === 0) {
      setError(t("categoryRequired"));
      return;
    }
    const priceCents = parsePriceToCents(values.price);
    if (priceCents === null) {
      setError(t("priceInvalid"));
      return;
    }
    const billingPeriod = values.billingPeriod.trim().toLowerCase();
    if (
      billingPeriod.length === 0 ||
      billingPeriod.length > MAX_BILLING_PERIOD_LENGTH ||
      !isBillingPeriodOption(billingPeriod)
    ) {
      setError(t("billingPeriodInvalid"));
      return;
    }
    const periodDays = Number.parseInt(values.periodDays, 10);
    if (!Number.isInteger(periodDays) || periodDays < 1) {
      setError(t("periodDaysInvalid"));
      return;
    }
    if (values.features.trim().length > MAX_FEATURES_LENGTH) {
      setError(t("featuresTooLong"));
      return;
    }
    if (values.buttonLabel.trim().length === 0 || values.buttonLabel.trim().length > MAX_BUTTON_LABEL_LENGTH) {
      setError(t("buttonLabelInvalid"));
      return;
    }
    const displayOrder = Number.parseInt(values.displayOrder, 10);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      setError(t("displayOrderInvalid"));
      return;
    }

    const features = values.features
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const payload = {
      name,
      description: description.length > 0 ? description : null,
      priceCents,
      currency: "AMD",
      isUnlimited: false,
      sessionsPerMonth: 0,
      periodDays,
      billingPeriod,
      features,
      buttonLabel: values.buttonLabel.trim(),
      isPopular: values.isPopular,
      isActive: values.isActive,
      displayOrder,
      classTypeId,
    };

    submitLockRef.current = true;
    setPending(true);
    try {
      if (mode === "edit" && packageId !== undefined) {
        await apiFetch(`/packages/plans/${packageId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/packages/plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
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
      <AdminPackageFormSection
        heading={t("formSections.details.heading")}
        description={t("formSections.details.description")}
      >
        <div className="flex flex-col gap-4">
          {categoryOptions.length > 0 ? (
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldCategory")}</span>
              <DropdownSelect
                label={t("fieldCategory")}
                ariaLabel={t("fieldCategory")}
                value={values.classTypeId}
                options={categoryDropdownOptions}
                onChange={(next) => updateValues({ classTypeId: next })}
                required
                disabled={pending}
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
                step="0.01"
                inputMode="decimal"
                value={values.price}
                onChange={(event) => updateValues({ price: event.target.value })}
                onKeyDown={preventNumberArrowStep}
                required
                disabled={pending}
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldPeriodDays")}</span>
            <input
              name="periodDays"
              type="number"
              className="ommm-input"
              min={1}
              step={1}
              value={values.periodDays}
              onChange={(event) => updateValues({ periodDays: event.target.value })}
              required
              disabled={pending}
            />
            <span className="text-xs text-sage-500">{t("fieldPeriodDaysHint")}</span>
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
        heading={t("formSections.display.heading")}
        description={t("formSections.display.description")}
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldFeatures")}</span>
            <textarea
              name="features"
              className="ommm-input min-h-28 resize-y"
              placeholder={t("featuresPlaceholder")}
              maxLength={MAX_FEATURES_LENGTH}
              value={values.features}
              onChange={(event) => updateValues({ features: event.target.value })}
              disabled={pending}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">
                {t("fieldButtonLabel")}
              </span>
              <input
                name="buttonLabel"
                className="ommm-input"
                maxLength={MAX_BUTTON_LABEL_LENGTH}
                value={values.buttonLabel}
                onChange={(event) => updateValues({ buttonLabel: event.target.value })}
                required
                disabled={pending}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">
                {t("fieldDisplayOrder")}
              </span>
              <input
                name="displayOrder"
                type="number"
                className="ommm-input"
                min={0}
                step={1}
                value={values.displayOrder}
                onChange={(event) => updateValues({ displayOrder: event.target.value })}
                required
                disabled={pending}
              />
              <span className="text-xs text-sage-500">{t("fieldDisplayOrderHint")}</span>
            </label>
          </div>
        </div>
      </AdminPackageFormSection>

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
          {pending ? t("savingButton") : mode === "edit" ? t("saveButton") : t("createButton")}
        </OmmButton>
      </div>
    </form>
  );
}
