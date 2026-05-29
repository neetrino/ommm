"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_BILLING_PERIOD_LENGTH = 32;
const MAX_FEATURES_LENGTH = 1200;
const MAX_BUTTON_LABEL_LENGTH = 80;
const BILLING_PERIOD_OPTIONS = ["weekly", "monthly", "quarterly", "yearly"] as const;
type BillingPeriodOption = (typeof BILLING_PERIOD_OPTIONS)[number];

type AdminPackagePlanFormProps = {
  onSaved: () => void;
  onCancel: () => void;
};

function parsePriceToCents(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized.length === 0) {
    return null;
  }
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }
  return Math.round(numeric * 100);
}

function preventNumberArrowStep(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
  }
}

function isBillingPeriodOption(value: string): value is BillingPeriodOption {
  return BILLING_PERIOD_OPTIONS.includes(value as BillingPeriodOption);
}

export function AdminPackagePlanForm({ onSaved, onCancel }: AdminPackagePlanFormProps) {
  const t = useTranslations("adminPages.packages");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriodValue, setBillingPeriodValue] = useState<BillingPeriodOption>("monthly");
  const submitLockRef = useRef(false);
  const billingPeriodOptions: readonly DropdownOption<BillingPeriodOption>[] = BILLING_PERIOD_OPTIONS.map(
    (option) => ({
      value: option,
      label: t(`billingPeriodOptions.${option}`),
    }),
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    const form = event.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get("name") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const priceRaw = String(fd.get("price") ?? "");
    const currency = "AMD";
    const billingPeriod = String(fd.get("billingPeriod") ?? "").trim().toLowerCase();
    const periodDaysRaw = String(fd.get("periodDays") ?? "").trim();
    const featuresRaw = String(fd.get("features") ?? "").trim();
    const buttonLabel = String(fd.get("buttonLabel") ?? "").trim();
    const displayOrderRaw = String(fd.get("displayOrder") ?? "").trim();
    const isPopular = fd.get("isPopular") === "on";
    const isActive = fd.get("isActive") === "on";

    setError(null);

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
    const priceCents = parsePriceToCents(priceRaw);
    if (priceCents === null) {
      setError(t("priceInvalid"));
      return;
    }
    if (
      billingPeriod.length === 0 ||
      billingPeriod.length > MAX_BILLING_PERIOD_LENGTH ||
      !isBillingPeriodOption(billingPeriod)
    ) {
      setError(t("billingPeriodInvalid"));
      return;
    }
    const periodDays = Number.parseInt(periodDaysRaw, 10);
    if (!Number.isInteger(periodDays) || periodDays < 1) {
      setError(t("periodDaysInvalid"));
      return;
    }
    if (featuresRaw.length > MAX_FEATURES_LENGTH) {
      setError(t("featuresTooLong"));
      return;
    }
    if (buttonLabel.length === 0 || buttonLabel.length > MAX_BUTTON_LABEL_LENGTH) {
      setError(t("buttonLabelInvalid"));
      return;
    }
    const displayOrder = Number.parseInt(displayOrderRaw, 10);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      setError(t("displayOrderInvalid"));
      return;
    }

    const features = featuresRaw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    submitLockRef.current = true;
    setPending(true);
    try {
      await apiFetch("/memberships/plans", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description.length > 0 ? description : null,
          priceCents,
          currency,
          isUnlimited: false,
          sessionsPerMonth: 0,
          periodDays,
          billingPeriod,
          features,
          buttonLabel,
          isPopular,
          isActive,
          displayOrder,
        }),
      });
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
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldName")}</span>
          <input
            name="name"
            className="ommm-input"
            maxLength={MAX_NAME_LENGTH}
            required
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldPrice")}</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 z-10 inline-flex items-center text-sm font-semibold text-black">
              ֏
            </span>
            <input
              name="price"
              type="number"
              className="ommm-input pl-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={0}
              step="0.01"
              inputMode="decimal"
              onKeyDown={preventNumberArrowStep}
              required
              disabled={pending}
            />
          </div>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDescription")}</span>
        <textarea
          name="description"
          className="ommm-input min-h-20"
          maxLength={MAX_DESCRIPTION_LENGTH}
          disabled={pending}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("fieldBillingPeriod")}
          </span>
          <DropdownSelect
            label={t("fieldBillingPeriod")}
            ariaLabel={t("fieldBillingPeriod")}
            value={billingPeriodValue}
            options={billingPeriodOptions}
            onChange={setBillingPeriodValue}
            name="billingPeriod"
            triggerClassName="ommm-input text-left pr-9"
            required
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldPeriodDays")}</span>
          <input
            name="periodDays"
            type="number"
            className="ommm-input"
            min={1}
            step={1}
            defaultValue={30}
            required
            disabled={pending}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldFeatures")}</span>
        <textarea
          name="features"
          className="ommm-input min-h-24"
          placeholder={t("featuresPlaceholder")}
          maxLength={MAX_FEATURES_LENGTH}
          disabled={pending}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("fieldButtonLabel")}
          </span>
          <input
            name="buttonLabel"
            className="ommm-input"
            defaultValue="Choose plan"
            maxLength={MAX_BUTTON_LABEL_LENGTH}
            required
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("fieldDisplayOrder")}
          </span>
          <input
            name="displayOrder"
            type="number"
            className="ommm-input"
            min={0}
            step={1}
            defaultValue={0}
            required
            disabled={pending}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/50 px-3 py-2">
          <input type="checkbox" name="isPopular" disabled={pending} />
          <span className="text-sm text-sage-700">{t("fieldPopular")}</span>
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/50 px-3 py-2">
          <input type="checkbox" name="isActive" defaultChecked disabled={pending} />
          <span className="text-sm text-sage-700">{t("fieldActive")}</span>
        </label>
      </div>

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <OmmButton type="button" variant="secondary" size="sm" onClick={onCancel} disabled={pending}>
          {t("cancelButton")}
        </OmmButton>
        <OmmButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? t("savingButton") : t("saveButton")}
        </OmmButton>
      </div>
    </form>
  );
}
