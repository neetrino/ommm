import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addSalaryMonths,
  currentStudioSalaryMonth,
  parseCoachSalaryMonthParam,
} from "./coachSalaryMonth";

describe("currentStudioSalaryMonth", () => {
  it("uses the studio calendar month, not UTC", () => {
    const yerevanSeptember = new Date("2026-08-31T21:00:00.000Z");
    assert.equal(currentStudioSalaryMonth(yerevanSeptember), "2026-09");
  });
});

describe("addSalaryMonths", () => {
  it("walks across year boundaries", () => {
    assert.equal(addSalaryMonths("2026-01", -1), "2025-12");
    assert.equal(addSalaryMonths("2026-09", 1), "2026-10");
  });
});

describe("parseCoachSalaryMonthParam", () => {
  const now = new Date("2026-09-11T12:00:00.000Z");

  it("keeps a past studio month so coaches can open history", () => {
    assert.equal(parseCoachSalaryMonthParam("2026-08", now), "2026-08");
  });

  it("falls back to the current studio month when missing, invalid, or future", () => {
    assert.equal(parseCoachSalaryMonthParam(undefined, now), "2026-09");
    assert.equal(parseCoachSalaryMonthParam("2026-13", now), "2026-09");
    assert.equal(parseCoachSalaryMonthParam("2026-10", now), "2026-09");
  });
});
