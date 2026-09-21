import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CREATED_SESSION_STATUS,
  batchFormPayload,
  resolveFormSessionStatus,
} from "@/components/admin/admin-schedule-session-form.helpers";
import type { AdminScheduleFormState } from "@/components/admin/admin-schedule-session.types";

function form(status: AdminScheduleFormState["status"]): AdminScheduleFormState {
  return {
    description: "",
    classTypeId: "type-1",
    coachId: "coach-1",
    date: "2026-10-05",
    startTime: "08:00",
    endTime: "08:50",
    capacity: "1",
    levels: [],
    status,
  };
}

describe("resolveFormSessionStatus", () => {
  it("keeps the stored status when editing", () => {
    assert.equal(resolveFormSessionStatus("edit", "FINISHED"), "FINISHED");
    assert.equal(resolveFormSessionStatus("edit", "FULL"), "FULL");
  });

  it("starts duplicate and create as ACTIVE", () => {
    assert.equal(resolveFormSessionStatus("duplicate", "FINISHED"), CREATED_SESSION_STATUS);
    assert.equal(resolveFormSessionStatus("duplicate", "FULL"), CREATED_SESSION_STATUS);
    assert.equal(resolveFormSessionStatus("create", "CANCELLED"), CREATED_SESSION_STATUS);
  });
});

describe("batchFormPayload", () => {
  it("does not copy FINISHED or FULL onto new calendar classes", () => {
    const payload = batchFormPayload(
      form("FINISHED"),
      "type-1",
      "Reformer Individual",
      "2026-10-01",
      "2026-10-31",
      [{ id: "slot-1", weekday: "MONDAY", startTime: "08:00", endTime: "08:50" }],
    );
    assert.equal(payload.status, CREATED_SESSION_STATUS);
  });
});
