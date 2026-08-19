import type { AnalyticsRankRow } from "@/components/admin/admin-analytics-shared-ui";
import { sortBarItems } from "@/components/admin/admin-analytics-helpers";
import type {
  AnalyticsBarItem,
  AnalyticsSortKey,
  StudioAnalyticsPayload,
} from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

const UNASSIGNED_CLASS_TYPE_ID = "unassigned";

export function resolveClassTypeLabel(
  id: string,
  label: string,
  unassignedLabel: string,
): string {
  return id === UNASSIGNED_CLASS_TYPE_ID ? unassignedLabel : label;
}

export function buildPackageSalesBarItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  locale: string,
): AnalyticsBarItem[] {
  const items = studio.revenue.byPackage.map((entry) => ({
    key: entry.id,
    label: entry.label,
    value: entry.amountCents,
    displayValue: `${formatAmdFromCents(entry.amountCents, locale)} (${entry.count})`,
  }));
  return sortBarItems(items, sortKey);
}

export function buildPackageSalesColumnData(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
) {
  return sortBarItems(
    studio.revenue.byPackage.map((entry) => ({
      key: entry.id,
      label: entry.label,
      value: entry.amountCents,
    })),
    sortKey,
  ).map((entry) => ({
    label: entry.label,
    tooltipLabel: entry.label,
    amount: entry.value,
  }));
}

export function buildClassTypeSalesColumnData(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  unassignedLabel: string,
) {
  return sortBarItems(
    studio.revenue.byClassType.map((entry) => ({
      key: entry.id,
      label: resolveClassTypeLabel(entry.id, entry.label, unassignedLabel),
      value: entry.amountCents,
    })),
    sortKey,
  ).map((entry) => ({
    label: entry.label,
    tooltipLabel: entry.label,
    amount: entry.value,
  }));
}

export function buildPackageSalesRankRows(
  studio: StudioAnalyticsPayload,
  locale: string,
): AnalyticsRankRow[] {
  return studio.revenue.byPackage.map((entry) => ({
    key: entry.id,
    label: entry.label,
    value: entry.amountCents,
    displayValue: formatAmdFromCents(entry.amountCents, locale),
    secondaryValue: String(entry.count),
  }));
}

export function buildTopClientRankRows(
  studio: StudioAnalyticsPayload,
  locale: string,
): AnalyticsRankRow[] {
  return studio.revenue.topClients.map((entry) => ({
    key: entry.id,
    label: entry.label,
    value: entry.amountCents,
    displayValue: formatAmdFromCents(entry.amountCents, locale),
    secondaryValue: String(entry.paymentsCount),
  }));
}

export function buildClassTypeRankRows(
  studio: StudioAnalyticsPayload,
  locale: string,
  unassignedLabel: string,
): AnalyticsRankRow[] {
  return studio.revenue.byClassType.map((entry) => ({
    key: entry.id,
    label: resolveClassTypeLabel(entry.id, entry.label, unassignedLabel),
    value: entry.amountCents,
    displayValue: formatAmdFromCents(entry.amountCents, locale),
    secondaryValue: String(entry.bookings),
  }));
}

export function pickTopNamedAmount(
  rows: Array<{ label: string; amountCents: number }>,
): { label: string; amountCents: number } | null {
  const top = rows[0];
  if (!top || top.amountCents <= 0) {
    return null;
  }
  return { label: top.label, amountCents: top.amountCents };
}

export function formatNamedAmount(
  row: { label: string; amountCents: number } | null,
  locale: string,
  emptyLabel: string,
): string {
  if (!row) {
    return emptyLabel;
  }
  return `${row.label} · ${formatAmdFromCents(row.amountCents, locale)}`;
}
