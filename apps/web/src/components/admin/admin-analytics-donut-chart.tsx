"use client";

import type { AnalyticsBarItem } from "@/components/admin/admin-analytics-types";

const SEGMENT_COLORS = [
  "#b8956f",
  "#6b7c6a",
  "#9bc4b5",
  "#a8a29e",
  "#d4c4b7",
  "#8a9a88",
] as const;

type AdminAnalyticsDonutChartProps = {
  items: readonly AnalyticsBarItem[];
  emptyLabel: string;
  ariaLabel: string;
};

function buildConicGradient(
  items: readonly AnalyticsBarItem[],
  total: number,
): string {
  let cursor = 0;
  const stops = items.map((item, index) => {
    const start = cursor;
    const slice = total > 0 ? (item.value / total) * 100 : 0;
    cursor += slice;
    const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
    return `${color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

export function AdminAnalyticsDonutChart({
  items,
  emptyLabel,
  ariaLabel,
}: AdminAnalyticsDonutChartProps) {
  const positiveItems = items.filter((item) => item.value > 0);
  const total = positiveItems.reduce((sum, item) => sum + item.value, 0);

  if (positiveItems.length === 0 || total <= 0) {
    return <p className="text-sm text-sage-500">{emptyLabel}</p>;
  }

  const gradient = buildConicGradient(positiveItems, total);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div
        className="relative mx-auto h-40 w-40 shrink-0 rounded-full shadow-inner"
        style={{ background: gradient }}
        role="img"
        aria-label={ariaLabel}
      >
        <div className="absolute inset-[22%] flex items-center justify-center rounded-full border border-white/70 bg-white/90 text-center shadow-sm">
          <span className="px-2 text-xs font-semibold tabular-nums text-sage-800">
            {positiveItems.length}
          </span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2" aria-hidden>
        {positiveItems.map((item, index) => {
          const pct = Math.round((item.value / total) * 100);
          const display = item.displayValue ?? String(item.value);
          const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
          return (
            <li key={item.key} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="min-w-0 flex-1 truncate font-medium text-sage-800">
                {item.label}
              </span>
              <span className="shrink-0 tabular-nums text-sage-600">
                {display} · {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
