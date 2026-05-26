import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { HomeWeeklyScheduleSessionCard } from "@/components/marketing/home/home-weekly-schedule-session-card";
import {
  HomeWeeklyScheduleCompactView,
  type HomeWeeklyScheduleCompactDay,
} from "@/components/marketing/home/home-weekly-schedule-compact-view";
import { getDefaultWeeklyScheduleDay } from "@/components/marketing/home/get-default-weekly-schedule-day";
import {
  HOME_WEEKLY_SCHEDULE_DAY_ORDER,
  groupScheduleByWeekday,
} from "@/components/marketing/home/group-schedule-by-weekday";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_DESKTOP_GRID_CLASS,
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
  const emptyLabel = t("weeklyScheduleEmptyDay");

  const compactDays: HomeWeeklyScheduleCompactDay[] = HOME_WEEKLY_SCHEDULE_DAY_ORDER.map(
    (day) => ({
      day,
      label: t(`weeklyScheduleDays.${day}`),
      emptyLabel,
      sessions: byDay[day].map((item) => ({
        id: item.id,
        item,
        bookAriaLabel: t("weeklyScheduleBookSessionAria", { className: item.className }),
      })),
    }),
  );

  const desktopGridStyle = {
    "--home-schedule-card-min-h-lg": HOME_WEEKLY_SCHEDULE_LAYOUT.cardMinHeightGrid,
  } as CSSProperties;

  return (
    <div
      className={`${marketingMontserrat.variable} mt-6 w-full min-w-0 sm:mt-8 md:mt-10`}
      role="region"
      aria-label={t("weeklyScheduleGridAria")}
    >
      <HomeWeeklyScheduleCompactView
        locale={locale}
        days={compactDays}
        initialDay={getDefaultWeeklyScheduleDay()}
      />

      <div
        className={`${HOME_WEEKLY_SCHEDULE_DESKTOP_GRID_CLASS} min-w-0`}
        style={desktopGridStyle}
      >
        {HOME_WEEKLY_SCHEDULE_DAY_ORDER.map((day) => (
          <WeeklyScheduleDesktopColumn
            key={day}
            day={day}
            dayLabel={t(`weeklyScheduleDays.${day}`)}
            sessions={byDay[day]}
            locale={locale}
            emptyLabel={emptyLabel}
            formatBookAria={(className) =>
              t("weeklyScheduleBookSessionAria", { className })
            }
          />
        ))}
      </div>
    </div>
  );
}

type WeeklyScheduleDesktopColumnProps = {
  day: MarketingScheduleDayOfWeek;
  dayLabel: string;
  sessions: readonly MarketingScheduleItem[];
  locale: string;
  emptyLabel: string;
  formatBookAria: (className: string) => string;
};

function WeeklyScheduleDesktopColumn({
  day,
  dayLabel,
  sessions,
  locale,
  emptyLabel,
  formatBookAria,
}: WeeklyScheduleDesktopColumnProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5" data-day={day}>
      <p
        className={`${marketingMontserrat.className} text-center text-sm font-bold leading-5 xl:text-base xl:leading-6`}
        style={{ color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk }}
      >
        {dayLabel}
      </p>
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        {sessions.length === 0 ? (
          <div
            className={`${marketingMontserrat.className} flex min-h-[var(--home-schedule-card-min-h-lg)] items-center justify-center rounded-[2.5rem] border border-dashed px-3 py-6 text-center text-sm font-semibold leading-6`}
            style={{
              borderColor: HOME_WEEKLY_SCHEDULE_FIGMA.cardBorder,
              color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
              borderRadius: HOME_WEEKLY_SCHEDULE_LAYOUT.cardRadius,
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
              variant="desktop"
            />
          ))
        )}
      </div>
    </div>
  );
}

