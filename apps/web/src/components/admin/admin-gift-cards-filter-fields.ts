import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import { GIFT_CARD_STATUSES } from "@/components/admin/admin-gift-cards-types";
import type {
  GiftCardFilterValues,
  GiftCardQuickFilter,
  GiftCardSortOrder,
} from "@/components/admin/admin-gift-cards-types";
import { formatAmdFromCents, parseAmdMoneyInput } from "@/lib/price-amd";

type BuildAdminGiftCardsFilterFieldsArgs = {
  labels: {
    status: string;
    statusAll: string;
    statusValues: Record<(typeof GIFT_CARD_STATUSES)[number], string>;
    expiration: string;
    expirationAll: string;
    expirationValid: string;
    expirationExpired: string;
    amountMin: string;
    amountMinPlaceholder: string;
    amountMax: string;
    amountMaxPlaceholder: string;
    sort: string;
    sortLabels: Record<GiftCardSortOrder, string>;
    quick: string;
    quickAll: string;
    quickActive: string;
    quickExpired: string;
    quickUnredeemed: string;
  };
  renderAmountMin: AdminIntegratedFilterField["render"];
  renderAmountMax: AdminIntegratedFilterField["render"];
  renderOrder: AdminIntegratedFilterField["render"];
};

export function adminGiftCardsIntegratedFilterValues(
  values: Omit<GiftCardFilterValues, "search">,
): Record<string, string> {
  return {
    status: values.status,
    expiration: values.expiration,
    amountMin: values.amountMin,
    amountMax: values.amountMax,
    order: values.order,
    quick: values.quick,
  };
}

export function buildAdminGiftCardsFilterFields({
  labels,
  renderAmountMin,
  renderAmountMax,
  renderOrder,
}: BuildAdminGiftCardsFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    {
      key: "status",
      label: labels.status,
      emptyValue: "all",
      allLabel: labels.statusAll,
      options: GIFT_CARD_STATUSES.map((status) => ({
        value: status,
        label: labels.statusValues[status],
      })),
    },
    {
      key: "expiration",
      label: labels.expiration,
      emptyValue: "all",
      allLabel: labels.expirationAll,
      options: [
        { value: "valid", label: labels.expirationValid },
        { value: "expired", label: labels.expirationExpired },
      ],
    },
    {
      key: "amountMin",
      label: labels.amountMin,
      emptyValue: "",
      resolveChipLabel: (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
          return null;
        }
        const parsed = parseAmdMoneyInput(trimmed);
        const amount =
          parsed !== null ? formatAmdFromCents(parsed, "en") : trimmed;
        return `${labels.amountMin}: ${amount}`;
      },
      render: renderAmountMin,
    },
    {
      key: "amountMax",
      label: labels.amountMax,
      emptyValue: "",
      resolveChipLabel: (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
          return null;
        }
        const parsed = parseAmdMoneyInput(trimmed);
        const amount =
          parsed !== null ? formatAmdFromCents(parsed, "en") : trimmed;
        return `${labels.amountMax}: ${amount}`;
      },
      render: renderAmountMax,
    },
    {
      key: "order",
      label: labels.sort,
      emptyValue: "newest",
      resolveChipLabel: (value) =>
        value !== "newest" ? `${labels.sort}: ${labels.sortLabels[value as GiftCardSortOrder] ?? value}` : null,
      render: renderOrder,
    },
    {
      key: "quick",
      label: labels.quick,
      emptyValue: "",
      allLabel: labels.quickAll,
      options: [
        { value: "active", label: labels.quickActive },
        { value: "expired", label: labels.quickExpired },
        { value: "unredeemed", label: labels.quickUnredeemed },
      ],
      resolveChipLabel: (value) => {
        if (value === "") {
          return null;
        }
        const quickLabels: Record<Exclude<GiftCardQuickFilter, "">, string> = {
          active: labels.quickActive,
          expired: labels.quickExpired,
          unredeemed: labels.quickUnredeemed,
        };
        return value in quickLabels
          ? `${labels.quick}: ${quickLabels[value as Exclude<GiftCardQuickFilter, "">]}`
          : null;
      },
    },
  ];
}
