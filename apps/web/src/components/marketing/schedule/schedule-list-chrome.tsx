"use client";

import type { ReactNode } from "react";
import { ScheduleDateControls } from "@/components/marketing/schedule/schedule-date-controls";

type ScheduleListChromeProps = {
  locale: string;
  selectedDate: Date;
  windowStart: Date;
  minDate: Date;
  maxDate: Date;
  filtersSlot: ReactNode;
  sessionsSlot: ReactNode;
  onSelectDay: (day: Date) => void;
  onShiftWindow: (delta: number) => void;
};

/** Filters, day strip, and session list for the list layout. */
export function ScheduleListChrome({
  locale,
  selectedDate,
  windowStart,
  minDate,
  maxDate,
  filtersSlot,
  sessionsSlot,
  onSelectDay,
  onShiftWindow,
}: ScheduleListChromeProps) {
  return (
    <>
      {filtersSlot}
      <ScheduleDateControls
        locale={locale}
        selectedDate={selectedDate}
        windowStart={windowStart}
        minDate={minDate}
        maxDate={maxDate}
        onSelectDay={onSelectDay}
        onShiftWindow={onShiftWindow}
      />
      {sessionsSlot}
    </>
  );
}
