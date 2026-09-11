import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveEffectiveScheduleView,
  resolveScheduleView,
} from "@/components/admin/admin-schedule-view";

describe("resolveScheduleView", () => {
  it("keeps list, week, and month", () => {
    assert.equal(resolveScheduleView("list"), "list");
    assert.equal(resolveScheduleView("weekly"), "weekly");
    assert.equal(resolveScheduleView("monthly"), "monthly");
  });
});

describe("resolveEffectiveScheduleView", () => {
  it("keeps week on phones so staff can scroll into past days", () => {
    assert.equal(resolveEffectiveScheduleView("weekly", false), "weekly");
    assert.equal(resolveEffectiveScheduleView("monthly", false), "monthly");
    assert.equal(resolveEffectiveScheduleView("list", false), "list");
  });
});
