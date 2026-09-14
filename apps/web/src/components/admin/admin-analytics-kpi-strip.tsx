"use client";

export type AdminAnalyticsKpiItem = {
  key: string;
  label: string;
  value: string;
  deltaPercent?: number | null;
  hint?: string;
  /** Mobile 2-col grids — span full row so the card reads larger. */
  fullWidthOnMobile?: boolean;
};

type AdminAnalyticsKpiStripProps = {
  items: readonly AdminAnalyticsKpiItem[];
  trendNotAvailableLabel?: string;
  /** Mobile grid columns. Desktop breakpoints stay unchanged. */
  mobileColumns?: 1 | 2;
  /** Smaller label/value/hint — e.g. ranking teaser cards. */
  compact?: boolean;
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

function buildColumnClass(itemCount: number, mobileColumns: 1 | 2): string {
  const mobile = mobileColumns === 1 ? "grid-cols-1" : "grid-cols-2";
  if (itemCount >= 5) {
    return `${mobile} sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`;
  }
  if (itemCount === 4) {
    return `${mobile} sm:grid-cols-2 lg:grid-cols-4`;
  }
  if (itemCount === 3) {
    return `${mobile} sm:grid-cols-3`;
  }
  return `${mobile} sm:grid-cols-2`;
}

export function AdminAnalyticsKpiStrip({
  items,
  trendNotAvailableLabel = "N/A",
  mobileColumns = 2,
  compact = false,
}: AdminAnalyticsKpiStripProps) {
  if (items.length === 0) {
    return null;
  }

  const singleMobile = mobileColumns === 1;

  return (
    <ul className={`grid gap-3 ${buildColumnClass(items.length, mobileColumns)}`}>
      {items.map((item) => {
        const trendLabel = formatTrendLabel(item.deltaPercent, trendNotAvailableLabel);
        const showTrend = item.deltaPercent !== undefined;
        const emphasizeMobile =
          !compact && (singleMobile || item.fullWidthOnMobile === true);

        return (
          <li
            key={item.key}
            className={[
              "rounded-[20px] border border-white/60 bg-white/55 px-3 py-2.5 shadow-[0_8px_24px_-20px_rgba(45,40,35,0.2)] backdrop-blur-md",
              !singleMobile && item.fullWidthOnMobile === true ? "max-md:col-span-2" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-wide text-sage-500 max-md:truncate max-md:whitespace-nowrap"
              title={item.label}
            >
              {item.label}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p
                className={[
                  "font-semibold tabular-nums text-sage-900 max-md:min-w-0 max-md:truncate",
                  compact
                    ? "text-base"
                    : emphasizeMobile
                      ? "text-lg max-md:text-2xl"
                      : "text-lg",
                ].join(" ")}
                title={item.value}
              >
                {item.value}
              </p>
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
