"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { buildHomeWeeklyScheduleDays } from "@/components/marketing/home/build-home-weekly-schedule-days";
import { getDefaultWeeklyScheduleDay } from "@/components/marketing/home/get-default-weekly-schedule-day";
import { HomeWeeklyScheduleDayView } from "@/components/marketing/home/home-weekly-schedule-compact-view";
import { HOME_WEEKLY_SCHEDULE_FALLBACK_ITEMS } from "@/components/marketing/home/home-weekly-schedule-fallback-items";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

const LIVE_SCHEDULE_FETCH_MS = 2_000;

type HomeWeeklyScheduleLiveGridProps = {
  locale: string;
};

function sortScheduleItems(items: readonly MarketingScheduleItem[]): MarketingScheduleItem[] {
  const dayOrder: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  return [...items].sort((a, b) => {
    const dayDelta = dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
    if (dayDelta !== 0) {
      return dayDelta;
    }
    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** Renders fallback schedule immediately, then swaps to live API data when available. */
export function HomeWeeklyScheduleLiveGrid({ locale }: HomeWeeklyScheduleLiveGridProps) {
  const t = useTranslations("marketingPublic.home");
  const [items, setItems] = useState<readonly MarketingScheduleItem[]>(
    HOME_WEEKLY_SCHEDULE_FALLBACK_ITEMS,
  );
  const [usingFallback, setUsingFallback] = useState(true);

  const labels = useMemo(
    () => ({
      emptyDay: t("weeklyScheduleEmptyDay"),
      day: (day: MarketingScheduleItem["dayOfWeek"]) => t(`weeklyScheduleDays.${day}`),
      bookSessionAria: (className: string) =>
        t("weeklyScheduleBookSessionAria", { className }),
      withInstructor: (name: string) => t("weeklyScheduleWithInstructor", { name }),
      duration: (count: number) => t("weeklyScheduleDuration", { count }),
      durationFallback: t("weeklyScheduleDurationFallback"),
      spotsLeft: (count: number) => t("weeklyScheduleSpotsLeft", { count }),
    }),
    [t],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), LIVE_SCHEDULE_FETCH_MS);

    void (async () => {
      try {
        const response = await fetch("/api/v1/schedule/public", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as MarketingScheduleItem[];
        const activeItems = sortScheduleItems(payload.filter((item) => item.isActive));
        if (activeItems.length === 0) {
          return;
        }

        setItems(activeItems);
        setUsingFallback(false);
      } catch {
        // Keep fallback rows silently when live schedule is unavailable.
      } finally {
        window.clearTimeout(timeoutId);
      }
    })();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const days = useMemo(() => buildHomeWeeklyScheduleDays(items, labels), [items, labels]);
  const initialDay = usingFallback ? "MONDAY" : getDefaultWeeklyScheduleDay();

  return (
    <div
      className={`${marketingMontserrat.variable} w-full min-w-0 tablet:mt-8 xl:mt-10`}
      role="region"
      aria-label={t("weeklyScheduleGridAria")}
    >
      <HomeWeeklyScheduleDayView locale={locale} days={days} initialDay={initialDay} />
    </div>
  );
}
