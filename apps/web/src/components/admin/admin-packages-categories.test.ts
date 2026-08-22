import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  sortPackageCategoriesActiveFirst,
} from "./admin-packages-categories";
import type { AdminPackageRow } from "./admin-packages-types";

function packageRow(
  overrides: Pick<AdminPackageRow, "id" | "categorySlug" | "isActive">,
): AdminPackageRow {
  return {
    name: "Plan",
    categoryName: overrides.categorySlug,
    description: null,
    priceCents: 1000,
    currency: "AMD",
    billingPeriod: "MONTHLY",
    periodDays: 30,
    features: [],
    buttonLabel: "Buy",
    isPopular: false,
    displayOrder: 1,
    sessionsPerMonth: 8,
    isUnlimited: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("sortPackageCategoriesActiveFirst", () => {
  it("keeps active groups first and preserves relative order", () => {
    const categories = [
      { id: "first-breath", label: "First Breath" },
      { id: "first-circle", label: "First Circle" },
      { id: "group-dances", label: "Group Dances" },
      { id: "group-mat", label: "Group Mat Pilates" },
      { id: "group-power", label: "Group Power Pilates" },
    ];
    const packages = [
      packageRow({ id: "p1", categorySlug: "first-breath", isActive: false }),
      packageRow({ id: "p2", categorySlug: "first-circle", isActive: false }),
      packageRow({ id: "p3", categorySlug: "group-dances", isActive: true }),
      packageRow({ id: "p4", categorySlug: "group-mat", isActive: true }),
      packageRow({ id: "p5", categorySlug: "group-power", isActive: true }),
    ];

    assert.deepEqual(
      sortPackageCategoriesActiveFirst(categories, packages).map((row) => row.id),
      ["group-dances", "group-mat", "group-power", "first-breath", "first-circle"],
    );
  });

  it("treats a mixed group as inactive", () => {
    const categories = [
      { id: "mixed", label: "Mixed" },
      { id: "active", label: "Active" },
    ];
    const packages = [
      packageRow({ id: "m1", categorySlug: "mixed", isActive: true }),
      packageRow({ id: "m2", categorySlug: "mixed", isActive: false }),
      packageRow({ id: "a1", categorySlug: "active", isActive: true }),
    ];

    assert.deepEqual(
      sortPackageCategoriesActiveFirst(categories, packages).map((row) => row.id),
      ["active", "mixed"],
    );
  });
});
