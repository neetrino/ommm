import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyWeeklyScheduleFilterState,
  resolveAdminSchedulePageFilterState,
} from "@/components/admin/admin-schedule-query";
import { defaultScheduleListFilters } from "@/components/admin/admin-schedule-url";

describe("resolveAdminSchedulePageFilterState", () => {
  it("keeps list strip day from URL", () => {
    const state = resolveAdminSchedulePageFilterState(
      { schedDay: "2026-08-25" },
      "list",
    );
    assert.equal(state.stripDay, "2026-08-25");
  });

  it("clears list day window for weekly view", () => {
    const state = resolveAdminSchedulePageFilterState(
      { schedDay: "2026-08-25", schedFrom: "2026-08-01", schedTo: "2026-08-31" },
      "weekly",
    );
    assert.equal(state.stripDay, null);
    assert.equal(state.filters.from, "");
    assert.equal(state.filters.to, "");
  });

  it("applies month bounds for monthly view", () => {
    const state = resolveAdminSchedulePageFilterState({ schedDay: "2026-08-25" }, "monthly");
    assert.equal(state.stripDay, null);
    assert.equal(state.filters.from.length > 0, true);
    assert.equal(state.filters.to.length > 0, true);
  });
});

describe("applyWeeklyScheduleFilterState", () => {
  it("drops strip day and from/to", () => {
    const next = applyWeeklyScheduleFilterState({
      filters: { ...defaultScheduleListFilters, from: "2026-08-01", to: "2026-08-31" },
      quickFilters: [],
      stripDay: "2026-08-25",
    });
    assert.equal(next.stripDay, null);
    assert.equal(next.filters.from, "");
    assert.equal(next.filters.to, "");
  });
});
