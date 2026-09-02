import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareSessionRegistrationRows,
  isActiveSessionRegistration,
  isOccupiedSessionRegistration,
  isRosterSessionRegistration,
  isStaffCancellableSessionRegistration,
  sessionCancelledByDisplayName,
  sessionRegistrationOutcome,
  type SessionRegistrationRow,
} from "./admin-session-registrations-types";

function row(status: string): SessionRegistrationRow {
  return {
    id: "b1",
    status,
    createdAt: "2026-08-20T08:00:00.000Z",
    user: {
      id: "u1",
      name: "Anna",
      lastName: "Hakobyan",
      email: "anna@example.com",
      phone: null,
      avatarUrl: null,
    },
  };
}

describe("session registration roster filters", () => {
  it("keeps booked, completed, and missed as occupied seats", () => {
    assert.equal(isOccupiedSessionRegistration(row("BOOKED")), true);
    assert.equal(isOccupiedSessionRegistration(row("COMPLETED")), true);
    assert.equal(isOccupiedSessionRegistration(row("MISSED")), true);
  });

  it("keeps cancelled bookings on the roster without occupying a seat", () => {
    assert.equal(isOccupiedSessionRegistration(row("CANCELLED")), false);
    assert.equal(isRosterSessionRegistration(row("CANCELLED")), true);
  });

  it("allows staff cancel for booked, completed, and missed", () => {
    assert.equal(isStaffCancellableSessionRegistration(row("BOOKED")), true);
    assert.equal(isStaffCancellableSessionRegistration(row("COMPLETED")), true);
    assert.equal(isStaffCancellableSessionRegistration(row("MISSED")), true);
    assert.equal(isStaffCancellableSessionRegistration(row("CANCELLED")), false);
    assert.equal(isActiveSessionRegistration(row("BOOKED")), true);
    assert.equal(isActiveSessionRegistration(row("COMPLETED")), false);
  });

  it("sorts cancelled members after occupied seats", () => {
    const sorted = [row("CANCELLED"), row("COMPLETED"), row("BOOKED")].sort(
      compareSessionRegistrationRows,
    );
    assert.deepEqual(
      sorted.map((item) => item.status),
      ["COMPLETED", "BOOKED", "CANCELLED"],
    );
  });

  it("exposes attendance outcome only after the class", () => {
    assert.equal(sessionRegistrationOutcome("BOOKED"), null);
    assert.equal(sessionRegistrationOutcome("COMPLETED"), "COMPLETED");
    assert.equal(sessionRegistrationOutcome("MISSED"), "MISSED");
    assert.equal(sessionRegistrationOutcome("CANCELLED"), null);
  });

  it("formats the staff actor who cancelled", () => {
    assert.equal(
      sessionCancelledByDisplayName({
        id: "m1",
        name: "Lilit",
        lastName: "Sargsyan",
        email: "lilit@ommm.am",
        role: "MANAGER",
      }),
      "Lilit Sargsyan",
    );
  });
});
