import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSoldPackagesFilterFields,
  normalizeSoldPackagesDraftChange,
  planBelongsToSoldPackageCategory,
  soldPackageCategoryFilterOptions,
  soldPackagePlanFilterOptions,
} from "./admin-packages-sold-filter-fields";
import type { AdminPackageRow } from "./admin-packages-types";
import {
  PACKAGES_SOLD_CATEGORY_ALL,
  PACKAGES_SOLD_CATEGORY_QUERY_KEY,
  PACKAGES_SOLD_PLAN_ALL,
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

function plan(
  partial: Pick<AdminPackageRow, "id" | "name" | "categoryName" | "categorySlug">,
): AdminPackageRow {
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

const SAMPLE_PLANS = [
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
] as const;

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
    const options = soldPackageCategoryFilterOptions(SAMPLE_PLANS);
    assert.equal(options.length, 2);
    assert.deepEqual(
      new Set(options.map((option) => option.value)),
      new Set(["reformer", "yoga-by-ommm"]),
    );
  });
});

describe("soldPackagePlanFilterOptions", () => {
  it("returns only plans for the selected category", () => {
    const options = soldPackagePlanFilterOptions(SAMPLE_PLANS, "yoga-by-ommm");
    assert.deepEqual(
      options.map((option) => option.value),
      ["p1", "p2"],
    );
  });

  it("returns all plans when category is all", () => {
    const options = soldPackagePlanFilterOptions(SAMPLE_PLANS, PACKAGES_SOLD_CATEGORY_ALL);
    assert.equal(options.length, 3);
  });
});

describe("normalizeSoldPackagesDraftChange", () => {
  it("clears plan when category no longer includes it", () => {
    const next = normalizeSoldPackagesDraftChange(
      SAMPLE_PLANS,
      {
        [PACKAGES_SOLD_CATEGORY_QUERY_KEY]: PACKAGES_SOLD_CATEGORY_ALL,
        [PACKAGES_SOLD_PLAN_QUERY_KEY]: "p3",
      },
      PACKAGES_SOLD_CATEGORY_QUERY_KEY,
      "yoga-by-ommm",
    );
    assert.equal(next[PACKAGES_SOLD_PLAN_QUERY_KEY], PACKAGES_SOLD_PLAN_ALL);
  });

  it("keeps plan when it still belongs to the category", () => {
    const next = normalizeSoldPackagesDraftChange(
      SAMPLE_PLANS,
      {
        [PACKAGES_SOLD_CATEGORY_QUERY_KEY]: PACKAGES_SOLD_CATEGORY_ALL,
        [PACKAGES_SOLD_PLAN_QUERY_KEY]: "p1",
      },
      PACKAGES_SOLD_CATEGORY_QUERY_KEY,
      "yoga-by-ommm",
    );
    assert.equal(next[PACKAGES_SOLD_PLAN_QUERY_KEY], "p1");
  });
});

describe("planBelongsToSoldPackageCategory", () => {
  it("treats all as belonging to any category", () => {
    assert.equal(
      planBelongsToSoldPackageCategory(SAMPLE_PLANS, PACKAGES_SOLD_PLAN_ALL, "reformer"),
      true,
    );
  });
});
