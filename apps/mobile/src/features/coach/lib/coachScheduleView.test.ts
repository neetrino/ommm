import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCoachScheduleWeekDays,
  COACH_SCHEDULE_WEEK_FORWARD_DAYS,
  COACH_SCHEDULE_WEEK_PAST_DAYS,
  groupCoachSessionsByDay,
  localIsoDay,
  sessionLocalIsoDay,
} from "./coachScheduleView";

describe("buildCoachScheduleWeekDays", () => {
  it("includes past days through today plus the next six days", () => {
    const days = buildCoachScheduleWeekDays(new Date(2026, 8, 11));
    assert.equal(
      days.length,
      COACH_SCHEDULE_WEEK_PAST_DAYS + 1 + COACH_SCHEDULE_WEEK_FORWARD_DAYS,
    );
    assert.equal(localIsoDay(days[0]), "2026-08-14");
    assert.equal(localIsoDay(days[COACH_SCHEDULE_WEEK_PAST_DAYS]), "2026-09-11");
  });
});

describe("groupCoachSessionsByDay", () => {
  it("groups sessions by local calendar day", () => {
    const grouped = groupCoachSessionsByDay([
      {
        id: "b",
        title: "Evening",
        startsAt: "2026-09-11T14:00:00.000Z",
        endsAt: "2026-09-11T15:00:00.000Z",
        capacity: 8,
        level: null,
        classFormat: null,
        status: "ACTIVE",
        classType: { id: "t", name: "Reformer" },
        _count: { bookings: 2 },
      },
      {
        id: "a",
        title: "Morning",
        startsAt: "2026-09-11T12:00:00.000Z",
        endsAt: "2026-09-11T13:00:00.000Z",
        capacity: 8,
        level: null,
        classFormat: null,
        status: "FINISHED",
        classType: { id: "t", name: "Reformer" },
        _count: { bookings: 4 },
      },
    ]);

    const dayKey = sessionLocalIsoDay("2026-09-11T12:00:00.000Z");
    const dayRows = grouped.get(dayKey) ?? [];
    assert.deepEqual(dayRows.map((row) => row.id), ["a", "b"]);
  });
});
