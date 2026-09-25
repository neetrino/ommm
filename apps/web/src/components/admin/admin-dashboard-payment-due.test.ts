import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dashboardHomeHref,
  dashboardClientsHref,
  studioPaymentDuePageHref,
} from "./admin-dashboard-metrics.helpers";
import {
  formatPaymentDuePurchaseLabel,
  groupPaymentDueByClient,
  previewPaymentDueClients,
  previewPaymentDueGroups,
} from "./admin-dashboard-payment-due";

describe("dashboardClientsHref", () => {
  it("uses admin clients for finance dashboards and manager clients otherwise", () => {
    assert.equal(dashboardClientsHref(true), "/admin/clients");
    assert.equal(dashboardClientsHref(false), "/manager/clients");
  });
});

describe("studioPaymentDuePageHref", () => {
  it("uses admin payment-due for finance dashboards and manager otherwise", () => {
    assert.equal(studioPaymentDuePageHref(true), "/admin/payment-due");
    assert.equal(studioPaymentDuePageHref(false), "/manager/payment-due");
  });
});

describe("dashboardHomeHref", () => {
  it("uses admin dashboard for finance dashboards and manager otherwise", () => {
    assert.equal(dashboardHomeHref(true), "/admin/dashboard");
    assert.equal(dashboardHomeHref(false), "/manager/dashboard");
  });
});

describe("formatPaymentDuePurchaseLabel", () => {
  it("joins category and plan when the plan name does not already include it", () => {
    assert.equal(
      formatPaymentDuePurchaseLabel("Yoga Individual", "1 Session"),
      "Yoga Individual · 1 Session",
    );
  });

  it("keeps the plan name when it already contains the category", () => {
    assert.equal(
      formatPaymentDuePurchaseLabel("Yoga Individual", "Yoga Individual 1 Session"),
      "Yoga Individual 1 Session",
    );
  });
});

describe("previewPaymentDueClients", () => {
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
    {
      clientId: "c5",
      clientName: "Eva",
      packageId: "p5",
      packageName: "Pack E",
    },
    {
      clientId: "c6",
      clientName: "Fay",
      packageId: "p6",
      packageName: "Pack F",
    },
  ];

  it("shows at most five unique people on the dashboard preview", () => {
    assert.deepEqual(
      previewPaymentDueClients(items).map((item) => item.clientId),
      ["c1", "c2", "c3", "c4", "c5"],
    );
  });
});

describe("previewPaymentDueGroups", () => {
  it("keeps every package for the clients shown on the dashboard", () => {
    const grouped = previewPaymentDueGroups([
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
    ]);

    assert.deepEqual(grouped, [
      {
        clientId: "c1",
        clientName: "Ana",
        packages: [
          { packageId: "p1", packageName: "Pack A" },
          { packageId: "p1b", packageName: "Pack A2" },
        ],
      },
    ]);
  });
});

describe("groupPaymentDueByClient", () => {
  it("keeps every unpaid package under the same client", () => {
    const grouped = groupPaymentDueByClient([
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
    ]);

    assert.deepEqual(grouped, [
      {
        clientId: "c1",
        clientName: "Ana",
        packages: [
          { packageId: "p1", packageName: "Pack A" },
          { packageId: "p1b", packageName: "Pack A2" },
        ],
      },
      {
        clientId: "c2",
        clientName: "Ben",
        packages: [{ packageId: "p2", packageName: "Pack B" }],
      },
    ]);
  });
});
