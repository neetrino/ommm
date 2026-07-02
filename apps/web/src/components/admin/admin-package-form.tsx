"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { AdminPackageFormDetailsSection } from "@/components/admin/admin-package-form-details-section";
import { AdminPackageFormPricingSection } from "@/components/admin/admin-package-form-pricing-section";
import { submitAdminPackageForm } from "@/components/admin/admin-package-form-submit";
import { useAdminPackageForm } from "@/components/admin/admin-package-form.use";
import type { AdminPackageFormProps } from "@/components/admin/admin-package-form.types";
import { MAX_NAME_LENGTH } from "@/components/admin/admin-package-form-utils";
import { AdminPackageTierCompactFields } from "@/components/admin/admin-package-tier-compact-fields";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmButton } from "@/components/ui/omm-button";

export type { AdminPackageFormMode } from "@/components/admin/admin-package-form.types";
export { resolveAdminPackageFormKey } from "@/components/admin/admin-package-form.helpers";

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
  showCloseButton = false,
}: AdminPackageFormProps) {
  const t = useTranslations("adminPages.packages");
  const createGroupTitleId = useId();
  const {
    formKey,
    values,
    typeSessionEntries,
    pending,
    setPending,
    error,
    setError,
    tierFieldErrors,
    setTierFieldErrors,
    submitLockRef,
    mergedCategoryOptions,
    categoryNameCandidates,
    classTypeNameById,
    updateValues,
    updateTierPricingValues,
    handleTypeSessionEntriesChange,
  } = useAdminPackageForm({
    mode,
    packageId,
    initialCategoryName,
    categoryOptions,
    classTypeOptions,
    initialPackage,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitAdminPackageForm({
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
      onSaved,
      setError,
      setTierFieldErrors,
      setPending,
      submitLockRef,
      pending,
    });
  }

  const isCompactCreateForm = mode === "create";
  const isTierFormMode = mode === "add-tier" || mode === "edit-tier";

  return (
    <form
      key={formKey}
      noValidate={isTierFormMode}
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className={
        isCompactCreateForm
          ? "ommm-admin-create-group-form flex flex-col"
          : "flex min-h-0 flex-1 flex-col"
      }
      aria-labelledby={isCompactCreateForm ? createGroupTitleId : undefined}
    >
      {isCompactCreateForm ? (
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <h2 id={createGroupTitleId} className={`${adminChrome.panelHeading} text-base`}>
            {t("createGroupTitle")}
          </h2>
          {showCloseButton ? (
            <button
              type="button"
              className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              aria-label={t("modalCloseAria")}
              onClick={onCancel}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        className={
          isCompactCreateForm
            ? "flex flex-col gap-4 px-6 pb-5 pt-4"
            : "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6"
        }
      >
        {isCompactCreateForm ? (
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label">{t("fieldGroupName")}</span>
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
          <AdminPackageFormDetailsSection
            values={values}
            pending={pending}
            classTypeOptions={classTypeOptions}
            onValuesChange={updateValues}
          />
        ) : null}

        {mode === "add-tier" || mode === "edit-tier" ? (
          <AdminPackageTierCompactFields
            values={values}
            typeSessionEntries={typeSessionEntries}
            classTypeOptions={classTypeOptions}
            fieldErrors={tierFieldErrors}
            pending={pending}
            onValuesChange={updateValues}
            onTierPricingChange={updateTierPricingValues}
            onTypeSessionEntriesChange={handleTypeSessionEntriesChange}
          />
        ) : null}

        {mode === "pricing" || mode === "edit" ? (
          <AdminPackageFormPricingSection
            values={values}
            pending={pending}
            onValuesChange={updateValues}
          />
        ) : null}

        {error !== null ? (
          <p className="app-alert-warn text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div
        className={
          isCompactCreateForm
            ? "grid shrink-0 grid-cols-2 gap-3 px-6 pb-6"
            : "shrink-0 flex w-full flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/85 px-5 py-4 backdrop-blur-sm sm:rounded-b-[28px] sm:px-7"
        }
      >
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
