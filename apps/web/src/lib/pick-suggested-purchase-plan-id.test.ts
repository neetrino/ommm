import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickSuggestedPurchasePlanId } from "./pick-suggested-purchase-plan-id";

describe("pickSuggestedPurchasePlanId", () => {
  it("returns undefined when there are no covering plans", () => {
    assert.equal(
      pickSuggestedPurchasePlanId(
        [{ planId: "plan-a", canBook: false }],
        [],
      ),
      undefined,
    );
  });

  it("prefers depleted eligible package plan when it is in the list", () => {
    assert.equal(
      pickSuggestedPurchasePlanId(
        [
          { planId: "plan-depleted", canBook: false },
          { planId: "plan-other", canBook: false },
        ],
        [{ id: "plan-first" }, { id: "plan-depleted" }],
      ),
      "plan-depleted",
    );
  });

  it("falls back to first covering plan when nothing is purchased", () => {
    assert.equal(
      pickSuggestedPurchasePlanId([], [{ id: "plan-a" }, { id: "plan-b" }]),
      "plan-a",
    );
  });

  it("ignores depleted planId that does not cover this class", () => {
    assert.equal(
      pickSuggestedPurchasePlanId(
        [{ planId: "plan-mat-only", canBook: false }],
        [{ id: "plan-reformer" }],
      ),
      "plan-reformer",
    );
  });
});
