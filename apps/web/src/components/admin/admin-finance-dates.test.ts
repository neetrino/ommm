import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasFinancePaymentsPeriodSum,
  resolveFinancePaymentsDateRange,
} from "./admin-finance-dates";

describe("resolveFinancePaymentsDateRange", () => {
  it("returns an open range when dates are empty", () => {
    assert.deepEqual(resolveFinancePaymentsDateRange("", ""), {});
  });

  it("keeps a custom from/to period", () => {
    assert.deepEqual(resolveFinancePaymentsDateRange("2026-08-01", "2026-09-04"), {
      from: "2026-08-01",
      to: "2026-09-04",
    });
  });

  it("swaps inverted dates so the API range stays valid", () => {
    assert.deepEqual(resolveFinancePaymentsDateRange("2026-09-04", "2026-08-01"), {
      from: "2026-08-01",
      to: "2026-09-04",
    });
  });
});

describe("hasFinancePaymentsPeriodSum", () => {
  it("hides the sum without dates and shows it for a custom period", () => {
    assert.equal(hasFinancePaymentsPeriodSum({}), false);
    assert.equal(hasFinancePaymentsPeriodSum({ from: "2026-09-01" }), true);
    assert.equal(hasFinancePaymentsPeriodSum({ from: "2026-09-01", to: "2026-09-04" }), true);
  });
});
