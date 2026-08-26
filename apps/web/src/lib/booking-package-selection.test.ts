import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EligibleBookingPackage } from "./eligible-booking-package";
import {
  hasBookablePackage,
  pickDefaultBookingPackageId,
  resolveAutoBookPackageId,
  shouldPromptBookingPackageSelection,
} from "./booking-package-selection";

function pkg(
  overrides: Partial<EligibleBookingPackage> & { userPackageId: string },
): EligibleBookingPackage {
  return {
    planId: "plan-1",
    planName: "Pack",
    remainingSessions: 4,
    totalSessions: 8,
    usedSessions: 4,
    isUnlimited: false,
    canBook: false,
    currentPeriodStart: "2026-08-01T00:00:00.000Z",
    currentPeriodEnd: "2026-09-01T00:00:00.000Z",
    includedCategories: ["Reformer"],
    ...overrides,
  };
}

describe("booking-package-selection", () => {
  it("opens the modal when a guest pass is available", () => {
    const packages = [
      pkg({ userPackageId: "a", canBook: true, canBookGuest: true }),
    ];
    assert.equal(shouldPromptBookingPackageSelection(packages), true);
    assert.equal(resolveAutoBookPackageId(packages), undefined);
    assert.equal(hasBookablePackage(packages), true);
  });

  it("auto-books a single owner-only package", () => {
    const packages = [pkg({ userPackageId: "a", canBook: true })];
    assert.equal(shouldPromptBookingPackageSelection(packages), false);
    assert.equal(resolveAutoBookPackageId(packages), "a");
  });

  it("prefers an owner package, then a guest-only package", () => {
    assert.equal(
      pickDefaultBookingPackageId([
        pkg({ userPackageId: "guest", canBookGuest: true }),
        pkg({ userPackageId: "owner", canBook: true }),
      ]),
      "owner",
    );
    assert.equal(
      pickDefaultBookingPackageId([
        pkg({ userPackageId: "empty" }),
        pkg({ userPackageId: "guest", canBookGuest: true }),
      ]),
      "guest",
    );
  });
});
