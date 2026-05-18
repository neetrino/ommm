import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { HomeWeeklyScheduleSessionCard } from "@/components/marketing/home/home-weekly-schedule-session-card";
import {
  HOME_WEEKLY_SCHEDULE_DAY_ORDER,
  groupScheduleByWeekday,
} from "@/components/marketing/home/group-schedule-by-weekday";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import type { MarketingScheduleDayOfWeek } from "@/components/marketing/schedule/marketing-schedule-types";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeWeeklyScheduleGridProps = {
  locale: string;
  items: readonly MarketingScheduleItem[];
};

export async function HomeWeeklyScheduleGrid({ locale, items }: HomeWeeklyScheduleGridProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const byDay = groupScheduleByWeekday(items);

  return (
    <div
      className={`${marketingMontserrat.variable} mt-8 w-full min-w-0 md:mt-10`}
      role="region"
      aria-label={t("weeklyScheduleGridAria")}
    >
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-0 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-7 md:gap-x-[0.9375rem] md:gap-y-5 md:overflow-visible md:scroll-px-0 md:pb-0 md:snap-none [&::-webkit-scrollbar]:hidden"
      >
        {HOME_WEEKLY_SCHEDULE_DAY_ORDER.map((day) => (
          <WeeklyScheduleDayColumn
            key={day}
            day={day}
            dayLabel={t(`weeklyScheduleDays.${day}`)}
            sessions={byDay[day]}
            locale={locale}
            emptyLabel={t("weeklyScheduleEmptyDay")}
            formatBookAria={(className) =>
              t("weeklyScheduleBookSessionAria", { className })
            }
          />
        ))}
      </div>
    </div>
  );
}

type WeeklyScheduleDayColumnProps = {
  day: MarketingScheduleDayOfWeek;
  dayLabel: string;
  sessions: readonly MarketingScheduleItem[];
  locale: string;
  emptyLabel: string;
  formatBookAria: (className: string) => string;
};

function WeeklyScheduleDayColumn({
  day,
  dayLabel,
  sessions,
  locale,
  emptyLabel,
  formatBookAria,
}: WeeklyScheduleDayColumnProps) {
  return (
    <div
      className="flex w-[var(--home-schedule-col-width)] min-w-0 shrink-0 snap-center flex-col gap-5 md:w-auto md:shrink md:snap-align-none"
      style={
        {
          "--home-schedule-col-width": HOME_WEEKLY_SCHEDULE_LAYOUT.mobileColumnWidth,
        } as CSSProperties
      }
      data-day={day}
    >
      <p
        className={`${marketingMontserrat.className} text-center text-lg font-bold leading-6`}
        style={{ color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk }}
      >
        {dayLabel}
      </p>
      <div className="flex min-w-0 flex-col gap-5">
        {sessions.length === 0 ? (
          <div
            className={`${marketingMontserrat.className} flex items-center justify-center rounded-[2.5rem] border border-dashed px-3 py-8 text-center text-sm font-semibold leading-6`}
            style={{
              minHeight: HOME_WEEKLY_SCHEDULE_LAYOUT.cardMinHeight,
              borderColor: HOME_WEEKLY_SCHEDULE_FIGMA.cardBorder,
              color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
            }}
          >
            {emptyLabel}
          </div>
        ) : (
          sessions.map((item) => (
            <HomeWeeklyScheduleSessionCard
              key={item.id}
              item={item}
              locale={locale}
              bookAriaLabel={formatBookAria(item.className)}
            />
          ))
        )}
      </div>
    </div>
  );
}
