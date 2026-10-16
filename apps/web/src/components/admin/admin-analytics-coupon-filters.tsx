import { couponPersonLabel } from "@/components/admin/admin-coupon-display";
import type { AdminCouponRow, CouponDisplayStatus } from "@/components/admin/admin-coupons-types";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";

export const COUPON_ANALYTICS_STATUSES: readonly CouponDisplayStatus[] = [
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "DISABLED",
  "USAGE_LIMIT_REACHED",
];

export type CouponAnalyticsFilterChoice = {
  value: string;
  label: string;
};

export type CouponAnalyticsFilterChoices = {
  coupons: CouponAnalyticsFilterChoice[];
  creators: CouponAnalyticsFilterChoice[];
};

export type CouponAnalyticsFilterLabels = {
  all: string;
  coupon: string;
  type: string;
  percentage: string;
  fixed: string;
  status: string;
  statusLabels: Record<CouponDisplayStatus, string>;
  creator: string;
  user: string;
};

const EMPTY_CHOICES: CouponAnalyticsFilterChoices = { coupons: [], creators: [] };

export function emptyCouponAnalyticsFilterChoices(): CouponAnalyticsFilterChoices {
  return EMPTY_CHOICES;
}

export function couponFilterLabels(t: (key: string) => string): CouponAnalyticsFilterLabels {
  return {
    all: t("filterAll"),
    coupon: t("filterCoupon"),
    type: t("type"),
    percentage: t("percentage"),
    fixed: t("fixed"),
    status: t("filterStatus"),
    statusLabels: {
      DRAFT: t("status.DRAFT"),
      ACTIVE: t("status.ACTIVE"),
      EXPIRED: t("status.EXPIRED"),
      DISABLED: t("status.DISABLED"),
      USAGE_LIMIT_REACHED: t("status.USAGE_LIMIT_REACHED"),
    },
    creator: t("filterCreator"),
    user: t("filterUser"),
  };
}

export function couponAnalyticsFilterChoices(rows: AdminCouponRow[]): CouponAnalyticsFilterChoices {
  const creators = new Map<string, string>();
  for (const row of rows) {
    creators.set(row.createdBy.id, couponPersonLabel(row.createdBy));
  }
  return {
    coupons: rows.map((row) => ({ value: row.id, label: row.code })),
    creators: [...creators.entries()].map(([value, label]) => ({ value, label })),
  };
}

export function buildCouponAnalyticsFilterFields(
  choices: CouponAnalyticsFilterChoices,
  labels: CouponAnalyticsFilterLabels,
): AdminIntegratedFilterField[] {
  const statuses = COUPON_ANALYTICS_STATUSES.map((status) => ({
    value: status,
    label: labels.statusLabels[status],
  }));
  const types = [
    { value: "PERCENTAGE", label: labels.percentage },
    { value: "FIXED_AMOUNT", label: labels.fixed },
  ];
  return [
    dropdownField("couponId", labels.coupon, labels.all, choices.coupons),
    dropdownField("discountType", labels.type, labels.all, types),
    dropdownField("couponStatus", labels.status, labels.all, statuses),
    dropdownField("creatorId", labels.creator, labels.all, choices.creators),
    userEmailField(labels.user, labels.all),
  ];
}

function dropdownField(
  key: string,
  label: string,
  allLabel: string,
  options: readonly CouponAnalyticsFilterChoice[],
): AdminIntegratedFilterField {
  return {
    key,
    label,
    fieldType: "custom",
    emptyValue: "",
    alwaysShowChip: true,
    options,
    resolveChipLabel: (value) => chipLabel(label, allLabel, value, options),
    render: ({ value, onChange }) => (
      <OmmFilterDropdown
        allValue=""
        value={value}
        ariaLabel={label}
        allLabel={allLabel}
        onChange={onChange}
        options={[...options]}
      />
    ),
  };
}

function userEmailField(label: string, allLabel: string): AdminIntegratedFilterField {
  return {
    key: "userEmail",
    label,
    fieldType: "custom",
    emptyValue: "",
    alwaysShowChip: true,
    resolveChipLabel: (value) => (value.trim() ? `${label}: ${value.trim()}` : `${label}: ${allLabel}`),
    render: ({ value, onChange }) => (
      <input
        value={value}
        aria-label={label}
        placeholder={allLabel}
        onChange={(event) => onChange(event.target.value)}
        className="ommm-input"
      />
    ),
  };
}

function chipLabel(
  label: string,
  allLabel: string,
  value: string,
  options: readonly CouponAnalyticsFilterChoice[],
): string {
  if (!value) {
    return `${label}: ${allLabel}`;
  }
  const option = options.find((item) => item.value === value);
  return `${label}: ${option?.label ?? value}`;
}
