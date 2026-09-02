"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { startOfLocalMonth } from "@/components/marketing/schedule/schedule-date-utils";

const CLOSED_MONTH_KEY = "";

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/**
 * Visible calendar month that follows `selectedDate`, while still allowing
 * in-panel prev/next. When `enabled` is false, the next enable resyncs.
 */
export function useVisibleMonthFollow(
  selectedDate: Date,
  enabled = true,
): [Date, Dispatch<SetStateAction<Date>>] {
  const selectedMonth = startOfLocalMonth(selectedDate);
  const selectedMonthKey = monthKey(selectedMonth);
  const [visibleMonth, setVisibleMonth] = useState(selectedMonth);
  const [followedKey, setFollowedKey] = useState(
    enabled ? selectedMonthKey : CLOSED_MONTH_KEY,
  );

  if (enabled && followedKey !== selectedMonthKey) {
    setFollowedKey(selectedMonthKey);
    setVisibleMonth(selectedMonth);
  } else if (!enabled && followedKey !== CLOSED_MONTH_KEY) {
    setFollowedKey(CLOSED_MONTH_KEY);
  }

  return [visibleMonth, setVisibleMonth];
}
