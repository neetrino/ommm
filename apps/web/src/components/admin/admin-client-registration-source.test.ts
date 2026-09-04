import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clientRegistrationSourceLabel } from "./admin-client-registration-source";

const LABELS = {
  self: "Self-registered",
  byAdmin: "Registered by admin",
  byManager: "Registered by manager",
  byStaff: "Registered by staff",
} as const;

describe("clientRegistrationSourceLabel", () => {
  it("labels self-registration", () => {
    assert.equal(
      clientRegistrationSourceLabel({
        registrationSource: "SELF",
        registeredBy: null,
        labels: LABELS,
      }),
      "Self-registered",
    );
  });

  it("labels admin-created clients", () => {
    assert.equal(
      clientRegistrationSourceLabel({
        registrationSource: "STAFF",
        registeredBy: { id: "a1", name: "Ada", role: "ADMIN" },
        labels: LABELS,
      }),
      "Registered by admin",
    );
  });

  it("labels manager-created clients", () => {
    assert.equal(
      clientRegistrationSourceLabel({
        registrationSource: "STAFF",
        registeredBy: { id: "m1", name: "Mia", role: "MANAGER" },
        labels: LABELS,
      }),
      "Registered by manager",
    );
  });

  it("falls back to staff when creator role is unknown", () => {
    assert.equal(
      clientRegistrationSourceLabel({
        registrationSource: "STAFF",
        registeredBy: null,
        labels: LABELS,
      }),
      "Registered by staff",
    );
  });
});
