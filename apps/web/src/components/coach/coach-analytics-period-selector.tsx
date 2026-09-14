"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { CoachAnalyticsPeriod } from "@/components/coach/coach-analytics-types";
import {
  oliveSegmentedFillSegmentClassName,
  oliveSegmentedFillTrackClass,
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
} from "@/components/ui/olive-segmented-switcher";

type CoachAnalyticsPeriodSelectorProps = {
  value: CoachAnalyticsPeriod;
  /** Full-width equal columns (mobile analytics). */
  fullWidth?: boolean;
};

const PERIODS = ["month", "year"] as const satisfies readonly CoachAnalyticsPeriod[];
const PERIOD_COLUMN_COUNT = 2;

export function CoachAnalyticsPeriodSelector({
  value,
  fullWidth = false,
}: CoachAnalyticsPeriodSelectorProps) {
  const t = useTranslations("coachPages.analytics");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const activeIndex = Math.max(0, PERIODS.indexOf(value));

  const setPeriod = (period: CoachAnalyticsPeriod) => {
    const next = new URLSearchParams(searchParams.toString());
    if (period === "month") {
      next.delete("period");
    } else {
      next.set("period", period);
    }
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  const labels: Record<CoachAnalyticsPeriod, string> = {
    month: t("periodMonth"),
    year: t("periodYear"),
  };

  const trackClass = fullWidth
    ? oliveSegmentedFillTrackClass(PERIOD_COLUMN_COUNT, "w-full")
    : oliveSegmentedTrackClass(PERIOD_COLUMN_COUNT);

  return (
    <div role="tablist" aria-label={t("periodAria")} className={trackClass}>
      <span
        aria-hidden
        className={oliveSegmentedThumbClass(PERIOD_COLUMN_COUNT, activeIndex)}
      />
      {PERIODS.map((period) => {
        const active = value === period;
        return (
          <button
            key={period}
            type="button"
            role="tab"
            aria-selected={active}
            className={
              fullWidth
                ? oliveSegmentedFillSegmentClassName(active)
                : oliveSegmentedSegmentClassName(active, PERIOD_COLUMN_COUNT)
            }
            onClick={() => setPeriod(period)}
          >
            {labels[period]}
          </button>
        );
      })}
    </div>
  );
}
