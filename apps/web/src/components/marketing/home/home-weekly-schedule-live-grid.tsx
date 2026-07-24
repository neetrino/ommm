"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { buildHomeWeeklyScheduleDays } from "@/components/marketing/home/build-home-weekly-schedule-days";
import { getDefaultWeeklyScheduleDay } from "@/components/marketing/home/get-default-weekly-schedule-day";
import { HomeWeeklyScheduleDayView } from "@/components/marketing/home/home-weekly-schedule-compact-view";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { useMarketingScheduleMemberState } from "@/components/marketing/schedule/use-marketing-schedule-member-state";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeWeeklyScheduleLiveGridProps = {
  locale: string;
  initialItems: readonly MarketingScheduleItem[];
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

/** Renders live public schedule rows from the API. */
export function HomeWeeklyScheduleLiveGrid({ locale, initialItems }: HomeWeeklyScheduleLiveGridProps) {
  const t = useTranslations("marketingPublic.home");
  const tSchedule = useTranslations("marketingPages.schedule");
  const audience = useMarketingAudience();
  const isMember = audience === "member";

  const {
    items,
    bookedBySessionId,
    memberWaitlistLoaded,
    waitlistedSessionIds,
    memberActionStateReady,
    handleBooked,
    handleCancelled,
    handleWaitlisted,
    handleWaitlistLeft,
  } = useMarketingScheduleMemberState({
    isMember,
    initialItems,
  });

  const activeItems = useMemo(
    () => sortScheduleItems(items.filter((item) => item.isActive)),
    [items],
  );

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

  const days = useMemo(() => buildHomeWeeklyScheduleDays(activeItems, labels), [activeItems, labels]);
  const initialDay = useMemo(
    () => getDefaultWeeklyScheduleDay(activeItems),
    [activeItems],
  );

  return (
    <div
      className={`${marketingMontserrat.variable} w-full min-w-0 tablet:mt-8 xl:mt-10`}
      role="region"
      aria-label={t("weeklyScheduleGridAria")}
    >
      <HomeWeeklyScheduleDayView
        locale={locale}
        days={days}
        initialDay={initialDay}
        audience={audience}
        bookLabel={tSchedule("bookCta")}
        bookingEnabled
        bookedBySessionId={bookedBySessionId}
        memberActionStateReady={memberActionStateReady}
        memberWaitlistLoaded={memberWaitlistLoaded}
        waitlistedSessionIds={waitlistedSessionIds}
        onBooked={handleBooked}
        onCancelled={handleCancelled}
        onWaitlisted={handleWaitlisted}
        onWaitlistLeft={handleWaitlistLeft}
      />
    </div>
  );
}
