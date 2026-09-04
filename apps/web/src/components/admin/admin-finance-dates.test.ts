import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasFinancePaymentsPeriodSum } from "./admin-finance-dates";

describe("hasFinancePaymentsPeriodSum", () => {
  it("hides the sum for all-time and shows it for a bounded range", () => {
    assert.equal(hasFinancePaymentsPeriodSum("all"), false);
    assert.equal(hasFinancePaymentsPeriodSum(7), true);
    assert.equal(hasFinancePaymentsPeriodSum(30), true);
    assert.equal(hasFinancePaymentsPeriodSum(90), true);
  });
});
