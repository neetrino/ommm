import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dashboardNavDefinitionsForRole,
  dashboardNotificationRouteForRole,
} from "./dashboard-nav";

describe("dashboard-nav manager parity", () => {
  it("MANAGER_NAV matches admin operational order with today-only finance, plus profile", () => {
    const nav = dashboardNavDefinitionsForRole("MANAGER");
    assert.deepEqual(
      nav.map((item) => item.href),
      [
        "/manager/dashboard",
        "/manager/bookings",
        "/manager/waitlists",
        "/manager/calls",
        "/manager/clients",
        "/manager/coaches",
        "/manager/schedule",
        "/manager/packages",
        "/manager/gift-cards",
        "/manager/coupons",
        "/manager/finance",
        "/manager/analytics",
        "/manager/content",
        "/manager/settings",
        "/manager/profile",
      ],
    );
    assert.deepEqual(
      nav.filter((item) => item.href.includes("finance")).map((item) => item.href),
      ["/manager/finance"],
    );
    assert.equal(nav.some((item) => item.href.includes("guest-users")), false);
    assert.equal(nav.at(-1)?.href, "/manager/profile");
    assert.equal(nav.some((item) => item.href.includes("notifications")), false);
  });

  it("manager and admin have no header notification route", () => {
    assert.equal(dashboardNotificationRouteForRole("MANAGER"), null);
    assert.equal(dashboardNotificationRouteForRole("ADMIN"), null);
  });

  it("ADMIN_NAV places Manager after Coaches and before Schedule", () => {
    const hrefs = dashboardNavDefinitionsForRole("ADMIN").map((item) => item.href);
    const coachesIndex = hrefs.indexOf("/admin/coaches");
    const managersIndex = hrefs.indexOf("/admin/managers");
    const scheduleIndex = hrefs.indexOf("/admin/schedule");
    assert.ok(coachesIndex >= 0);
    assert.ok(managersIndex === coachesIndex + 1);
    assert.ok(scheduleIndex === managersIndex + 1);
    assert.equal(hrefs.includes("/admin/guest-users"), false);
  });

  it("coach nav includes a clients section after bookings", () => {
    const hrefs = dashboardNavDefinitionsForRole("COACH").map((item) => item.href);
    const groupsIndex = hrefs.indexOf("/coach/groups");
    const clientsIndex = hrefs.indexOf("/coach/clients");
    const groups = dashboardNavDefinitionsForRole("COACH").find(
      (item) => item.href === "/coach/groups",
    );
    assert.equal(groups?.oliveIconSlug, "bookings");
    assert.equal(clientsIndex, groupsIndex + 1);
    const clients = dashboardNavDefinitionsForRole("COACH").find(
      (item) => item.href === "/coach/clients",
    );
    assert.equal(clients?.labelKey, "clients");
    assert.equal(clients?.oliveIconSlug, "clients");
  });

  it("manager schedule uses calendar icon like admin", () => {
    const schedule = dashboardNavDefinitionsForRole("MANAGER").find(
      (item) => item.href === "/manager/schedule",
    );
    assert.ok(schedule);
    assert.equal(schedule.icon, "calendar");
    assert.equal(schedule.labelKey, "schedule");
  });

  it("manager olive icons match admin counterparts for shared sections", () => {
    const adminByLabel = new Map(
      dashboardNavDefinitionsForRole("ADMIN").map((item) => [
        item.labelKey,
        item.oliveIconSlug,
      ]),
    );
    for (const item of dashboardNavDefinitionsForRole("MANAGER")) {
      assert.equal(
        item.oliveIconSlug,
        adminByLabel.get(item.labelKey),
        `${item.labelKey} olive icon must match Admin`,
      );
    }
  });
});
