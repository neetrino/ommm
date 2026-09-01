import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isWithinCancellationGracePeriod,
  shouldApplyCancellationPenalty,
} from "./cancellation-policy";

describe("shouldApplyCancellationPenalty", () => {
  it("skips the late-cancel warning inside the booking grace window", () => {
    const bookedAtIso = "2026-08-31T06:17:50.000Z";
    const now = new Date("2026-08-31T06:19:50.000Z");
    assert.equal(isWithinCancellationGracePeriod(bookedAtIso, 15, now), true);
    assert.equal(
      shouldApplyCancellationPenalty({
        sessionDate: "2026-08-31",
        startTime: "11:00",
        bookedAtIso,
        now,
      }),
      false,
    );
  });

  it("keeps the late-cancel warning after the grace window", () => {
    const now = new Date("2026-08-31T06:40:00.000Z");
    assert.equal(
      shouldApplyCancellationPenalty({
        sessionDate: "2026-08-31",
        startTime: "11:00",
        bookedAtIso: "2026-08-31T06:17:50.000Z",
        now,
      }),
      true,
    );
  });

  it("resolves a bookings-API ISO startsAt without treating it as a calendar day", () => {
    const now = new Date("2026-08-31T06:40:00.000Z");
    assert.equal(
      shouldApplyCancellationPenalty({
        sessionDate: "2026-08-31T07:00:00.000Z",
        startTime: "99:99",
        bookedAtIso: "2026-08-31T06:17:50.000Z",
        now,
      }),
      true,
    );
  });

  it("uses the 24h default when penaltyHours is omitted or undefined", () => {
    const now = new Date("2026-08-31T06:40:00.000Z");
    const lateSameDay = {
      sessionDate: "2026-08-31",
      startTime: "11:00",
      bookedAtIso: "2026-08-30T06:00:00.000Z",
      now,
    };
    assert.equal(shouldApplyCancellationPenalty(lateSameDay), true);
    assert.equal(
      shouldApplyCancellationPenalty({ ...lateSameDay, penaltyHours: undefined }),
      true,
    );
  });
});
