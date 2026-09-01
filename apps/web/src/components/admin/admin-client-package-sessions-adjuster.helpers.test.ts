import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ClientSheetPackageItem } from "./admin-clients-types";
import {
  canAdjustClientPackageSessions,
  limitedPackageTypeBalances,
} from "./admin-client-package-sessions-adjuster.helpers";

function packageItem(
  overrides: Partial<ClientSheetPackageItem> = {},
): ClientSheetPackageItem {
  return {
    id: "pkg-1",
    status: "ACTIVE",
    packageName: "8 Classes",
    categoryName: "Reformer Group",
    activationDate: "2026-08-29T00:00:00.000Z",
    expirationDate: "2026-09-29T23:59:59.999Z",
    totalSessions: 8,
    usedSessions: 7,
    remainingSessions: 1,
    isUnlimited: false,
    paymentMethod: "CARD",
    ...overrides,
  };
}

describe("canAdjustClientPackageSessions", () => {
  it("allows limited active packages", () => {
    assert.equal(canAdjustClientPackageSessions(packageItem()), true);
  });

  it("hides unlimited and cancelled packages", () => {
    assert.equal(canAdjustClientPackageSessions(packageItem({ isUnlimited: true })), false);
    assert.equal(canAdjustClientPackageSessions(packageItem({ status: "CANCELLED" })), false);
  });
});

describe("limitedPackageTypeBalances", () => {
  it("keeps only limited type rows", () => {
    const rows = limitedPackageTypeBalances(
      packageItem({
        typeBalances: [
          {
            id: "a",
            classTypeName: "Reformer Group",
            totalSessions: 4,
            usedSessions: 1,
            remainingSessions: 3,
            isUnlimited: false,
          },
          {
            id: "b",
            classTypeName: "Unlimited Mat",
            totalSessions: null,
            usedSessions: 0,
            remainingSessions: null,
            isUnlimited: true,
          },
        ],
      }),
    );
    assert.deepEqual(
      rows.map((row) => row.id),
      ["a"],
    );
  });
});
