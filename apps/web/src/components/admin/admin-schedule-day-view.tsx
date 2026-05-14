"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminScheduleRowActions } from "@/components/admin/admin-schedule-row-actions";
import { SCHEDULE_DAY_OPTIONS } from "@/components/admin/admin-schedule-helpers";
import type {
  AdminScheduleItem,
  ScheduleDayOfWeek,
} from "@/components/admin/admin-schedule-types";
import { OmmButton } from "@/components/ui/omm-button";

const SCHEDULE_DAY_QUERY_KEY = "day";

type AdminScheduleDayViewProps = {
  locale: string;
  items: readonly AdminScheduleItem[];
  classTypeOptions: readonly string[];
};

function ArrowLeftGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRightGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

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
      <section className="rounded-[20px] border border-white/60 bg-white/65 px-3 py-3 shadow-[0_12px_28px_-22px_rgba(45,40,35,0.24)] backdrop-blur-md sm:px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMoveDay(-1)}
            disabled={items.length === 0}
            className="min-w-[7.75rem] gap-1.5 whitespace-nowrap rounded-xl border border-white/70 bg-white/75 px-2.5 text-[11px] font-semibold normal-case tracking-normal text-sage-700 hover:bg-white sm:min-w-[9rem] sm:px-3 sm:text-xs"
          >
            <ArrowLeftGlyph className="h-4 w-4 shrink-0" />
            <span>{t("previousDay")}</span>
          </OmmButton>

          <div className="min-w-0 px-1 text-center">
            <p className="truncate text-sm font-semibold text-sage-900 sm:text-base">
              {t(`days.${selectedDay}`)}
            </p>
            {selectedDay === today ? (
              <span className="mt-1 inline-flex rounded-full border border-mint-200/80 bg-mint-50/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sage-800 sm:text-[11px]">
                {t("today")}
              </span>
            ) : null}
          </div>

          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMoveDay(1)}
            disabled={items.length === 0}
            className="min-w-[7.75rem] gap-1.5 whitespace-nowrap rounded-xl border border-white/70 bg-white/75 px-2.5 text-[11px] font-semibold normal-case tracking-normal text-sage-700 hover:bg-white sm:min-w-[9rem] sm:px-3 sm:text-xs"
          >
            <span>{t("nextDay")}</span>
            <ArrowRightGlyph className="h-4 w-4 shrink-0" />
          </OmmButton>
        </div>
      </section>

      <div className="md:hidden space-y-3">
        {selectedItems.length === 0 ? (
          <div className={adminChrome.panel}>{t("emptyForSelectedDay")}</div>
        ) : (
          selectedItems.map((row) => (
            <article
              key={row.id}
              className="rounded-[20px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_28px_-22px_rgba(45,40,35,0.28)] backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-sage-900" title={row.className}>
                    {row.className}
                  </p>
                  <p className="mt-0.5 text-xs text-sage-600">{formatTimeRange(locale, row)}</p>
                </div>
                <span className={statusBadgeClasses(row.isActive)}>
                  {row.isActive ? t("statusActive") : t("statusInactive")}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-sage-700">
                <p className="truncate" title={row.instructorName}>
                  {t("colCoach")}: {row.instructorName}
                </p>
                <p className="truncate" title={row.classType}>
                  {t("colType")}: {row.classType}
                </p>
                <p className="col-span-2">
                  {t("colSpots")}:{" "}
                  <span className="inline-flex rounded-full border border-white/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-sage-800">
                    {row.availableSpots}
                  </span>
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <AdminScheduleRowActions item={row} classTypeOptions={classTypeOptions} />
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-[24px] border border-white/60 bg-white/55 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md md:block">
        <table className="w-full table-fixed border-collapse text-left text-xs text-sage-700 lg:text-sm">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[18%]" />
            <col className="w-[20%]" />
            <col className="w-[18%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[6%]" />
          </colgroup>
          <thead className="border-b border-white/50 bg-white/35 text-[10px] uppercase tracking-wide text-sage-500 lg:text-xs">
            <tr>
              <th className="px-2 py-2.5 font-medium lg:px-3">{t("colClassName")}</th>
              <th className="px-2 py-2.5 font-medium lg:px-3">{t("colTime")}</th>
              <th className="px-2 py-2.5 font-medium lg:px-3">{t("colCoach")}</th>
              <th className="px-2 py-2.5 font-medium lg:px-3">{t("colType")}</th>
              <th className="px-2 py-2.5 text-center font-medium lg:px-3">{t("colSpots")}</th>
              <th className="px-2 py-2.5 text-center font-medium lg:px-3">{t("colStatus")}</th>
              <th className="px-2 py-2.5 text-center font-medium lg:px-3">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.length === 0 ? (
              <tr className={adminChrome.tr}>
                <td className={adminChrome.tdMuted} colSpan={7}>
                  {t("emptyForSelectedDay")}
                </td>
              </tr>
            ) : (
              selectedItems.map((row) => (
                <tr key={row.id} className="border-b border-white/40 last:border-b-0">
                  <td className="px-2 py-2.5 lg:px-3">
                    <p className="truncate font-medium text-sage-900" title={row.className}>
                      {row.className}
                    </p>
                  </td>
                  <td className="px-2 py-2.5 lg:px-3">
                    <p className="truncate tabular-nums" title={formatTimeRange(locale, row)}>
                      {formatTimeRange(locale, row)}
                    </p>
                  </td>
                  <td className="px-2 py-2.5 lg:px-3">
                    <p className="truncate" title={row.instructorName}>
                      {row.instructorName}
                    </p>
                  </td>
                  <td className="px-2 py-2.5 lg:px-3">
                    <p className="truncate" title={row.classType}>
                      {row.classType}
                    </p>
                  </td>
                  <td className="px-2 py-2.5 text-center lg:px-3">
                    <span className="inline-flex min-w-8 justify-center rounded-full border border-white/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-sage-800">
                      {row.availableSpots}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center lg:px-3">
                    <span className={statusBadgeClasses(row.isActive)}>
                      {row.isActive ? t("statusActive") : t("statusInactive")}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center lg:px-3">
                    <AdminScheduleRowActions item={row} classTypeOptions={classTypeOptions} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
