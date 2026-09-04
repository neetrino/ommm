import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseFinancePaymentMethodFilter,
  parseFinancePaymentsDateFilter,
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

describe("parseFinancePaymentsDateFilter", () => {
  it("accepts a calendar day and rejects junk", () => {
    assert.equal(parseFinancePaymentsDateFilter("2026-09-04"), "2026-09-04");
    assert.equal(parseFinancePaymentsDateFilter("not-a-date"), "");
    assert.equal(parseFinancePaymentsDateFilter(undefined), "");
  });
});

describe("parseFinancePaymentsFiltersFromSearch", () => {
  it("reads paymentMethod and a custom date period", () => {
    const filters = parseFinancePaymentsFiltersFromSearch({
      paymentMethod: "CASH",
      from: "2026-08-01",
      to: "2026-09-04",
    });
    assert.equal(filters.paymentMethod, "CASH");
    assert.equal(filters.from, "2026-08-01");
    assert.equal(filters.to, "2026-09-04");
  });
});
