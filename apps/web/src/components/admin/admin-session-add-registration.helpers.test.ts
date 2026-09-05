import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";
import {
  buildSessionAddClientSearchUrl,
  canAddVisitorToSession,
  canOfferSessionAdd,
  shouldAttachVisitorAsPastVisit,
  isSearchQueryReady,
  parseClientSearchRows,
  pickOwnerBookablePackageId,
} from "./admin-session-add-registration.helpers";

function packageRow(
  overrides: Partial<EligibleBookingPackage> = {},
): EligibleBookingPackage {
  return {
    userPackageId: "pkg-1",
    planId: "plan-1",
    planName: "Mat 8",
    remainingSessions: 4,
    totalSessions: 8,
    usedSessions: 4,
    isUnlimited: false,
    canBook: true,
    currentPeriodStart: "2026-08-01T00:00:00.000Z",
    currentPeriodEnd: "2026-09-01T00:00:00.000Z",
    includedCategories: ["mat"],
    ...overrides,
  };
}

describe("admin-session-add-registration.helpers", () => {
  it("builds a compact clients search URL", () => {
    assert.equal(
      buildSessionAddClientSearchUrl("  Anna  "),
      "/clients?search=Anna&take=8&offset=0",
    );
  });

  it("reads rows from both list payload shapes", () => {
    const row = { id: "c1" } as ClientRow;
    assert.deepEqual(parseClientSearchRows([row]), [row]);
    assert.deepEqual(
      parseClientSearchRows({
        rows: [row],
        summary: {
          total: 1,
          active: 1,
          withPackage: 1,
          vip: 0,
          totalVisits: 0,
          lifetimeValueCents: 0,
        },
        filterOptions: { preferredCoaches: [], classLevels: [] },
        pagination: { total: 1, take: 8, offset: 0 },
      }),
      [row],
    );
  });

  it("picks only an owner-bookable package", () => {
    assert.equal(pickOwnerBookablePackageId([]), null);
    assert.equal(
      pickOwnerBookablePackageId([packageRow({ canBook: false, canBookGuest: true })]),
      null,
    );
    assert.equal(
      pickOwnerBookablePackageId([
        packageRow({ userPackageId: "guest", canBook: false, canBookGuest: true }),
        packageRow({ userPackageId: "owner", canBook: true }),
      ]),
      "owner",
    );
  });

  it("blocks add only when the session is full", () => {
    assert.equal(canAddVisitorToSession({ booked: 13, capacity: 13 }), false);
    assert.equal(canAddVisitorToSession({ booked: 3, capacity: 13 }), true);
  });

  it("attaches started and finished sessions as a past visit", () => {
    const now = Date.parse("2026-08-30T09:00:00.000Z");
    assert.equal(
      shouldAttachVisitorAsPastVisit("2026-08-30T08:00:00.000Z", now),
      true,
    );
    assert.equal(
      shouldAttachVisitorAsPastVisit("2026-08-30T10:00:00.000Z", now),
      false,
    );
  });

  it("requires at least two search characters", () => {
    assert.equal(isSearchQueryReady("A"), false);
    assert.equal(isSearchQueryReady("  An"), true);
  });

  it("offers Add only for an unblocked client with an active package", () => {
    assert.equal(
      canOfferSessionAdd({
        packageTone: "active",
        alreadyRegistered: false,
        blocked: false,
      }),
      true,
    );
    assert.equal(
      canOfferSessionAdd({
        packageTone: "none",
        alreadyRegistered: false,
        blocked: false,
      }),
      false,
    );
    assert.equal(
      canOfferSessionAdd({
        packageTone: "active",
        alreadyRegistered: true,
        blocked: false,
      }),
      false,
    );
  });
});
