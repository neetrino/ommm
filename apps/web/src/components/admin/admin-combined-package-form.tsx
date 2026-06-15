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
  MAX_PACKAGE_DURATION_DAYS,
  MAX_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_DURATION_DAYS,
  MIN_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_SESSIONS,
  MAX_PACKAGE_SESSIONS,
  PACKAGE_DAYS_PER_MONTH,
  OMMM_INPUT_NUMBER_CLASS,
  parseDurationDays,
  parseGuestCount,
  parseSessionsCount,
  parsePriceToCents,
  preventNumberArrowStep,
  resolveTierPricePerSessionField,
} from "@/components/admin/admin-package-form-utils";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { buildCombinedPackageSourceOptions } from "@/components/admin/admin-combined-package-source-options";
import { buildCombinedPackageName } from "@/lib/package-eligibility";
import { ApiError, apiFetch } from "@/lib/api";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
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
  const [price, setPrice] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [sessionsCount, setSessionsCount] = useState(String(MIN_PACKAGE_SESSIONS));
  const [durationDays, setDurationDays] = useState(String(PACKAGE_DAYS_PER_MONTH));
  const [guestCount, setGuestCount] = useState("");
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
    const priceCents = parsePriceToCents(price);
    const sessionsPerMonth = parseSessionsCount(sessionsCount);
    const periodDays = parseDurationDays(durationDays);
    const guestCountValue = parseGuestCount(guestCount);
    const pricePerSessionCents = parsePriceToCents(pricePerSession);

    if (priceCents === null) {
      setError(t("priceInvalid"));
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
      periodDays === null ||
      periodDays < MIN_PACKAGE_DURATION_DAYS ||
      periodDays > MAX_PACKAGE_DURATION_DAYS
    ) {
      setError(t("durationDaysInvalid"));
      return;
    }
    if (
      guestCount.trim().length > 0 &&
      (guestCountValue === null ||
        guestCountValue < MIN_PACKAGE_GUEST_COUNT ||
        guestCountValue > MAX_PACKAGE_GUEST_COUNT)
    ) {
      setError(t("guestCountInvalid"));
      return;
    }
    if (pricePerSessionCents === null) {
      setError(t("pricePerSessionInvalid"));
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
          priceCents,
          pricePerSessionCents,
          currency: "AMD",
          isUnlimited: false,
          sessionsPerMonth,
          periodDays,
          billingPeriod: "monthly",
          guestCount: guestCountValue ?? 0,
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
    <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-5">
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

      {hasMinSourcesSelected ? (
      <>
      <AdminPackageFormSection
        heading={t("formSections.pricing.heading")}
        description={t("formSections.pricing.description")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldPrice")}</span>
            <AmdMoneyInput
              value={price}
              onValueChange={(nextValue) => {
                setPrice(nextValue);
                setPricePerSession(resolveTierPricePerSessionField(nextValue, sessionsCount));
              }}
              disabled={formFieldsDisabled}
              required
              align="start"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("fieldSessionsCount")}
            </span>
            <input
              type="number"
              className={OMMM_INPUT_NUMBER_CLASS}
              min={MIN_PACKAGE_SESSIONS}
              max={MAX_PACKAGE_SESSIONS}
              value={sessionsCount}
              onChange={(event) => {
                setSessionsCount(event.target.value);
                setPricePerSession(
                  resolveTierPricePerSessionField(price, event.target.value),
                );
              }}
              onKeyDown={preventNumberArrowStep}
              disabled={formFieldsDisabled}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("fieldPricePerSession")}
            </span>
            <AmdMoneyInput
              value={pricePerSession}
              onValueChange={setPricePerSession}
              disabled={formFieldsDisabled}
              align="start"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("fieldDurationDays")}
            </span>
            <input
              type="number"
              className={OMMM_INPUT_NUMBER_CLASS}
              min={MIN_PACKAGE_DURATION_DAYS}
              max={MAX_PACKAGE_DURATION_DAYS}
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
              onKeyDown={preventNumberArrowStep}
              disabled={formFieldsDisabled}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("fieldGuestCount")}
            </span>
            <input
              type="number"
              className={OMMM_INPUT_NUMBER_CLASS}
              min={MIN_PACKAGE_GUEST_COUNT}
              max={MAX_PACKAGE_GUEST_COUNT}
              value={guestCount}
              onChange={(event) => setGuestCount(event.target.value)}
              onKeyDown={preventNumberArrowStep}
              disabled={formFieldsDisabled}
            />
          </label>
        </div>
      </AdminPackageFormSection>
      </>
      ) : null}

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">{error}</p>
      ) : null}

      <div className="-mx-5 mt-1 flex flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/65 px-5 py-4 sm:-mx-7 sm:px-7">
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
