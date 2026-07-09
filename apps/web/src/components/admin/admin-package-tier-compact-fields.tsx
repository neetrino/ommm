"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { TierFieldErrors } from "@/components/admin/admin-package-type-sessions.util";
import {
  MAX_NAME_LENGTH,
  MAX_PACKAGE_DURATION_DAYS,
  MAX_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_DURATION_DAYS,
  MIN_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_STOCK_COUNT,
  MAX_PACKAGE_STOCK_COUNT,
  preventNumberArrowStep,
  type AdminPackageFormValues,
} from "@/components/admin/admin-package-form-utils";
import { AdminPackageTypeSessionsFields } from "@/components/admin/admin-package-type-sessions-fields";
import {
  createEmptyTypeSessionEntry,
  type PackageClassTypeOption,
  type PackageTypeSessionFormEntry,
} from "@/components/admin/admin-package-type-sessions.util";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { AdminRequiredMark, ADMIN_INVALID_FIELD_CLASS } from "@/components/admin/admin-sheet-editable-field";

const INLINE_INPUT_CLASS =
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-sm tabular-nums text-sage-900 shadow-none placeholder:text-sage-500/60 focus:outline-none focus:ring-0";

const MONEY_INLINE_CLASS = `${INLINE_INPUT_CLASS} !py-0 !pl-6 !pr-0`;

type TierFieldTone = "name" | "price" | "discount" | "duration" | "guests" | "stock";

const ICON_CLASS: Record<TierFieldTone, string> = {
  name: "bg-sand-100 text-sand-700",
  price: "bg-mint-100 text-mint-800",
  discount: "bg-amber-100 text-amber-800",
  duration: "bg-sky-100 text-sky-800",
  guests: "bg-violet-100 text-violet-800",
  stock: "bg-rose-100 text-rose-800",
};

