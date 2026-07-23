"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { CoachAnalyticsPeriod } from "@/components/coach/coach-analytics-types";

type CoachAnalyticsPeriodSelectorProps = {
  value: CoachAnalyticsPeriod;
};

const SEGMENT_BASE =
  "inline-flex cursor-pointer items-center rounded-full px-3 py-2 text-sm font-medium transition-[background-color,box-shadow,color,transform] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_BASE} bg-white text-sage-900 shadow-sm hover:bg-white hover:shadow-md`
    : `${SEGMENT_BASE} text-sage-600 hover:bg-white/60 hover:text-sage-900 hover:shadow-sm`;
}

export function CoachAnalyticsPeriodSelector({ value }: CoachAnalyticsPeriodSelectorProps) {
  const t = useTranslations("coachPages.analytics");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

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

  return (
    <div
      role="group"
      aria-label={t("periodAria")}
      className="inline-flex rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md"
    >
      <button
        type="button"
        aria-pressed={value === "month"}
        className={segmentClassName(value === "month")}
        onClick={() => setPeriod("month")}
      >
        {t("periodMonth")}
      </button>
      <button
        type="button"
        aria-pressed={value === "year"}
        className={segmentClassName(value === "year")}
        onClick={() => setPeriod("year")}
      >
        {t("periodYear")}
      </button>
    </div>
  );
}
