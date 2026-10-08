import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sortPackages } from "./admin-packages-filter-logic";
import type { AdminPackageRow } from "./admin-packages-types";

function packageRow(
  overrides: Pick<AdminPackageRow, "id" | "name" | "displayOrder"> & {
    sessions?: number | null;
    createdAt?: string;
  },
): AdminPackageRow {
  const { sessions = 1, createdAt = "2026-01-01T00:00:00.000Z", ...identity } = overrides;
  return {
    ...identity,
    categoryName: "Group",
    categorySlug: "group",
    description: null,
    priceCents: 1000,
    currency: "AMD",
    billingPeriod: "MONTHLY",
    periodDays: 30,
    features: [],
    buttonLabel: "Buy",
    isPopular: false,
    isActive: true,
    sessionsPerMonth: sessions,
    isUnlimited: false,
    createdAt,
    typeSessionAllocations:
      sessions === null ? [] : [{ classTypeId: "type-1", sessionCount: sessions }],
  };
}

describe("sortPackages", () => {
  it("orders the default list by total sessions, not add order", () => {
    const rows = [
      packageRow({ id: "c16", name: "16 Classes", displayOrder: 1, sessions: 16 }),
      packageRow({ id: "c1", name: "1 Class", displayOrder: 2, sessions: 1 }),
      packageRow({ id: "c8", name: "8 Classes", displayOrder: 3, sessions: 8 }),
      packageRow({
        id: "c4",
        name: "4 Classes",
        displayOrder: 4,
        sessions: 4,
        createdAt: "2026-10-08T00:00:00.000Z",
      }),
    ];

    assert.deepEqual(
      sortPackages(rows, "displayOrder").map((row) => row.name),
      ["1 Class", "4 Classes", "8 Classes", "16 Classes"],
    );
  });

  it("places packages without a session total after counted packages", () => {
    const rows = [
      packageRow({ id: "open", name: "Open", displayOrder: 1, sessions: null }),
      packageRow({ id: "c4", name: "4 Classes", displayOrder: 2, sessions: 4 }),
    ];

    assert.deepEqual(
      sortPackages(rows, "displayOrder").map((row) => row.id),
      ["c4", "open"],
    );
  });
});