function TierFieldIcon({ tone }: { tone: TierFieldTone }) {
  const base = `inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${ICON_CLASS[tone]}`;

  if (tone === "name") {
    return (
      <span className={base} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2}>
          <path d="M4 7h16M4 12h10M4 17h14" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (tone === "price") {
    return (
      <span className={base} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2}>
          <path d="M12 3v18M8 7h6a3 3 0 010 6H8a3 3 0 000 6h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (tone === "discount") {
    return (
      <span className={base} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2}>
          <path d="M7 17L17 7" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (tone === "duration") {
    return (
      <span className={base} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2}>
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M4 11h16" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (tone === "stock") {
    return (
      <span className={base} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2}>
          <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className={base} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M16 8a2.5 2.5 0 010 5M19 20c0-2.2-1.5-3.8-3.5-4.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

type TierIconFieldProps = {
  tone: TierFieldTone;
  label: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  invalid?: boolean;
};

function TierIconField({
  tone,
  label,
  children,
  className = "",
  required = false,
  invalid = false,
}: TierIconFieldProps) {
  return (
    <label className={`flex min-w-0 flex-col gap-1 ${className}`.trim()}>
      <span className="ommm-label text-[10px] uppercase tracking-wide">
        {label}
        {required ? <AdminRequiredMark /> : null}
      </span>
      <div
        className={`ommm-input flex min-h-10 items-center gap-2 !py-2 ${invalid ? ADMIN_INVALID_FIELD_CLASS : ""}`}
      >
        <TierFieldIcon tone={tone} />
        {children}
      </div>
    </label>
  );
}

type AdminPackageTierCompactFieldsProps = {
  values: AdminPackageFormValues;
  typeSessionEntries: readonly PackageTypeSessionFormEntry[];
  classTypeOptions: readonly PackageClassTypeOption[];
  fieldErrors: TierFieldErrors;
  pending: boolean;
  onValuesChange: (patch: Partial<AdminPackageFormValues>) => void;
  onTierPricingChange: (patch: Partial<AdminPackageFormValues>) => void;
  onTypeSessionEntriesChange: (entries: PackageTypeSessionFormEntry[]) => void;
};

export function AdminPackageTierCompactFields({
  values,
  typeSessionEntries,
  classTypeOptions,
  fieldErrors,
  pending,
  onValuesChange,
  onTierPricingChange,
  onTypeSessionEntriesChange,
}: AdminPackageTierCompactFieldsProps) {
  const t = useTranslations("adminPages.packages");

  return (
    <div className="flex flex-col gap-4">
      <TierIconField tone="name" label={t("fieldPageName")} required invalid={fieldErrors.name === true}>
        <input
          name="name"
          className={INLINE_INPUT_CLASS}
          maxLength={MAX_NAME_LENGTH}
          value={values.name}
          onChange={(event) => onValuesChange({ name: event.target.value })}
          placeholder={t("fieldPageNamePlaceholder")}
          disabled={pending}
          aria-invalid={fieldErrors.name === true}
        />
      </TierIconField>

      <div className="grid grid-cols-2 gap-3">
        <TierIconField tone="price" label={t("fieldPrice")} required invalid={fieldErrors.price === true}>
          <AmdMoneyInput
            name="price"
            value={values.price}
            onValueChange={(nextValue) => onTierPricingChange({ price: nextValue })}
            disabled={pending}
            align="start"
            placeholder={t("fieldPricePlaceholder")}
            className={MONEY_INLINE_CLASS}
            containerClassName="min-w-0 flex-1"
            aria-invalid={fieldErrors.price === true}
          />
        </TierIconField>

        <TierIconField
          tone="discount"
          label={t("fieldDiscountedPrice")}
          invalid={fieldErrors.discountedPrice === true}
        >
          <AmdMoneyInput
            name="discountedPrice"
            value={values.discountedPrice}
            onValueChange={(nextValue) => onTierPricingChange({ discountedPrice: nextValue })}
            disabled={pending}
            align="start"
            placeholder={t("fieldDiscountedPricePlaceholder")}
            className={MONEY_INLINE_CLASS}
            containerClassName="min-w-0 flex-1"
            aria-invalid={fieldErrors.discountedPrice === true}
          />
        </TierIconField>

        <TierIconField
          tone="duration"
          label={t("fieldDurationDays")}
          required
          invalid={fieldErrors.duration === true}
        >
          <input
            name="durationDays"
            type="number"
            className={INLINE_INPUT_CLASS}
            min={MIN_PACKAGE_DURATION_DAYS}
            max={MAX_PACKAGE_DURATION_DAYS}
            step={1}
            inputMode="numeric"
            value={values.durationDays}
            onChange={(event) => onValuesChange({ durationDays: event.target.value })}
            onKeyDown={preventNumberArrowStep}
            placeholder={t("fieldDurationDaysPlaceholder")}
            disabled={pending}
            aria-invalid={fieldErrors.duration === true}
          />
        </TierIconField>

        <TierIconField tone="guests" label={t("fieldGuestCount")}>
          <input
            name="guestCount"
            type="number"
            className={INLINE_INPUT_CLASS}
            min={MIN_PACKAGE_GUEST_COUNT}
            max={MAX_PACKAGE_GUEST_COUNT}
            step={1}
            inputMode="numeric"
            value={values.guestCount}
            onChange={(event) => onValuesChange({ guestCount: event.target.value })}
            onKeyDown={preventNumberArrowStep}
            placeholder={t("fieldGuestCountPlaceholder")}
            disabled={pending}
          />
        </TierIconField>

        <TierIconField
          tone="stock"
          label={t("fieldStockCount")}
          invalid={fieldErrors.stockCount === true}
        >
          <input
            name="stockCount"
            type="number"
            className={INLINE_INPUT_CLASS}
            min={MIN_PACKAGE_STOCK_COUNT}
            max={MAX_PACKAGE_STOCK_COUNT}
            step={1}
            inputMode="numeric"
            value={values.stockCount}
            onChange={(event) => onValuesChange({ stockCount: event.target.value })}
            onKeyDown={preventNumberArrowStep}
            placeholder={t("fieldStockCountPlaceholder")}
            disabled={pending}
            aria-invalid={fieldErrors.stockCount === true}
          />
        </TierIconField>
      </div>

      <label className="flex min-w-0 flex-col gap-1">
        <span className="ommm-label text-[10px] uppercase tracking-wide">
          {t("fieldStartDate")}
        </span>
        <DatePickerInput
          name="startDate"
          ariaLabel={t("fieldStartDate")}
          value={values.startDate}
          onChange={(nextValue) => onValuesChange({ startDate: nextValue })}
          disabled={pending}
        />
        <span className="text-xs text-sage-500">{t("fieldStartDateHint")}</span>
      </label>

      <AdminPackageTypeSessionsFields
        entries={typeSessionEntries}
        classTypeOptions={classTypeOptions}
        rowFieldErrors={fieldErrors.typeSessionRows}
        disabled={pending}
        onChange={onTypeSessionEntriesChange}
        onAddRow={() =>
          onTypeSessionEntriesChange([...typeSessionEntries, createEmptyTypeSessionEntry()])
        }
        onRemoveRow={(entryId) => {
          const next =
            typeSessionEntries.length <= 1
              ? typeSessionEntries
              : typeSessionEntries.filter((entry) => entry.id !== entryId);
          onTypeSessionEntriesChange([...next]);
        }}
      />
    </div>
  );
}
