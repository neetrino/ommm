import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { studioWallClockToUtc } from "../../lib/studio-timezone";
import { sessionMatchesAdminBookingDateFilter } from "./admin-bookings-filter-fields";

describe("sessionMatchesAdminBookingDateFilter", () => {
  it("keeps only that studio day when from is set without to", () => {
    const sameDay = studioWallClockToUtc("2026-08-19", "10:00").toISOString();
    const nextDay = studioWallClockToUtc("2026-08-20", "09:00").toISOString();

    assert.equal(sessionMatchesAdminBookingDateFilter(sameDay, "2026-08-19", ""), true);
    assert.equal(sessionMatchesAdminBookingDateFilter(nextDay, "2026-08-19", ""), false);
  });

  it("uses the inclusive from/to range when both dates are set", () => {
    const inRange = studioWallClockToUtc("2026-08-20", "10:00").toISOString();
    const afterRange = studioWallClockToUtc("2026-08-22", "09:00").toISOString();

    assert.equal(
      sessionMatchesAdminBookingDateFilter(inRange, "2026-08-19", "2026-08-21"),
      true,
    );
    assert.equal(
      sessionMatchesAdminBookingDateFilter(afterRange, "2026-08-19", "2026-08-21"),
      false,
    );
  });
});
