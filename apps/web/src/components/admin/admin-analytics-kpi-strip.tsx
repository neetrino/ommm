"use client";

export type AdminAnalyticsKpiItem = {
  key: string;
  label: string;
  value: string;
  deltaPercent?: number | null;
  hint?: string;
};

type AdminAnalyticsKpiStripProps = {
  items: readonly AdminAnalyticsKpiItem[];
  trendNotAvailableLabel?: string;
};

function formatTrendLabel(trendPercent: number | null | undefined, fallback: string): string {
  if (trendPercent === undefined) {
    return "";
  }
  if (trendPercent === null) {
    return fallback;
  }
  const rounded = Math.round(trendPercent);
  if (rounded > 0) {
    return `+${rounded}%`;
  }
  if (rounded < 0) {
    return `${rounded}%`;
  }
  return "0%";
}

function trendToneClass(trendPercent: number | null | undefined): string {
  if (trendPercent === undefined || trendPercent === null) {
    return "text-sage-400";
  }
  if (trendPercent > 0) {
    return "text-emerald-600";
  }
  if (trendPercent < 0) {
    return "text-rose-600";
  }
  return "text-sage-500";
}

export function AdminAnalyticsKpiStrip({
  items,
  trendNotAvailableLabel = "N/A",
}: AdminAnalyticsKpiStripProps) {
  if (items.length === 0) {
    return null;
  }

  const columnClass =
    items.length >= 5
      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : items.length === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : items.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2";

  return (
    <ul className={`grid gap-3 ${columnClass}`}>
      {items.map((item) => {
        const trendLabel = formatTrendLabel(item.deltaPercent, trendNotAvailableLabel);
        const showTrend = item.deltaPercent !== undefined;

        return (
          <li
            key={item.key}
            className="rounded-[20px] border border-white/60 bg-white/55 px-3 py-2.5 shadow-[0_8px_24px_-20px_rgba(45,40,35,0.2)] backdrop-blur-md"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-sage-500">
              {item.label}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-lg font-semibold tabular-nums text-sage-900">{item.value}</p>
              {showTrend ? (
                <p
                  className={`text-xs font-medium tabular-nums ${trendToneClass(item.deltaPercent)}`}
                >
                  {trendLabel}
                </p>
              ) : null}
            </div>
            {item.hint ? <p className="mt-1 text-[11px] text-sage-500">{item.hint}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
