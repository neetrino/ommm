import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { studioPaymentDueClientHref } from "./admin-dashboard-payment-due";
import { dashboardClientsHref } from "./admin-dashboard-metrics.helpers";

describe("studioPaymentDueClientHref", () => {
  it("opens the client packages tab from admin or manager clients", () => {
    assert.equal(
      studioPaymentDueClientHref("/admin/clients", "client-1"),
      "/admin/clients?viewClient=client-1&clientTab=packages",
    );
    assert.equal(
      studioPaymentDueClientHref("/manager/clients", "client-1"),
      "/manager/clients?viewClient=client-1&clientTab=packages",
    );
  });
});

describe("dashboardClientsHref", () => {
  it("uses admin clients for finance dashboards and manager clients otherwise", () => {
    assert.equal(dashboardClientsHref(true), "/admin/clients");
    assert.equal(dashboardClientsHref(false), "/manager/clients");
  });
});


describe("studioPaymentDueClientHref", () => {
  it("opens the client packages tab from admin or manager clients", () => {
    assert.equal(
      studioPaymentDueClientHref("/admin/clients", "client-1"),
      "/admin/clients?viewClient=client-1&clientTab=packages",
    );
    assert.equal(
      studioPaymentDueClientHref("/manager/clients", "client-1"),
      "/manager/clients?viewClient=client-1&clientTab=packages",
    );
  });
});
