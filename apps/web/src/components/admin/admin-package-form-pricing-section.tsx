"use client";

import { useTranslations } from "next-intl";
import { AdminPackageFormSection } from "@/components/admin/admin-package-form-section";
import {
  MAX_NAME_LENGTH,
  MAX_PACKAGE_DURATION_DAYS,
  MAX_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_DURATION_DAYS,
  MIN_PACKAGE_GUEST_COUNT,
  MIN_PACKAGE_SESSIONS,
  MAX_PACKAGE_SESSIONS,
  OMMM_INPUT_NUMBER_CLASS,
  preventNumberArrowStep,
  type AdminPackageFormValues,
} from "@/components/admin/admin-package-form-utils";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";

type AdminPackageFormPricingSectionProps = {
  values: AdminPackageFormValues;
  pending: boolean;
  onValuesChange: (patch: Partial<AdminPackageFormValues>) => void;
};

export function AdminPackageFormPricingSection({
  values,
  pending,
  onValuesChange,
}: AdminPackageFormPricingSectionProps) {
  const t = useTranslations("adminPages.packages");

  return (
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
              onValueChange={(nextValue) => onValuesChange({ price: nextValue })}
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
              onValueChange={(nextValue) => onValuesChange({ discountedPrice: nextValue })}
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
              onChange={(event) => onValuesChange({ sessionsCount: event.target.value })}
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
              onChange={(event) => onValuesChange({ name: event.target.value })}
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
              onChange={(event) => onValuesChange({ durationDays: event.target.value })}
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
              onChange={(event) => onValuesChange({ guestCount: event.target.value })}
              onKeyDown={preventNumberArrowStep}
              placeholder={t("fieldGuestCountPlaceholder")}
              disabled={pending}
            />
            <span className="text-xs text-sage-500">{t("fieldGuestCountHint")}</span>
          </label>
        </div>
      </AdminPackageFormSection>

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
              onChange={(event) => onValuesChange({ isPopular: event.target.checked })}
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
              onChange={(event) => onValuesChange({ isActive: event.target.checked })}
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
    </>
  );
}
