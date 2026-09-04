import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseFinancePaymentMethodFilter,
  parseFinancePaymentsFiltersFromSearch,
} from "./admin-finance-url.parse";

describe("parseFinancePaymentMethodFilter", () => {
  it("accepts cash, card, and terminal", () => {
    assert.equal(parseFinancePaymentMethodFilter("CASH"), "CASH");
    assert.equal(parseFinancePaymentMethodFilter("CARD"), "CARD");
    assert.equal(parseFinancePaymentMethodFilter("CARD_TERMINAL"), "CARD_TERMINAL");
  });

  it("falls back to all for unknown values", () => {
    assert.equal(parseFinancePaymentMethodFilter("BANK_TRANSFER"), "all");
    assert.equal(parseFinancePaymentMethodFilter(undefined), "all");
  });
});

describe("parseFinancePaymentsFiltersFromSearch", () => {
  it("reads paymentMethod from the query string", () => {
    const filters = parseFinancePaymentsFiltersFromSearch({
      paymentMethod: "CASH",
      rangeDays: "30",
    });
    assert.equal(filters.paymentMethod, "CASH");
    assert.equal(filters.rangeDays, 30);
  });
});
