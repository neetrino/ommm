"use client";

import type { ReactNode } from "react";
import { ScheduleDateControls } from "@/components/marketing/schedule/schedule-date-controls";
import pageStyles from "@/components/marketing/schedule/marketing-schedule-page-section.module.css";
import switcherStyles from "@/components/marketing/schedule/schedule-layout-switcher.module.css";

type ScheduleListChromeProps = {
  locale: string;
  pageTitle: string;
  selectedDate: Date;
  windowStart: Date;
  minDate: Date;
  maxDate: Date;
  showLayoutSwitcher: boolean;
  layoutSwitcher: ReactNode;
  filtersSlot: ReactNode;
  sessionsSlot: ReactNode;
  onSelectDay: (day: Date) => void;
  onShiftWindow: (delta: number) => void;
};

/** Title, optional layout switcher, filters, day strip, and session list. */
export function ScheduleListChrome({
  locale,
  pageTitle,
  selectedDate,
  windowStart,
  minDate,
  maxDate,
  showLayoutSwitcher,
  layoutSwitcher,
  filtersSlot,
  sessionsSlot,
  onSelectDay,
  onShiftWindow,
}: ScheduleListChromeProps) {
  return (
    <>
      <header className={`${pageStyles.hero} ${pageStyles.heroSpaced}`}>
        <h1 className={pageStyles.title}>{pageTitle}</h1>
      </header>
      {showLayoutSwitcher ? (
        <div className={switcherStyles.desktopListToolbar}>{layoutSwitcher}</div>
      ) : null}
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
