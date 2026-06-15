"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPackageFormSection } from "@/components/admin/admin-package-form-section";
import {
  AdminCombinedPackageSourceSelect,
} from "@/components/admin/admin-combined-package-source-select";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  PACKAGE_DAYS_PER_MONTH,
} from "@/components/admin/admin-package-form-utils";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { buildCombinedPackageSourceOptions } from "@/components/admin/admin-combined-package-source-options";
import { buildCombinedPackageName } from "@/lib/package-eligibility";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";

const MIN_COMBINED_SOURCE_COUNT = 2;

type AdminCombinedPackageFormProps = {
  packages: readonly AdminPackageRow[];
  onSaved: (saved: AdminPackageRow) => void;
  onCancel: () => void;
};

export function AdminCombinedPackageForm({
  packages,
  onSaved,
  onCancel,
}: AdminCombinedPackageFormProps) {
  const t = useTranslations("adminPages.packages");
  const { options: sourceOptions, planById } = useMemo(
    () => buildCombinedPackageSourceOptions(packages),
    [packages],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const selectedPlans = useMemo(
    () =>
      selectedIds
        .map((id) => planById.get(id))
        .filter((plan): plan is AdminPackageRow => plan !== undefined),
    [selectedIds, planById],
  );

  const suggestedName = useMemo(() => {
    if (selectedPlans.length < MIN_COMBINED_SOURCE_COUNT) {
      return "";
    }
    return buildCombinedPackageName(selectedPlans.map((plan) => plan.name));
  }, [selectedPlans]);

  const hasMinSourcesSelected = selectedIds.length >= MIN_COMBINED_SOURCE_COUNT;
  const formFieldsDisabled = pending || !hasMinSourcesSelected;

  function applySuggestedName(): void {
    if (suggestedName.length > 0) {
      setName(suggestedName);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    setError(null);

    if (selectedIds.length < MIN_COMBINED_SOURCE_COUNT) {
      setError(t("combinedSelectAtLeastTwo"));
      return;
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > MAX_NAME_LENGTH) {
      setError(t("nameRequired"));
      return;
    }
    const descriptionTrimmed = description.trim();
    if (descriptionTrimmed.length > MAX_DESCRIPTION_LENGTH) {
      setError(t("descriptionTooLong"));
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      const saved = await apiFetch<AdminPackageRow>("/packages/plans/combined", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          description: descriptionTrimmed.length > 0 ? descriptionTrimmed : null,
          priceCents: 0,
          pricePerSessionCents: 0,
          currency: "AMD",
          isUnlimited: false,
          sessionsPerMonth: 0,
          periodDays: PACKAGE_DAYS_PER_MONTH,
          billingPeriod: "monthly",
          guestCount: 0,
          isPopular: false,
          isActive: true,
          sourcePlanIds: selectedIds,
        }),
      });
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
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
    <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col">
      <div className="flex flex-col gap-5 px-5 sm:px-7">
      <AdminPackageFormSection
        heading={t("combinedForm.sourceHeading")}
        description={t("combinedForm.sourceDescription")}
      >
        {sourceOptions.length === 0 ? (
          <p className="text-sm text-sage-600">{t("combinedForm.noSourcePackages")}</p>
        ) : (
          <AdminCombinedPackageSourceSelect
            options={sourceOptions}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            disabled={pending}
          />
        )}
        {sourceOptions.length > 0 && sourceOptions.length < MIN_COMBINED_SOURCE_COUNT ? (
          <p className="mt-3 text-sm text-amber-900">{t("combinedForm.needMoreCategories")}</p>
        ) : null}
        {selectedPlans.length > 0 ? (
          <p className="mt-3 text-sm text-sage-600">
            {t("combinedForm.selectedSummary", {
              count: selectedPlans.length,
              names: selectedPlans.map((plan) => plan.name).join(", "),
            })}
          </p>
        ) : null}
      </AdminPackageFormSection>

      <AdminPackageFormSection
        heading={t("formSections.details.heading")}
        description={t("combinedForm.detailsDescription")}
      >
        {!hasMinSourcesSelected ? (
          <p className="text-sm text-sage-500">{t("combinedForm.detailsLockedHint")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldName")}</span>
              <input
                className="ommm-input"
                maxLength={MAX_NAME_LENGTH}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={suggestedName.length > 0 ? suggestedName : undefined}
                disabled={formFieldsDisabled}
                required
              />
              {suggestedName.length > 0 && name.trim() !== suggestedName ? (
                <button
                  type="button"
                  className="text-left text-xs font-medium text-sand-700 hover:text-sand-900"
                  onClick={applySuggestedName}
                  disabled={formFieldsDisabled}
                >
                  {t("combinedForm.useSuggestedName", { name: suggestedName })}
                </button>
              ) : null}
              <span className="text-xs text-sage-500">{t("combinedForm.nameHint")}</span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">
                {t("fieldDescription")}
              </span>
              <textarea
                className="ommm-input min-h-24 resize-y"
                maxLength={MAX_DESCRIPTION_LENGTH}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={formFieldsDisabled}
              />
            </label>
          </div>
        )}
      </AdminPackageFormSection>

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">{error}</p>
      ) : null}
      </div>

      <div className="shrink-0 flex w-full flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/85 px-5 py-4 backdrop-blur-sm sm:px-7">
        <OmmButton type="button" variant="secondary" size="md" onClick={onCancel} disabled={pending}>
          {t("cancelButton")}
        </OmmButton>
        <OmmButton
          type="submit"
          variant="primary"
          size="md"
          disabled={
            pending ||
            sourceOptions.length < MIN_COMBINED_SOURCE_COUNT ||
            selectedIds.length < MIN_COMBINED_SOURCE_COUNT
          }
        >
          {pending ? t("savingButton") : t("combinedForm.createButton")}
        </OmmButton>
      </div>
    </form>
  );
}
