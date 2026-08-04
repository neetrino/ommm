import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminBackofficeCapabilities,
  adminBookingCapabilities,
  adminClientCapabilities,
  adminContentCapabilities,
  adminGiftCardCapabilities,
  adminNotificationCapabilities,
  adminScheduleCapabilities,
  capabilitiesForRole,
  managerBackofficeCapabilities,
  managerBookingCapabilities,
  managerClientCapabilities,
  managerContentCapabilities,
  managerGiftCardCapabilities,
  managerNotificationCapabilities,
  managerScheduleCapabilities,
  resolveBackofficeCapabilities,
} from "./backoffice-capabilities";

describe("backoffice-capabilities", () => {
  it("admin has full write including delete", () => {
    const caps = adminBackofficeCapabilities();
    assert.equal(caps.canView, true);
    assert.equal(caps.canCreate, true);
    assert.equal(caps.canUpdate, true);
    assert.equal(caps.canDelete, true);
  });

  it("manager can write but not hard-delete", () => {
    const caps = managerBackofficeCapabilities();
    assert.equal(caps.canView, true);
    assert.equal(caps.canCreate, true);
    assert.equal(caps.canUpdate, true);
    assert.equal(caps.canDelete, false);
  });

  it("manager domain caps keep operational writes and block analytics/delete", () => {
    assert.equal(managerClientCapabilities().canAssignPackage, true);
    assert.equal(managerClientCapabilities().canCreateBooking, true);
    assert.equal(managerClientCapabilities().canCancelBooking, true);
    assert.equal(managerClientCapabilities().canAddNotes, true);
    assert.equal(managerClientCapabilities().canDelete, false);
    assert.equal(managerScheduleCapabilities().canCancel, true);
    assert.equal(managerScheduleCapabilities().canDuplicate, true);
    assert.equal(managerScheduleCapabilities().canDelete, false);
    assert.equal(managerGiftCardCapabilities().canAssign, true);
    assert.equal(managerGiftCardCapabilities().canDeactivate, true);
    assert.equal(managerGiftCardCapabilities().canDelete, false);
    assert.equal(managerNotificationCapabilities().canBroadcast, true);
    assert.equal(managerNotificationCapabilities().canViewAnalytics, false);
    assert.equal(managerContentCapabilities().canDelete, false);
    assert.equal(managerBookingCapabilities().canCancel, true);
    assert.equal(managerBookingCapabilities().canDelete, false);
  });

  it("admin domain caps include analytics and delete", () => {
    assert.equal(adminClientCapabilities().canCreateBooking, true);
    assert.equal(adminClientCapabilities().canCancelBooking, true);
    assert.equal(adminClientCapabilities().canDelete, true);
    assert.equal(adminScheduleCapabilities().canDelete, true);
    assert.equal(adminGiftCardCapabilities().canDelete, true);
    assert.equal(adminNotificationCapabilities().canViewAnalytics, true);
    assert.equal(adminContentCapabilities().canDelete, true);
    assert.equal(adminBookingCapabilities().canDelete, true);
  });

  it("capabilitiesForRole maps admin and manager", () => {
    assert.equal(capabilitiesForRole("ADMIN").canDelete, true);
    assert.equal(capabilitiesForRole("MANAGER").canDelete, false);
    assert.equal(capabilitiesForRole("USER").canCreate, false);
  });

  it("resolveBackofficeCapabilities honors explicit caps over readOnly", () => {
    const caps = resolveBackofficeCapabilities(managerBackofficeCapabilities(), true);
    assert.equal(caps.canCreate, true);
    assert.equal(caps.canDelete, false);
  });

  it("resolveBackofficeCapabilities treats legacy readOnly as write-false", () => {
    const caps = resolveBackofficeCapabilities(undefined, true);
    assert.equal(caps.canCreate, false);
    assert.equal(caps.canUpdate, false);
    assert.equal(caps.canDelete, false);
  });
});
