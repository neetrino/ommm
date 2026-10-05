import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bookingHistoryBookedByText,
  bookingHistoryCancelActorKind,
  canCancelHistoryBooking,
  isBookingStaffRole,
} from "./admin-client-bookings-history.helpers";

const MANAGER = {
  id: "manager-1",
  name: "Lilit",
  lastName: "Sargsyan",
  email: "lilit@ommm.am",
  role: "MANAGER",
};

describe("booking history cancel actor", () => {
  it("treats manager, admin, content admin, and coach as staff", () => {
    assert.equal(isBookingStaffRole("MANAGER"), true);
    assert.equal(isBookingStaffRole("ADMIN"), true);
    assert.equal(isBookingStaffRole("CONTENT_ADMIN"), true);
    assert.equal(isBookingStaffRole("COACH"), true);
    assert.equal(isBookingStaffRole("USER"), false);
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

  it("labels a member booking as the client and a staff booking by name", () => {
    const copy = {
      client: "client",
      staff: (input: { name: string; role: string }) =>
        `${input.role}:${input.name}`,
      roleOnly: (input: { role: string }) => input.role,
      roleLabel: (role: string) => role,
    };
    assert.equal(bookingHistoryBookedByText(null, copy), null);
    assert.equal(
      bookingHistoryBookedByText({ ...MANAGER, role: "USER" }, copy),
      "client",
    );
    assert.equal(bookingHistoryBookedByText(MANAGER, copy), "MANAGER:Lilit Sargsyan");
    assert.equal(
      bookingHistoryBookedByText({ ...MANAGER, role: "ADMIN" }, copy),
      "ADMIN",
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
