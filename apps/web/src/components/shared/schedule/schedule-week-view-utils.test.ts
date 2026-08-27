import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildScheduleWeekDayKeys,
  isoScheduleDay,
  startOfScheduleDay,
} from "@/components/shared/schedule/schedule-week-view-utils";
import {
  SCHEDULE_WEEK_DAY_COUNT,
  SCHEDULE_WEEK_PAST_DAYS,
} from "@/components/shared/schedule/schedule-week-view-tokens";

describe("buildScheduleWeekDayKeys", () => {
  it("includes past days through today plus the next six days", () => {
    const anchor = new Date("2026-08-27T12:00:00");
    const keys = buildScheduleWeekDayKeys(anchor);
    const today = isoScheduleDay(startOfScheduleDay(anchor));

    assert.equal(keys.length, SCHEDULE_WEEK_PAST_DAYS + SCHEDULE_WEEK_DAY_COUNT);
    assert.equal(keys[SCHEDULE_WEEK_PAST_DAYS], today);
    assert.ok(keys[0]! < today);
    assert.ok(keys[keys.length - 1]! > today);
  });
});
