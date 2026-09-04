import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSoldPackagesFilterFields,
  soldPackageCategoryFilterOptions,
} from "./admin-packages-sold-filter-fields";
import type { AdminPackageRow } from "./admin-packages-types";
import {
  PACKAGES_SOLD_CATEGORY_ALL,
  PACKAGES_SOLD_CATEGORY_QUERY_KEY,
  PACKAGES_SOLD_PLAN_QUERY_KEY,
} from "./admin-packages-sold";

const LABELS = {
  category: "Categories",
  categoryAll: "All categories",
  categoryEmpty: "No categories",
  package: "Package",
  packageAll: "All packages",
  packageEmpty: "No packages",
};

function plan(partial: Pick<AdminPackageRow, "id" | "name" | "categoryName" | "categorySlug">): AdminPackageRow {
  return {
    description: null,
    priceCents: 15_000,
    currency: "AMD",
    billingPeriod: "monthly",
    periodDays: 30,
    features: [],
    buttonLabel: "Buy",
    isPopular: false,
    isActive: true,
    displayOrder: 1,
    sessionsPerMonth: 1,
    isUnlimited: false,
    createdAt: "2026-09-01T00:00:00.000Z",
    ...partial,
  };
}

describe("buildSoldPackagesFilterFields", () => {
  it("puts the category select before the package select", () => {
    const fields = buildSoldPackagesFilterFields({
      labels: LABELS,
      categoryOptions: [{ value: "yoga", label: "Yoga" }],
      planOptions: [{ value: "plan-1", label: "1 Class" }],
    });

    assert.equal(fields[0]?.key, PACKAGES_SOLD_CATEGORY_QUERY_KEY);
    assert.equal(fields[0]?.emptyValue, PACKAGES_SOLD_CATEGORY_ALL);
    assert.equal(fields[1]?.key, PACKAGES_SOLD_PLAN_QUERY_KEY);
  });
});

describe("soldPackageCategoryFilterOptions", () => {
  it("dedupes plans by category slug", () => {
    const options = soldPackageCategoryFilterOptions([
      plan({
        id: "p1",
        name: "1 Class",
        categoryName: "Yoga by Ommm",
        categorySlug: "yoga-by-ommm",
      }),
      plan({
        id: "p2",
        name: "8 Classes",
        categoryName: "Yoga by Ommm",
        categorySlug: "yoga-by-ommm",
      }),
      plan({
        id: "p3",
        name: "Mix",
        categoryName: "Reformer",
        categorySlug: "reformer",
      }),
    ]);

    assert.equal(options.length, 2);
    assert.deepEqual(
      new Set(options.map((option) => option.value)),
      new Set(["reformer", "yoga-by-ommm"]),
    );
  });
});
