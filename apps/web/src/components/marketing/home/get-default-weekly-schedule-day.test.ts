import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDefaultWeeklyScheduleDay } from "./get-default-weekly-schedule-day";
import {
  getHomeWeeklyScheduleTabCalendarDate,
  listHomeWeeklyScheduleRollingTabs,
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

describe("listHomeWeeklyScheduleRollingTabs", () => {
  it("starts at today and rolls through the same weekday next week", () => {
    const tabs = listHomeWeeklyScheduleRollingTabs(WEDNESDAY_NOON_UTC);
    assert.deepEqual(
      tabs.map((tab) => tab.day),
      [
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
      ],
    );
    assert.deepEqual(
      tabs.map((tab) => tab.calendarDate),
      [
        "2026-07-22",
        "2026-07-23",
        "2026-07-24",
        "2026-07-25",
        "2026-07-26",
        "2026-07-27",
        "2026-07-28",
      ],
    );
  });
});

describe("getHomeWeeklyScheduleTabCalendarDate", () => {
  it("maps weekdays onto the rolling window from today (not past Mon–Sun)", () => {
    assert.equal(
      getHomeWeeklyScheduleTabCalendarDate("WEDNESDAY", WEDNESDAY_NOON_UTC),
      "2026-07-22",
    );
    assert.equal(
      getHomeWeeklyScheduleTabCalendarDate("FRIDAY", WEDNESDAY_NOON_UTC),
      "2026-07-24",
    );
    assert.equal(
      getHomeWeeklyScheduleTabCalendarDate("MONDAY", WEDNESDAY_NOON_UTC),
      "2026-07-27",
    );
    assert.equal(
      getHomeWeeklyScheduleTabCalendarDate("TUESDAY", WEDNESDAY_NOON_UTC),
      "2026-07-28",
    );
  });
});

describe("resolveHomeWeeklyScheduleFocusDate", () => {
  it("picks the nearest upcoming session inside the rolling window", () => {
    const items = [
      session("2026-07-25", "SATURDAY"),
      session("2026-07-27", "MONDAY"),
    ];
    assert.equal(resolveHomeWeeklyScheduleFocusDate(items, FRIDAY_NOON_UTC), "2026-07-25");
  });

  it("ignores sessions beyond the rolling window and falls back to today", () => {
    const items = [
      session("2026-08-10", "MONDAY"),
      session("2026-08-11", "TUESDAY"),
    ];
    assert.equal(resolveHomeWeeklyScheduleFocusDate(items, FRIDAY_NOON_UTC), "2026-07-24");
  });

  it("falls back to today when there are no upcoming sessions", () => {
    assert.equal(resolveHomeWeeklyScheduleFocusDate([], FRIDAY_NOON_UTC), "2026-07-24");
  });
});

describe("getDefaultWeeklyScheduleDay", () => {
  it("returns the weekday of the nearest upcoming session in the rolling window", () => {
    const items = [
      session("2026-07-27", "MONDAY"),
      session("2026-07-24", "FRIDAY"),
    ];
    assert.equal(getDefaultWeeklyScheduleDay(items, FRIDAY_NOON_UTC), "FRIDAY");
  });

  it("falls back to today when the only sessions are outside the window", () => {
    const items = [
      session("2026-08-10", "MONDAY"),
      session("2026-08-14", "FRIDAY"),
    ];
    assert.equal(getDefaultWeeklyScheduleDay(items, FRIDAY_NOON_UTC), "FRIDAY");
  });

  it("falls back to today when items are empty", () => {
    assert.equal(getDefaultWeeklyScheduleDay([], FRIDAY_NOON_UTC), "FRIDAY");
  });
});

describe("groupScheduleByWeekday", () => {
  it("places in-window sessions on rolling tabs and skips past / distant days", () => {
    const items = [
      session("2026-07-20", "MONDAY"),
      session("2026-07-27", "MONDAY"),
      session("2026-07-24", "FRIDAY"),
      session("2026-08-14", "FRIDAY"),
    ];
    const grouped = groupScheduleByWeekday(items, WEDNESDAY_NOON_UTC);
    assert.equal(grouped.MONDAY.length, 1);
    assert.equal(grouped.MONDAY[0]?.sessionDate, "2026-07-27");
    assert.equal(grouped.FRIDAY.length, 1);
    assert.equal(grouped.FRIDAY[0]?.sessionDate, "2026-07-24");
    assert.equal(grouped.TUESDAY.length, 0);
  });
});
