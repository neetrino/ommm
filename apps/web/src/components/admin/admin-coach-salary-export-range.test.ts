import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { salaryExportRangeIssue } from "./admin-coach-salary-export-range";

describe("salaryExportRangeIssue", () => {
  it("accepts a single day and a leap year", () => {
    assert.equal(salaryExportRangeIssue("2026-09-01", "2026-09-01"), null);
    assert.equal(salaryExportRangeIssue("2024-01-01", "2024-12-31"), null);
  });

  it("rejects a reversed range and a range longer than one year", () => {
    assert.equal(salaryExportRangeIssue("2026-09-26", "2026-09-01"), "invalid");
    assert.equal(salaryExportRangeIssue("2024-01-01", "2025-01-01"), "tooLong");
  });
});
