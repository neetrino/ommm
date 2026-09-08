"use client";

import type { ReactNode } from "react";
import pageStyles from "@/components/marketing/schedule/marketing-schedule-page-section.module.css";
import switcherStyles from "@/components/marketing/schedule/schedule-layout-switcher.module.css";
import {
  SCHEDULE_VIEW_ROOT,
  SCHEDULE_VIEW_SHELL,
  SCHEDULE_VIEW_SHELL_FLUSH,
} from "@/components/marketing/schedule/schedule-public-design";

type SchedulePageChromeProps = {
  pageTitle: string;
  /** Rendered once above the body so the segmented thumb animates between modes. */
  layoutSwitcher: ReactNode;
  flushShell: boolean;
  children: ReactNode;
};

/** Title and layout switcher stay mounted at the same offset for List / Week / Month. */
export function SchedulePageChrome({
  pageTitle,
  layoutSwitcher,
  flushShell,
  children,
}: SchedulePageChromeProps) {
  return (
    <div className={SCHEDULE_VIEW_ROOT}>
      <header className={pageStyles.hero}>
        <h1 className={pageStyles.title}>{pageTitle}</h1>
      </header>
      {layoutSwitcher !== null ? (
        <div className={switcherStyles.switcherRow}>{layoutSwitcher}</div>
      ) : null}
      <div className={flushShell ? SCHEDULE_VIEW_SHELL_FLUSH : SCHEDULE_VIEW_SHELL}>
        {children}
      </div>
    </div>
  );
}
