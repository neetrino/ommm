import { Link } from "@/i18n/navigation";
import { formatScheduleTime } from "@/components/marketing/home/format-schedule-time";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeWeeklyScheduleSessionCardProps = {
  item: MarketingScheduleItem;
  locale: string;
  bookAriaLabel: string;
};

export function HomeWeeklyScheduleSessionCard({
  item,
  locale,
  bookAriaLabel,
}: HomeWeeklyScheduleSessionCardProps) {
  const startLabel = formatScheduleTime(locale, item.startTime);
  const endLabel =
    item.endTime !== null
      ? formatScheduleTime(locale, item.endTime)
      : item.durationMinutes !== null
        ? formatScheduleTime(
            locale,
            addMinutesToHhmm(item.startTime, item.durationMinutes),
          )
        : null;

  return (
    <Link
      href="/schedule"
      aria-label={bookAriaLabel}
      className={`${marketingMontserrat.className} group flex min-h-0 w-full min-w-0 flex-col items-center justify-between gap-2 rounded-[2.5rem] px-3 py-4 text-center text-sm transition-[border-color,background-color,transform] hover:border-[#7a7360] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#695f00]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.99] sm:gap-3 sm:py-5 sm:text-base sm:px-4`}
      style={{
        minHeight: HOME_WEEKLY_SCHEDULE_LAYOUT.cardMinHeight,
        borderWidth: HOME_WEEKLY_SCHEDULE_FIGMA.cardBorderWidthPx,
        borderStyle: "solid",
        borderColor: HOME_WEEKLY_SCHEDULE_FIGMA.cardBorder,
        borderRadius: HOME_WEEKLY_SCHEDULE_LAYOUT.cardRadius,
        color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
      }}
    >
      <span className="font-semibold leading-6">{startLabel}</span>
      <span className="line-clamp-3 font-extrabold leading-6">{item.className}</span>
      {endLabel !== null ? (
        <span className="font-semibold leading-6">{endLabel}</span>
      ) : (
        <span className="font-semibold leading-6 opacity-0" aria-hidden>
          —
        </span>
      )}
    </Link>
  );
}

function addMinutesToHhmm(startTime: string, minutes: number): string {
  const [hourPart, minutePart] = startTime.split(":");
  const total = Number(hourPart) * 60 + Number(minutePart) + minutes;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
