import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatPackageFreezeLabel } from "./admin-packages-display";

describe("formatPackageFreezeLabel", () => {
  const labels = {
    timesDays: (times: number, days: number) => `${times} × ${days} days`,
  };

  it("returns null when freeze is not configured", () => {
    assert.equal(formatPackageFreezeLabel({}, labels), null);
    assert.equal(
      formatPackageFreezeLabel({ freezeAllowedCount: 1, freezeMaxDaysPerUse: 0 }, labels),
      null,
    );
    assert.equal(
      formatPackageFreezeLabel({ freezeAllowedCount: 0, freezeMaxDaysPerUse: 7 }, labels),
      null,
    );
  });

  it("formats times and days when both limits are set", () => {
    assert.equal(
      formatPackageFreezeLabel({ freezeAllowedCount: 1, freezeMaxDaysPerUse: 7 }, labels),
      "1 × 7 days",
    );
  });
});
