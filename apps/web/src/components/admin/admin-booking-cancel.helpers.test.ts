import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAdminCancellableBookingStatus,
  isPastAdminCancelBookingStatus,
} from "./admin-booking-cancel.helpers";

describe("admin booking cancel helpers", () => {
  it("allows cancel for booked, completed, and missed", () => {
    assert.equal(isAdminCancellableBookingStatus("BOOKED"), true);
    assert.equal(isAdminCancellableBookingStatus("COMPLETED"), true);
    assert.equal(isAdminCancellableBookingStatus("MISSED"), true);
  });

  it("rejects cancelled and waitlisted", () => {
    assert.equal(isAdminCancellableBookingStatus("CANCELLED"), false);
    assert.equal(isAdminCancellableBookingStatus("WAITLISTED"), false);
  });

  it("treats completed and missed as past cancels", () => {
    assert.equal(isPastAdminCancelBookingStatus("COMPLETED"), true);
    assert.equal(isPastAdminCancelBookingStatus("MISSED"), true);
    assert.equal(isPastAdminCancelBookingStatus("BOOKED"), false);
  });
});
