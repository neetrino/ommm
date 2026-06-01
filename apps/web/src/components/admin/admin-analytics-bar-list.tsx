"use client";

import type { AnalyticsBarItem } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsBarListProps = {
  items: AnalyticsBarItem[];
  emptyLabel: string;
  valueSuffix?: string;
  ariaLabel: string;
};

export function AdminAnalyticsBarList({
  items,
  emptyLabel,
  valueSuffix = "",
  ariaLabel,
}: AdminAnalyticsBarListProps) {
  const max = items.reduce((peak, item) => Math.max(peak, item.value), 0);

  if (items.length === 0) {
    return <p className="text-sm text-sage-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3" aria-label={ariaLabel}>
      {items.map((item) => {
        const widthPct = max > 0 ? Math.round((item.value / max) * 100) : 0;
        const display = item.displayValue ?? `${item.value}${valueSuffix}`;
        return (
          <li key={item.key}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-sage-800">{item.label}</span>
              <span className="tabular-nums text-sage-600">{display}</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-sage-100"
              role="presentation"
            >
              <div
                className="h-full rounded-full bg-sand-500 transition-[width]"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
