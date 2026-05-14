"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminScheduleRowActions } from "@/components/admin/admin-schedule-row-actions";
import { SCHEDULE_DAY_OPTIONS } from "@/components/admin/admin-schedule-helpers";
import type {
  AdminScheduleItem,
  ScheduleDayOfWeek,
} from "@/components/admin/admin-schedule-types";
import {
  SCHEDULE_ARROW_BTN,
  SCHEDULE_DATE_CHIP_ACTIVE,
  SCHEDULE_DATE_CHIP_IDLE,
  SCHEDULE_DATE_STRIP_PANEL,
  SCHEDULE_INK,
  SCHEDULE_MUTED,
} from "@/components/marketing/schedule/schedule-public-design";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import styles from "@/components/marketing/schedule/marketing-schedule-view.module.css";
import {
  useScheduleDayTransition,
} from "@/components/marketing/schedule/use-schedule-day-transition";

const SCHEDULE_DAY_QUERY_KEY = "day";

type AdminScheduleDayViewProps = {
  locale: string;
  items: readonly AdminScheduleItem[];
  classTypeOptions: readonly string[];
};

function toLocaleTimeLabel(locale: string, hhmm: string): string {
  const [hour, minute] = hhmm.split(":").map((part) => Number(part));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return hhmm;
  }
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatTimeRange(locale: string, row: AdminScheduleItem): string {
  const start = toLocaleTimeLabel(locale, row.startTime);
  if (row.endTime !== null) {
    return `${start} - ${toLocaleTimeLabel(locale, row.endTime)}`;
  }
  if (row.durationMinutes !== null) {
    return `${start} · ${row.durationMinutes}m`;
  }
  return start;
}

function statusBadgeClasses(active: boolean): string {
  return active
    ? "inline-flex rounded-full border border-mint-200/80 bg-mint-50/90 px-2 py-0.5 text-[11px] font-medium text-sage-800"
    : "inline-flex rounded-full border border-sand-300/80 bg-sand-100/80 px-2 py-0.5 text-[11px] font-medium text-sage-700";
}

function isScheduleDay(value: string | null): value is ScheduleDayOfWeek {
  return value !== null && SCHEDULE_DAY_OPTIONS.includes(value as ScheduleDayOfWeek);
}

function getTodayScheduleDay(): ScheduleDayOfWeek {
  return SCHEDULE_DAY_OPTIONS[new Date().getDay()];
}

function moveDay(current: ScheduleDayOfWeek, direction: -1 | 1): ScheduleDayOfWeek {
  const index = SCHEDULE_DAY_OPTIONS.indexOf(current);
  const size = SCHEDULE_DAY_OPTIONS.length;
  const next = (index + direction + size) % size;
  return SCHEDULE_DAY_OPTIONS[next];
}

function compareScheduleRows(a: AdminScheduleItem, b: AdminScheduleItem): number {
  if (a.startTime === b.startTime) {
    return a.className.localeCompare(b.className);
  }
  return a.startTime.localeCompare(b.startTime);
}

