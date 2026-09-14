import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminScheduleSession } from "../components/admin/admin-schedule-session.types";
import type { ScheduleSessionListRow } from "../components/shared/schedule/schedule-session-list-types";
import {
  mapAdminScheduleSessionToListRow,
  mapListRowToAdminScheduleSession,
} from "./map-admin-session-to-list-row";

const ADMIN_SESSION: AdminScheduleSession = {
  id: "session-1",
  title: "  Reformer Group  ",
  description: "Studio class",
  startsAt: "2026-09-14T04:00:00.000Z",
  endsAt: "2026-09-14T04:50:00.000Z",
  capacity: 6,
  level: "ALL",
  classFormat: "GROUP",
  status: "ACTIVE",
  classType: { id: "type-1", name: "Reformer" },
  coach: { id: "coach-1", user: { name: "Inesa", lastName: "Hakobyan" } },
  _count: { bookings: 0 },
};

describe("map-admin-session-to-list-row", () => {
  it("trims admin titles and keeps coach identity", () => {
    const row = mapAdminScheduleSessionToListRow(ADMIN_SESSION);
    assert.equal(row.title, "Reformer Group");
    assert.equal(row.coach?.id, "coach-1");
    assert.equal(row.capacity, 6);
  });

  it("maps list rows back to admin sessions with a fallback coach", () => {
    const listRow: ScheduleSessionListRow = {
      id: "session-2",
      title: "",
      startsAt: ADMIN_SESSION.startsAt,
      endsAt: ADMIN_SESSION.endsAt,
      capacity: 10,
      level: null,
      classFormat: null,
      status: "FINISHED",
      classType: { id: "type-1", name: "Reformer" },
      _count: { bookings: 2 },
    };
    const session = mapListRowToAdminScheduleSession(listRow);
    assert.equal(session.title, "Reformer");
    assert.equal(session.description, null);
    assert.equal(session.coach.id, "");
    assert.equal(session._count.bookings, 2);
  });
});
