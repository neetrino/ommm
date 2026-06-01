"use client";

import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFilterDropdown, OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import type {
  GiftCardExpirationFilter,
  GiftCardFilterValues,
  GiftCardQuickFilter,
  GiftCardSortOrder,
  GiftCardStatusFilter,
} from "@/components/admin/admin-gift-cards-types";
import { GIFT_CARD_STATUSES } from "@/components/admin/admin-gift-cards-types";

type AdminGiftCardsFiltersProps = {
  values: GiftCardFilterValues;
  activeFilterCount: number;
  onChange: <K extends keyof GiftCardFilterValues>(
    key: K,
    value: GiftCardFilterValues[K],
  ) => void;
  onReset: () => void;
};

const SORT_OPTIONS: readonly GiftCardSortOrder[] = [
  "newest",
  "oldest",
  "amountHigh",
  "amountLow",
  "expirationSoon",
];

const SORT_LABEL_KEYS: Record<GiftCardSortOrder, string> = {
  newest: "sortNewest",
  oldest: "sortOldest",
  amountHigh: "sortAmountHigh",
  amountLow: "sortAmountLow",
  expirationSoon: "sortExpirationSoon",
};

const QUICK_OPTIONS: readonly GiftCardQuickFilter[] = ["", "active", "expired", "unredeemed"];

const QUICK_LABEL_KEYS: Record<Exclude<GiftCardQuickFilter, "">, string> = {
  active: "quickActive",
  expired: "quickExpired",
  unredeemed: "quickUnredeemed",
};

export function AdminGiftCardsFilters({
  values,
  activeFilterCount,
  onChange,
  onReset,
}: AdminGiftCardsFiltersProps) {
  const t = useTranslations("adminPages.giftCards.filters");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("search")}</span>
          <input
            className="ommm-input"
            value={values.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("search")}
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("status")}</span>
          <OmmFilterDropdown
            allValue="all"
            value={values.status}
            ariaLabel={t("status")}
            allLabel={t("statusAll")}
            onChange={(value) => onChange("status", value as GiftCardStatusFilter)}
            options={GIFT_CARD_STATUSES.map((status) => ({
              value: status,
              label: t(`statusValues.${status}`),
            }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("expiration")}</span>
          <OmmFilterDropdown
            allValue="all"
            value={values.expiration}
            ariaLabel={t("expiration")}
            allLabel={t("expirationAll")}
            onChange={(value) => onChange("expiration", value as GiftCardExpirationFilter)}
            options={[
              { value: "valid", label: t("expirationValid") },
              { value: "expired", label: t("expirationExpired") },
            ]}
          />
        </div>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("amountMin")}</span>
          <input
            className="ommm-input"
            inputMode="numeric"
            value={values.amountMin}
            onChange={(event) => onChange("amountMin", event.target.value)}
            placeholder={t("amountMinPlaceholder")}
            aria-label={t("amountMin")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("amountMax")}</span>
          <input
            className="ommm-input"
            inputMode="numeric"
            value={values.amountMax}
            onChange={(event) => onChange("amountMax", event.target.value)}
            placeholder={t("amountMaxPlaceholder")}
            aria-label={t("amountMax")}
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("sort")}</span>
          <OmmSelectDropdown
            ariaLabel={t("sort")}
            label={t(SORT_LABEL_KEYS[values.order])}
            value={values.order}
            options={SORT_OPTIONS.map((option) => ({
              value: option,
              label: t(SORT_LABEL_KEYS[option]),
            }))}
            onChange={(value) => onChange("order", value as GiftCardSortOrder)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("quick")}</span>
          <OmmSelectDropdown
            ariaLabel={t("quick")}
            label={
              values.quick === ""
                ? t("quickAll")
                : t(QUICK_LABEL_KEYS[values.quick])
            }
            value={values.quick}
            options={QUICK_OPTIONS.map((option) => ({
              value: option,
              label: option === "" ? t("quickAll") : t(QUICK_LABEL_KEYS[option]),
            }))}
            onChange={(value) => onChange("quick", value as GiftCardQuickFilter)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {activeFilterCount > 0 ? (
          <span className="text-xs text-sage-500">
            {t("activeCount", { count: activeFilterCount })}
          </span>
        ) : null}
        <OmmButton type="button" variant="ghost" size="sm" onClick={onReset}>
          {t("reset")}
        </OmmButton>
      </div>
    </div>
  );
}
