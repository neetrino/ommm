import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFinancePaymentsAdminApiQuery,
  buildFinancePaymentsFiltersQuery,
} from "./admin-finance-url.build";

const BASE_FILTERS = {
  q: "",
  from: "",
  to: "",
  source: "all",
  status: "all",
  paymentMethod: "all",
  planId: "all",
  packageClass: "all",
  sessions: "all",
  order: "newest",
} as const;

describe("buildFinancePaymentsFiltersQuery", () => {
  it("omits the default all-methods filter", () => {
    const query = buildFinancePaymentsFiltersQuery(BASE_FILTERS, new URLSearchParams());
    assert.equal(query.includes("paymentMethod="), false);
  });

  it("writes cash, card, and terminal to the URL", () => {
    const query = buildFinancePaymentsFiltersQuery(
      { ...BASE_FILTERS, paymentMethod: "CARD_TERMINAL" },
      new URLSearchParams(),
    );
    assert.equal(new URLSearchParams(query).get("paymentMethod"), "CARD_TERMINAL");
  });

  it("writes a custom from/to period to the URL", () => {
    const query = buildFinancePaymentsFiltersQuery(
      { ...BASE_FILTERS, from: "2026-08-01", to: "2026-09-04" },
      new URLSearchParams(),
    );
    const params = new URLSearchParams(query);
    assert.equal(params.get("from"), "2026-08-01");
    assert.equal(params.get("to"), "2026-09-04");
    assert.equal(params.get("rangeDays"), null);
  });
});

describe("buildFinancePaymentsAdminApiQuery", () => {
  it("forwards paymentMethod to the admin list API", () => {
    const path = buildFinancePaymentsAdminApiQuery(
      { ...BASE_FILTERS, paymentMethod: "CASH" },
      { from: "2026-09-01", to: "2026-09-04" },
      { take: 25, offset: 0 },
    );
    const params = new URLSearchParams(path.split("?")[1]);
    assert.equal(params.get("paymentMethod"), "CASH");
    assert.equal(params.get("from"), "2026-09-01");
  });
});
