import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UserBookingRow } from "./user-booking-types";
import {
  buildUserSessionBookingMap,
  sessionBookingCreatedAt,
  sessionBookingId,
} from "./user-session-bookings-map";

function booking(overrides: Partial<UserBookingRow> & { id: string; sessionId: string }): UserBookingRow {
  return {
    id: overrides.id,
    status: overrides.status ?? "BOOKED",
    createdAt: overrides.createdAt,
    session: {
      id: overrides.sessionId,
      startsAt: overrides.session?.startsAt ?? "2099-01-01T10:00:00.000Z",
      endsAt: overrides.session?.endsAt ?? "2099-01-01T10:50:00.000Z",
      classType: { name: "Reformer Group" },
      coach: { user: { name: "Coach" } },
    },
  };
}

describe("buildUserSessionBookingMap", () => {
  it("keeps booking id and createdAt for upcoming booked rows", () => {
    const map = buildUserSessionBookingMap([
      booking({
        id: "booking-1",
        sessionId: "session-1",
        createdAt: "2026-08-31T06:17:50.000Z",
      }),
    ]);
    assert.equal(sessionBookingId(map, "session-1"), "booking-1");
    assert.equal(sessionBookingCreatedAt(map, "session-1"), "2026-08-31T06:17:50.000Z");
  });
});
