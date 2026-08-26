import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE,
  canSubmitAdminClientBooking,
  filterUpcomingBookableSessions,
  sessionRequiresPackage,
  type AdminClientBookingUpcomingSession,
} from "./admin-client-booking-create.helpers";

function session(
  overrides: Partial<AdminClientBookingUpcomingSession> = {},
): AdminClientBookingUpcomingSession {
  return {
    id: "s1",
    startsAt: new Date(Date.now() + 86_400_000).toISOString(),
    status: "ACTIVE",
    priceCents: 0,
    sessionRequirement: null,
    classType: { name: "Yoga" },
    coach: { user: { name: "Anna" } },
    ...overrides,
  };
}

describe("admin-client-booking-create.helpers", () => {
  it("sessionRequiresPackage uses sessionRequirement then price", () => {
    assert.equal(sessionRequiresPackage(session({ sessionRequirement: 2 })), true);
    assert.equal(
      sessionRequiresPackage(session({ sessionRequirement: null, priceCents: 5000 })),
      true,
    );
    assert.equal(
      sessionRequiresPackage(session({ sessionRequirement: null, priceCents: 0 })),
      false,
    );
  });

  it("filterUpcomingBookableSessions drops cancelled draft and past", () => {
    const now = Date.parse("2026-07-29T12:00:00.000Z");
    const rows = [
      session({ id: "ok", startsAt: "2026-07-30T10:00:00.000Z" }),
      session({ id: "past", startsAt: "2026-07-28T10:00:00.000Z" }),
      session({ id: "cancelled", status: "CANCELLED", startsAt: "2026-07-30T10:00:00.000Z" }),
      session({ id: "draft", status: "DRAFT", startsAt: "2026-07-30T10:00:00.000Z" }),
    ];
    const filtered = filterUpcomingBookableSessions(rows, now);
    assert.deepEqual(
      filtered.map((row) => row.id),
      ["ok"],
    );
  });

  it("canSubmitAdminClientBooking enforces package when required", () => {
    assert.equal(
      canSubmitAdminClientBooking({
        sessionId: "s1",
        sessionsLoading: false,
        packagesLoading: false,
        packagesError: null,
        packageRequired: true,
        userPackageId: ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE,
        selectedCanBook: false,
        selectedCanBookGuest: false,
        guestName: "",
      }),
      false,
    );
    assert.equal(
      canSubmitAdminClientBooking({
        sessionId: "s1",
        sessionsLoading: false,
        packagesLoading: false,
        packagesError: null,
        packageRequired: true,
        userPackageId: "pkg-1",
        selectedCanBook: true,
        selectedCanBookGuest: false,
        guestName: "",
      }),
      true,
    );
    assert.equal(
      canSubmitAdminClientBooking({
        sessionId: "s1",
        sessionsLoading: false,
        packagesLoading: false,
        packagesError: null,
        packageRequired: false,
        userPackageId: ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE,
        selectedCanBook: false,
        selectedCanBookGuest: false,
        guestName: "",
      }),
      true,
    );
    assert.equal(
      canSubmitAdminClientBooking({
        sessionId: "s1",
        sessionsLoading: false,
        packagesLoading: false,
        packagesError: null,
        packageRequired: true,
        userPackageId: "pkg-1",
        selectedCanBook: false,
        selectedCanBookGuest: true,
        guestName: "Anna",
      }),
      true,
    );
    assert.equal(
      canSubmitAdminClientBooking({
        sessionId: "s1",
        sessionsLoading: false,
        packagesLoading: false,
        packagesError: null,
        packageRequired: true,
        userPackageId: "pkg-1",
        selectedCanBook: false,
        selectedCanBookGuest: true,
        guestName: "",
      }),
      false,
    );
  });
});
