import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDefaultWeeklyScheduleDay } from "./get-default-weekly-schedule-day";
import {
  getHomeWeeklyScheduleTabCalendarDate,
  resolveHomeWeeklyScheduleFocusDate,
} from "./home-weekly-schedule-date.helpers";
import { groupScheduleByWeekday } from "./group-schedule-by-weekday";
import type { MarketingScheduleItem } from "../schedule/marketing-schedule-types";

/** Wednesday 2026-07-22 12:00 UTC → Wednesday in Asia/Yerevan. */
const WEDNESDAY_NOON_UTC = new Date("2026-07-22T12:00:00.000Z");
/** Friday 2026-07-24 12:00 UTC → Friday in Asia/Yerevan. */
const FRIDAY_NOON_UTC = new Date("2026-07-24T12:00:00.000Z");

function session(
  sessionDate: string,
  dayOfWeek: MarketingScheduleItem["dayOfWeek"],
): MarketingScheduleItem {
  return {
    id: `${sessionDate}-${dayOfWeek}`,
    className: "Yoga",
    instructorName: "Coach",
    classType: "Yoga",
    dayOfWeek,
    startTime: "10:00",
    endTime: "11:00",
    durationMinutes: 60,
    availableSpots: 5,
    level: null,
    status: "ACTIVE",
    sessionDate,
    description: null,
    isActive: true,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  };
}

describe("getHomeWeeklyScheduleTabCalendarDate", () => {
  it("maps Mon–Sun tabs to the week containing the focus date", () => {
    assert.equal(
      getHomeWeeklyScheduleTabCalendarDate("MONDAY", WEDNESDAY_NOON_UTC, "2026-07-22"),
      "2026-07-20",
    );
    assert.equal(
      getHomeWeeklyScheduleTabCalendarDate("FRIDAY", WEDNESDAY_NOON_UTC, "2026-07-22"),
      "2026-07-24",
    );
    assert.equal(
      getHomeWeeklyScheduleTabCalendarDate("SUNDAY", WEDNESDAY_NOON_UTC, "2026-07-22"),
      "2026-07-26",
    );
  });
});

describe("resolveHomeWeeklyScheduleFocusDate", () => {
  it("picks the nearest upcoming session date beyond the current week", () => {
    const items = [
      session("2026-08-10", "MONDAY"),
      session("2026-08-11", "TUESDAY"),
    ];
    assert.equal(resolveHomeWeeklyScheduleFocusDate(items, FRIDAY_NOON_UTC), "2026-08-10");
  });

  it("falls back to today when there are no upcoming sessions", () => {
    assert.equal(resolveHomeWeeklyScheduleFocusDate([], FRIDAY_NOON_UTC), "2026-07-24");
  });
});

describe("getDefaultWeeklyScheduleDay", () => {
  it("returns the weekday of the nearest upcoming session", () => {
    const items = [
      session("2026-08-10", "MONDAY"),
      session("2026-08-14", "FRIDAY"),
    ];
    assert.equal(getDefaultWeeklyScheduleDay(items, FRIDAY_NOON_UTC), "MONDAY");
  });

  it("falls back to today when items are empty", () => {
    assert.equal(getDefaultWeeklyScheduleDay([], FRIDAY_NOON_UTC), "FRIDAY");
  });
});

describe("groupScheduleByWeekday", () => {
  it("places distant upcoming sessions into the focused week tabs", () => {
    const items = [
      session("2026-08-10", "MONDAY"),
      session("2026-08-14", "FRIDAY"),
    ];
    const grouped = groupScheduleByWeekday(items, FRIDAY_NOON_UTC);
    assert.equal(grouped.MONDAY.length, 1);
    assert.equal(grouped.FRIDAY.length, 1);
    assert.equal(grouped.SATURDAY.length, 0);
  });
});
