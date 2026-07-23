"use client";

import type { AnalyticsBarItem } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsBarListProps = {
  items: AnalyticsBarItem[];
  emptyLabel: string;
  valueSuffix?: string;
  ariaLabel: string;
  emphasis?: boolean;
};

export function AdminAnalyticsBarList({
  items,
  emptyLabel,
  valueSuffix = "",
  ariaLabel,
  emphasis = false,
}: AdminAnalyticsBarListProps) {
  const max = items.reduce((peak, item) => Math.max(peak, item.value), 0);

  if (items.length === 0) {
    return <p className="text-sm text-sage-500">{emptyLabel}</p>;
  }

  const trackClass = emphasis ? "h-3 bg-sage-100/90" : "h-2 bg-sage-100";
  const barClass = emphasis
    ? "h-full rounded-full bg-gradient-to-r from-sand-400 to-sand-500"
    : "h-full rounded-full bg-sand-500";

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
            <div className={`overflow-hidden rounded-full ${trackClass}`} role="presentation">
              <div className={`${barClass} transition-[width]`} style={{ width: `${widthPct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
