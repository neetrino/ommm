import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dashboardNavDefinitionsForRole,
  dashboardNotificationRouteForRole,
} from "./dashboard-nav";

describe("dashboard-nav manager parity", () => {
  it("MANAGER_NAV matches admin operational order without finance/analytics/profile", () => {
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
        "/manager/notifications",
        "/manager/content",
        "/manager/settings",
      ],
    );
    assert.equal(nav.some((item) => item.href.includes("finance")), false);
    assert.equal(nav.some((item) => item.href.includes("analytics")), false);
    assert.equal(nav.some((item) => item.href.includes("guest-users")), false);
    assert.equal(nav.some((item) => item.href.includes("profile")), false);
  });

  it("manager notification route points at manager notifications", () => {
    assert.deepEqual(dashboardNotificationRouteForRole("MANAGER"), {
      href: "/manager/notifications",
      labelKey: "notifications",
    });
  });

  it("ADMIN_NAV places Manager after Coaches and before Schedule", () => {
    const hrefs = dashboardNavDefinitionsForRole("ADMIN").map((item) => item.href);
    const coachesIndex = hrefs.indexOf("/admin/coaches");
    const managersIndex = hrefs.indexOf("/admin/managers");
    const scheduleIndex = hrefs.indexOf("/admin/schedule");
    assert.ok(coachesIndex >= 0);
    assert.ok(managersIndex === coachesIndex + 1);
    assert.ok(scheduleIndex === managersIndex + 1);
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
