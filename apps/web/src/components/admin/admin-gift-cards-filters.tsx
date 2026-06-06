"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  adminGiftCardsIntegratedFilterValues,
  buildAdminGiftCardsFilterFields,
} from "@/components/admin/admin-gift-cards-filter-fields";
import { AdminGiftCardsViewSwitcher } from "@/components/admin/admin-gift-cards-view-switcher";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import type {
  GiftCardExpirationFilter,
  GiftCardFilterValues,
  GiftCardQuickFilter,
  GiftCardSortOrder,
  GiftCardStatusFilter,
} from "@/components/admin/admin-gift-cards-types";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import type { AdminGiftCardsViewMode } from "@/lib/admin-gift-cards-view-preference";

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

type AdminGiftCardsFiltersProps = {
  values: GiftCardFilterValues;
  activeFilterCount: number;
  isUpdating: boolean;
  viewMode: AdminGiftCardsViewMode;
  onChange: <K extends keyof GiftCardFilterValues>(
    key: K,
    value: GiftCardFilterValues[K],
  ) => void;
  onReset: () => void;
  onViewChange: (mode: AdminGiftCardsViewMode) => void;
  onCreate: () => void;
  /** Staff layout: search row only (hero lives in StaffListPageLayout). */
  variant?: "full" | "embedded";
  hideCreate?: boolean;
};

function AddGiftCardGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2v20M2 12h20" />
    </svg>
  );
}

export function AdminGiftCardsFilters({
  values,
  activeFilterCount,
  isUpdating,
  viewMode,
  onChange,
  onReset,
  onViewChange,
  onCreate,
  variant = "full",
  hideCreate = false,
}: AdminGiftCardsFiltersProps) {
  const t = useTranslations("adminPages.giftCards");
  const tFilters = useTranslations("adminPages.giftCards.filters");

  const filterFields = useMemo(
    () =>
      buildAdminGiftCardsFilterFields({
        labels: {
          status: tFilters("status"),
          statusAll: tFilters("statusAll"),
          statusValues: {
            ACTIVE: tFilters("statusValues.ACTIVE"),
            REDEEMED: tFilters("statusValues.REDEEMED"),
            EXPIRED: tFilters("statusValues.EXPIRED"),
            DEACTIVATED: tFilters("statusValues.DEACTIVATED"),
          },
          expiration: tFilters("expiration"),
          expirationAll: tFilters("expirationAll"),
          expirationValid: tFilters("expirationValid"),
          expirationExpired: tFilters("expirationExpired"),
          amountMin: tFilters("amountMin"),
          amountMinPlaceholder: tFilters("amountMinPlaceholder"),
          amountMax: tFilters("amountMax"),
          amountMaxPlaceholder: tFilters("amountMaxPlaceholder"),
          sort: tFilters("sort"),
          sortLabels: {
            newest: tFilters("sortNewest"),
            oldest: tFilters("sortOldest"),
            amountHigh: tFilters("sortAmountHigh"),
            amountLow: tFilters("sortAmountLow"),
            expirationSoon: tFilters("sortExpirationSoon"),
          },
          quick: tFilters("quick"),
          quickAll: tFilters("quickAll"),
          quickActive: tFilters("quickActive"),
          quickExpired: tFilters("quickExpired"),
          quickUnredeemed: tFilters("quickUnredeemed"),
        },
        renderAmountMin: ({ value, onChange: onFieldChange }) => (
          <input
            className="ommm-input h-10"
            inputMode="numeric"
            value={value}
            onChange={(event) => onFieldChange(event.target.value)}
            placeholder={tFilters("amountMinPlaceholder")}
            aria-label={tFilters("amountMin")}
          />
        ),
        renderAmountMax: ({ value, onChange: onFieldChange }) => (
          <input
            className="ommm-input h-10"
            inputMode="numeric"
            value={value}
            onChange={(event) => onFieldChange(event.target.value)}
            placeholder={tFilters("amountMaxPlaceholder")}
            aria-label={tFilters("amountMax")}
          />
        ),
        renderOrder: ({ value, onChange: onFieldChange }) => (
          <OmmSelectDropdown
            ariaLabel={tFilters("sort")}
            label={tFilters(SORT_LABEL_KEYS[value as GiftCardSortOrder] ?? "sortNewest")}
            value={value}
            options={SORT_OPTIONS.map((option) => ({
              value: option,
              label: tFilters(SORT_LABEL_KEYS[option]),
            }))}
            onChange={(next) => onFieldChange(next as GiftCardSortOrder)}
          />
        ),
      }),
    [tFilters],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminGiftCardsIntegratedFilterValues({
        status: values.status,
        expiration: values.expiration,
        amountMin: values.amountMin,
        amountMax: values.amountMax,
        order: values.order,
        quick: values.quick,
      }),
    [values],
  );

  function handleIntegratedFilterChange(key: string, value: string): void {
    switch (key) {
      case "status":
        onChange("status", value as GiftCardStatusFilter);
        break;
      case "expiration":
        onChange("expiration", value as GiftCardExpirationFilter);
        break;
      case "amountMin":
        onChange("amountMin", value);
        break;
      case "amountMax":
        onChange("amountMax", value);
        break;
      case "order":
        onChange("order", value as GiftCardSortOrder);
        break;
      case "quick":
        onChange("quick", value as GiftCardQuickFilter);
        break;
      default:
        break;
    }
  }

  const filterSearchRow = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ListPageSearchFilters
        search={values.search}
        onSearchChange={(value) => onChange("search", value)}
        searchPlaceholder={tFilters("searchPlaceholder")}
        fields={filterFields}
        filterValues={integratedFilterValues}
        onFilterChange={handleIntegratedFilterChange}
        onClearAll={onReset}
        resetLabel={tFilters("reset")}
      />
      <AdminGiftCardsViewSwitcher value={viewMode} onChange={onViewChange} />
    </div>
  );

  if (variant === "embedded") {
    return filterSearchRow;
  }

  return (
    <AdminPageHero
      title={t("title")}
      search={filterSearchRow}
      trailing={
        hideCreate ? null : (
          <OmmButton
            type="button"
            variant="secondary"
            size="md"
            onClick={onCreate}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
          >
            <AddGiftCardGlyph className="h-5 w-5 shrink-0" />
            {t("createButton")}
          </OmmButton>
        )
      }
    />
  );
}
