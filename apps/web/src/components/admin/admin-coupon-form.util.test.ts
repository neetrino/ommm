import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { couponPackagePlanOptions, type CouponPackagePlanSource } from "./admin-coupon-package-options";
import {
  capCouponPackagePlanIds,
  couponPayloadFromDraft,
  emptyCouponDraft,
  packagePlanIdsFromProducts,
} from "./admin-coupon-form.util";

const labels = {
  sessions: (count: number) => `${count} sessions`,
  unlimited: "Unlimited",
  inactive: "Inactive",
  missing: "Unavailable package",
};

function plan(overrides: Partial<CouponPackagePlanSource> & Pick<CouponPackagePlanSource, "id">): CouponPackagePlanSource {
  return {
    name: "8 Sessions",
    categoryName: "Reformer",
    sessionsPerMonth: 8,
    isUnlimited: false,
    isActive: true,
    displayOrder: 0,
    ...overrides,
  };
}

describe("coupon package selection", () => {
  it("sends one package rule per chosen plan and keeps other kinds", () => {
    const payload = couponPayloadFromDraft({
      ...emptyCouponDraft(),
      kinds: ["PACKAGE", "DROPIN", "PACKAGE"],
      packagePlanIds: ["plan-b", "plan-a", "plan-b"],
    });
    assert.deepEqual(payload.eligibleProducts, [
      { kind: "PACKAGE", packagePlanId: "plan-b" },
      { kind: "PACKAGE", packagePlanId: "plan-a" },
      { kind: "DROPIN" },
    ]);
  });

  it("treats an empty package list as every package", () => {
    const payload = couponPayloadFromDraft({
      ...emptyCouponDraft(),
      kinds: ["PACKAGE"],
      packagePlanIds: [],
    });
    assert.deepEqual(payload.eligibleProducts, [{ kind: "PACKAGE" }]);
  });

  it("drops specific ids when a saved rule already covers every package", () => {
    assert.deepEqual(
      packagePlanIdsFromProducts([
        { kind: "PACKAGE", packagePlanId: null },
        { kind: "PACKAGE", packagePlanId: "plan-a" },
        { kind: "BAR", packagePlanId: null },
      ]),
      [],
    );
  });

  it("keeps distinct saved package ids", () => {
    assert.deepEqual(
      packagePlanIdsFromProducts([
        { kind: "PACKAGE", packagePlanId: "plan-a" },
        { kind: "PACKAGE", packagePlanId: "plan-a" },
        { kind: "PACKAGE", packagePlanId: "plan-b" },
      ]),
      ["plan-a", "plan-b"],
    );
  });

  it("stops at the product limit after other kinds take slots", () => {
    const ids = Array.from({ length: 60 }, (_, index) => `plan-${index}`);
    assert.equal(capCouponPackagePlanIds(["PACKAGE", "GIFT", "BAR"], ids).length, 48);
  });

  it("labels plans with category and sessions, and keeps a missing selection", () => {
    const options = couponPackagePlanOptions(
      [
        plan({ id: "later", name: "4 Sessions", displayOrder: 2, sessionsPerMonth: 4 }),
        plan({ id: "first", displayOrder: 1 }),
        plan({ id: "off", isActive: false, name: "Old", sessionsPerMonth: null, isUnlimited: true }),
      ],
      ["gone"],
      labels,
    );
    assert.deepEqual(
      options.map((option) => option.label),
      [
        "Reformer — 8 Sessions · 8 sessions",
        "Reformer — 4 Sessions · 4 sessions",
        "Reformer — Old · Unlimited · Inactive",
        "Unavailable package",
      ],
    );
    assert.equal(options.at(-1)?.value, "gone");
  });
});