export function AdminScheduleDayView({
  locale,
  items,
  classTypeOptions,
}: AdminScheduleDayViewProps) {
  const t = useTranslations("adminPages.schedule");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const today = getTodayScheduleDay();
  const selectedDay = isScheduleDay(searchParams.get(SCHEDULE_DAY_QUERY_KEY))
    ? (searchParams.get(SCHEDULE_DAY_QUERY_KEY) as ScheduleDayOfWeek)
    : today;

  const selectedItems = useMemo(
    () => items.filter((item) => item.dayOfWeek === selectedDay).sort(compareScheduleRows),
    [items, selectedDay],
  );
  const selectedDayKey = selectedDay;
  const { contentRef, renderedDayKey, renderedSessions, animationPhase, containerStyle, getItemStyle } =
    useScheduleDayTransition({
      selectedDayKey,
      visibleSessions: selectedItems,
    });
  const dayStrip = useMemo(() => {
    const baseline = new Date();
    baseline.setHours(0, 0, 0, 0);
    baseline.setDate(baseline.getDate() - baseline.getDay());
    return SCHEDULE_DAY_OPTIONS.map((day, index) => {
      const date = new Date(baseline);
      date.setDate(baseline.getDate() + index);
      return { day, date };
    });
  }, []);

  function setSelectedDay(day: ScheduleDayOfWeek) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(SCHEDULE_DAY_QUERY_KEY, day);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function onMoveDay(direction: -1 | 1) {
    setSelectedDay(moveDay(selectedDay, direction));
  }

  return (
    <div className="space-y-4">
      <section className={SCHEDULE_DATE_STRIP_PANEL}>
        <div className="flex w-full min-w-0 items-stretch gap-2 sm:gap-3">
          <button
            type="button"
            className={SCHEDULE_ARROW_BTN}
            aria-label={t("previousDay")}
            onClick={() => onMoveDay(-1)}
            disabled={items.length === 0}
          >
            <ArrowLeftIcon />
          </button>
          <div className="grid min-w-0 flex-1 grid-cols-7 gap-1 sm:gap-2">
            {dayStrip.map((entry) => {
              const active = entry.day === selectedDay;
              const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(entry.date);
              const dayNum = String(entry.date.getDate());
              return (
                <button
                  key={entry.day}
                  type="button"
                  onClick={() => setSelectedDay(entry.day)}
                  className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl py-1 transition-transform duration-300 ease-out hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700/25 motion-reduce:transform-none"
                >
                  <span
                    className={`w-full truncate text-center text-[9px] font-medium uppercase tracking-wide transition-colors duration-300 ease-out sm:text-[10px] ${
                      active ? "text-sage-700" : SCHEDULE_MUTED
                    }`}
                  >
                    {weekday}
                  </span>
                  <span className={active ? SCHEDULE_DATE_CHIP_ACTIVE : SCHEDULE_DATE_CHIP_IDLE}>
                    {dayNum}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={SCHEDULE_ARROW_BTN}
            aria-label={t("nextDay")}
            onClick={() => onMoveDay(1)}
            disabled={items.length === 0}
          >
            <ArrowRightIcon />
          </button>
        </div>
      </section>

      <div className="mt-2 flex flex-col gap-1 border-b border-white/55 pb-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3">
        <p className={`text-lg font-semibold ${SCHEDULE_INK}`}>{t(`days.${selectedDay}`)}</p>
        {selectedDay === today ? (
          <span className="inline-flex rounded-full border border-mint-200/80 bg-mint-50/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sage-800 sm:text-[11px]">
            {t("today")}
          </span>
        ) : null}
      </div>

      <div
        className="overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
        style={containerStyle}
      >
        <div
          ref={contentRef}
          className={
            animationPhase === "exit"
              ? styles.scheduleListExit
              : animationPhase === "enter"
                ? styles.scheduleListEnter
                : ""
          }
        >
          {renderedSessions.length === 0 ? (
            <div
              key={renderedDayKey}
              className={`rounded-[20px] border border-white/60 bg-white/55 px-4 py-10 text-center text-sm text-sage-500 shadow-[0_12px_30px_-22px_rgba(45,40,35,0.2)] backdrop-blur-md ${
                animationPhase === "enter" ? styles.scheduleItemEnter : ""
              }`}
            >
              {t("emptyForSelectedDay")}
            </div>
          ) : (
            <ul key={renderedDayKey} className="space-y-3">
              {renderedSessions.map((row, index) => (
                <li
                  key={row.id}
                  className={`rounded-[22px] border border-white/60 bg-white/65 p-4 shadow-[0_16px_36px_-24px_rgba(45,40,35,0.24)] backdrop-blur-md sm:p-5 ${
                    animationPhase === "enter" ? styles.scheduleItemEnter : ""
                  }`}
                  style={getItemStyle(index)}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold text-sage-900" title={row.className}>
                          {row.className}
                        </p>
                        <span className="inline-flex rounded-full border border-white/70 bg-white/85 px-2.5 py-0.5 text-[11px] font-medium text-sage-700">
                          {row.classType}
                        </span>
                        <span className={statusBadgeClasses(row.isActive)}>
                          {row.isActive ? t("statusActive") : t("statusInactive")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-sage-600">{formatTimeRange(locale, row)}</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-sage-700 sm:grid-cols-2 lg:grid-cols-4">
                        <p className="truncate" title={row.instructorName}>
                          <span className="text-sage-500">{t("colCoach")}:</span> {row.instructorName}
                        </p>
                        <p>
                          <span className="text-sage-500">{t("colDay")}:</span>{" "}
                          {t(`days.${row.dayOfWeek}`)}
                        </p>
                        <p>
                          <span className="text-sage-500">{t("colSpots")}:</span>{" "}
                          <span className="inline-flex min-w-8 justify-center rounded-full border border-white/60 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-sage-800">
                            {row.availableSpots}
                          </span>
                        </p>
                        <p className="truncate" title={row.classType}>
                          <span className="text-sage-500">{t("colType")}:</span> {row.classType}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end lg:shrink-0">
                      <AdminScheduleRowActions item={row} classTypeOptions={classTypeOptions} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
