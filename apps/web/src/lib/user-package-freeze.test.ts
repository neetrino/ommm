import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPTY_USER_PACKAGE_FREEZE,
  normalizeUserPackageFreeze,
} from "./user-package-freeze";

describe("normalizeUserPackageFreeze", () => {
  it("returns empty freeze state for missing payloads", () => {
    assert.deepEqual(normalizeUserPackageFreeze(undefined), EMPTY_USER_PACKAGE_FREEZE);
    assert.deepEqual(normalizeUserPackageFreeze(null), EMPTY_USER_PACKAGE_FREEZE);
  });

  it("reads freeze limits and remaining uses from the API", () => {
    assert.deepEqual(
      normalizeUserPackageFreeze({
        allowedCount: 1,
        maxDaysPerUse: 7,
        usedCount: 0,
        remainingCount: 1,
        pausedAt: null,
        pausedUntil: null,
        canFreeze: true,
        canUnfreeze: false,
      }),
      {
        allowedCount: 1,
        maxDaysPerUse: 7,
        usedCount: 0,
        remainingCount: 1,
        pausedAt: null,
        pausedUntil: null,
        canFreeze: true,
        canUnfreeze: false,
      },
    );
  });
});
