"use client";

import { useEffect, useState } from "react";
import {
  isSameCalendarDay,
  startOfLocalDay,
} from "@/components/marketing/schedule/schedule-date-utils";

const DAY_ROLL_CHECK_MS = 60_000;

/**
 * Tracks the current local calendar day and advances at midnight so rolling
 * schedule windows stay in sync while the page stays open.
 */
export function useLocalCalendarToday(): Date {
  const [today, setToday] = useState(() => startOfLocalDay(new Date()));

  useEffect(() => {
    const syncToday = () => {
      const next = startOfLocalDay(new Date());
      setToday((prev) => (isSameCalendarDay(prev, next) ? prev : next));
    };

    syncToday();
    const intervalId = window.setInterval(syncToday, DAY_ROLL_CHECK_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return today;
}
