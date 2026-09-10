import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bookingHistoryCancelActorKind,
  canCancelHistoryBooking,
  isBookingCancelStaffRole,
} from "./admin-client-bookings-history.helpers";

const MANAGER = {
  name: "Lilit",
  lastName: "Sargsyan",
  email: "lilit@ommm.am",
  role: "MANAGER",
};

describe("booking history cancel actor", () => {
  it("treats manager, admin, content admin, and coach as staff", () => {
    assert.equal(isBookingCancelStaffRole("MANAGER"), true);
    assert.equal(isBookingCancelStaffRole("ADMIN"), true);
    assert.equal(isBookingCancelStaffRole("CONTENT_ADMIN"), true);
    assert.equal(isBookingCancelStaffRole("COACH"), true);
    assert.equal(isBookingCancelStaffRole("USER"), false);
  });

  it("returns null when the booking is not cancelled", () => {
    assert.equal(bookingHistoryCancelActorKind(null, MANAGER), null);
    assert.equal(bookingHistoryCancelActorKind(undefined, null), null);
  });

  it("labels a staff cancel with the recorded actor", () => {
    assert.equal(
      bookingHistoryCancelActorKind("2026-09-10T12:00:00.000Z", MANAGER),
      "staff",
    );
  });

  it("labels a member self-cancel as the client", () => {
    assert.equal(
      bookingHistoryCancelActorKind("2026-09-10T12:00:00.000Z", {
        ...MANAGER,
        role: "USER",
      }),
      "client",
    );
  });

  it("treats a cancel without actor as the client", () => {
    assert.equal(
      bookingHistoryCancelActorKind("2026-09-10T12:00:00.000Z", null),
      "client",
    );
  });

  it("hides cancel after the booking is already cancelled", () => {
    assert.equal(
      canCancelHistoryBooking({ status: "BOOKED", cancelledAt: "2026-09-10T12:00:00.000Z" }),
      false,
    );
    assert.equal(
      canCancelHistoryBooking({ status: "BOOKED", cancelledAt: null }),
      true,
    );
  });
});
