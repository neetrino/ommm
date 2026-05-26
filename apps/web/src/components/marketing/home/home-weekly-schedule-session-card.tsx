import { Link } from "@/i18n/navigation";
import { formatScheduleTime } from "@/components/marketing/home/format-schedule-time";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeWeeklyScheduleSessionCardVariant = "compact" | "desktop";

type HomeWeeklyScheduleSessionCardProps = {
  item: MarketingScheduleItem;
  locale: string;
  bookAriaLabel: string;
  variant?: HomeWeeklyScheduleSessionCardVariant;
};

const SESSION_CARD_BASE_CLASS = `${marketingMontserrat.className} group flex w-full min-w-0 break-words transition-[border-color,background-color,transform] hover:border-[#7a7360] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#695f00]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.99]`;

const SESSION_CARD_VARIANT_CLASS: Record<HomeWeeklyScheduleSessionCardVariant, string> = {
  compact:
    "min-h-[var(--home-schedule-card-min-h)] flex-col items-center justify-between gap-2 rounded-[2.5rem] px-4 py-4 text-center text-sm sm:gap-3 sm:py-5 sm:text-base md:flex-row md:items-center md:justify-between md:gap-4 md:px-5 md:py-4 md:text-left",
  desktop:
    "min-h-[var(--home-schedule-card-min-h-lg)] flex-col items-center justify-between gap-2 rounded-[2.5rem] px-3 py-4 text-center text-sm sm:gap-3 sm:px-4 sm:py-5 sm:text-base lg:gap-2 lg:px-2 lg:py-4 lg:text-xs lg:leading-5 xl:gap-3 xl:px-3 xl:py-5 xl:text-sm xl:leading-6 2xl:px-4 2xl:text-base",
};

export function HomeWeeklyScheduleSessionCard({
  item,
  locale,
  bookAriaLabel,
  variant = "desktop",
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

  const isCompact = variant === "compact";
  const timeClass = isCompact
    ? "shrink-0 font-semibold leading-6 md:w-[4.5rem]"
    : "font-semibold leading-6";
  const titleClass = isCompact
    ? "line-clamp-3 font-extrabold leading-6 md:min-w-0 md:flex-1 md:line-clamp-2 md:px-2 md:text-center"
    : "line-clamp-3 font-extrabold leading-6";
  const endClass = isCompact
    ? "shrink-0 font-semibold leading-6 md:w-[4.5rem] md:text-right"
    : "font-semibold leading-6";

  return (
    <Link
      href="/schedule"
      aria-label={bookAriaLabel}
      className={`${SESSION_CARD_BASE_CLASS} ${SESSION_CARD_VARIANT_CLASS[variant]}`}
      style={{
        borderWidth: HOME_WEEKLY_SCHEDULE_FIGMA.cardBorderWidthPx,
        borderStyle: "solid",
        borderColor: HOME_WEEKLY_SCHEDULE_FIGMA.cardBorder,
        borderRadius: HOME_WEEKLY_SCHEDULE_LAYOUT.cardRadius,
        color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
      }}
    >
      <span className={timeClass}>{startLabel}</span>
      <span className={titleClass}>{item.className}</span>
      {endLabel !== null ? (
        <span className={endClass}>{endLabel}</span>
      ) : (
        <span className={`${endClass} opacity-0`} aria-hidden>
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
