import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isActiveSessionRegistration,
  isOccupiedSessionRegistration,
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
  it("keeps booked, completed, and missed on the roster", () => {
    assert.equal(isOccupiedSessionRegistration(row("BOOKED")), true);
    assert.equal(isOccupiedSessionRegistration(row("COMPLETED")), true);
    assert.equal(isOccupiedSessionRegistration(row("MISSED")), true);
  });

  it("hides cancelled bookings from the roster", () => {
    assert.equal(isOccupiedSessionRegistration(row("CANCELLED")), false);
  });

  it("treats only BOOKED as an upcoming registration", () => {
    assert.equal(isActiveSessionRegistration(row("BOOKED")), true);
    assert.equal(isActiveSessionRegistration(row("COMPLETED")), false);
    assert.equal(isActiveSessionRegistration(row("MISSED")), false);
  });

  it("exposes attendance outcome only after the class", () => {
    assert.equal(sessionRegistrationOutcome("BOOKED"), null);
    assert.equal(sessionRegistrationOutcome("COMPLETED"), "COMPLETED");
    assert.equal(sessionRegistrationOutcome("MISSED"), "MISSED");
    assert.equal(sessionRegistrationOutcome("CANCELLED"), null);
  });
});
