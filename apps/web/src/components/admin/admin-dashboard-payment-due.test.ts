import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  studioPaymentDueClientHref,
  visiblePaymentDueClients,
} from "./admin-dashboard-payment-due";
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

describe("visiblePaymentDueClients", () => {
  const items = [
    {
      clientId: "c1",
      clientName: "Ana",
      packageId: "p1",
      packageName: "Pack A",
    },
    {
      clientId: "c1",
      clientName: "Ana",
      packageId: "p1b",
      packageName: "Pack A2",
    },
    {
      clientId: "c2",
      clientName: "Ben",
      packageId: "p2",
      packageName: "Pack B",
    },
    {
      clientId: "c3",
      clientName: "Cia",
      packageId: "p3",
      packageName: "Pack C",
    },
    {
      clientId: "c4",
      clientName: "Dan",
      packageId: "p4",
      packageName: "Pack D",
    },
  ];

  it("shows at most three unique people until view all is opened", () => {
    assert.deepEqual(
      visiblePaymentDueClients(items, false).map((item) => item.clientId),
      ["c1", "c2", "c3"],
    );
  });

  it("shows every unique person after view all", () => {
    assert.deepEqual(
      visiblePaymentDueClients(items, true).map((item) => item.clientId),
      ["c1", "c2", "c3", "c4"],
    );
  });
});

