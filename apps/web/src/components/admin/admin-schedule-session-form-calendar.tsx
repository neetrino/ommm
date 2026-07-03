"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { scheduleWeekdaysFromDate } from "@/components/admin/admin-schedule-session-form.helpers";
import type {
  CalendarScheduleSlot,
  ScheduleDayOfWeek,
} from "@/components/admin/admin-schedule-session.types";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";
import { PlusIcon } from "@/components/ui/plus-icon";
import { TimePickerInput } from "@/components/ui/time-picker-input";

type SessionFormCalendarSectionProps = {
  calendarStartDate: string;
  calendarEndDate: string;
  calendarSlots: CalendarScheduleSlot[];
  onCalendarStartDateChange: (value: string) => void;
  onCalendarEndDateChange: (value: string) => void;
  onAddSlot: () => void;
  onUpdateSlot: <K extends keyof Omit<CalendarScheduleSlot, "id">>(
    id: string,
    key: K,
    value: CalendarScheduleSlot[K],
  ) => void;
  onRemoveSlot: (id: string) => void;
};

export function SessionFormCalendarSection({
  calendarStartDate,
  calendarEndDate,
  calendarSlots,
  onCalendarStartDateChange,
  onCalendarEndDateChange,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
}: SessionFormCalendarSectionProps) {
  const t = useTranslations("adminPages.classes");
  const weekdayOptions = useMemo(
    () => scheduleWeekdaysFromDate(`${calendarStartDate}T00:00:00`),
    [calendarStartDate],
  );

  return (
    <section className="rounded-2xl border border-sand-500/20 bg-white/70 p-4 sm:col-span-2">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-sage-950">
          {t("calendarSchedule.title")}
        </h3>
        <p className="text-sm text-sage-600">{t("calendarSchedule.description")}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-sage-950">
            {t("calendarSchedule.startDate")}
          </span>
          <DatePickerInput
            name="calendar-start-date"
            value={calendarStartDate}
            onChange={onCalendarStartDateChange}
            ariaLabel={t("calendarSchedule.startDate")}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-semibold text-sage-950">
            {t("calendarSchedule.endDate")}
          </span>
          <DatePickerInput
            name="calendar-end-date"
            value={calendarEndDate}
            onChange={onCalendarEndDateChange}
            ariaLabel={t("calendarSchedule.endDate")}
            required
          />
        </label>
      </div>
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-sage-950">
          {t("calendarSchedule.weeklySlots")}
        </h4>
        <div className="space-y-2 rounded-2xl border border-sand-500/15 bg-white/75 p-2">
          {calendarSlots.map((slot) => (
            <div
              key={slot.id}
              className="grid gap-2 rounded-xl border border-sand-500/15 bg-white/80 p-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_3.5rem]"
            >
              <OmmFormDropdown
                value={slot.weekday}
                ariaLabel={t("calendarSchedule.weekday")}
                placeholderLabel={t("calendarSchedule.weekday")}
                options={weekdayOptions.map((weekday) => ({
                  value: weekday,
                  label: t(`weekday.${weekday}`),
                }))}
                onChange={(value) =>
                  onUpdateSlot(slot.id, "weekday", value as ScheduleDayOfWeek)
                }
              />
              <TimePickerInput
                name={`calendar-start-time-${slot.id}`}
                value={slot.startTime}
                onChange={(value) => onUpdateSlot(slot.id, "startTime", value)}
                ariaLabel={t("calendarSchedule.startTime")}
                required
              />
              <TimePickerInput
                name={`calendar-end-time-${slot.id}`}
                value={slot.endTime}
                onChange={(value) => onUpdateSlot(slot.id, "endTime", value)}
                ariaLabel={t("calendarSchedule.endTime")}
                required
              />
              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl font-semibold leading-none text-red-700 transition-colors hover:bg-red-50 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45"
                onClick={() => onRemoveSlot(slot.id)}
                disabled={calendarSlots.length === 1}
                aria-label={t("calendarSchedule.removeSlot")}
              >
                ×
              </button>
            </div>
          ))}
          <OmmButton type="button" variant="ghost" size="sm" onClick={onAddSlot}>
            <PlusIcon className="h-3.5 w-3.5" />
            {t("calendarSchedule.addSlot")}
          </OmmButton>
        </div>
      </div>
    </section>
  );
}
