import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminPaymentStatusOptions,
  canSwapStudioPaymentMethod,
  isStudioManualPaymentMethod,
} from "./payment-confirmation";

describe("payment-confirmation", () => {
  it("treats cash and terminal as studio methods", () => {
    assert.equal(isStudioManualPaymentMethod("CASH"), true);
    assert.equal(isStudioManualPaymentMethod("CARD_TERMINAL"), true);
    assert.equal(canSwapStudioPaymentMethod("CARD"), false);
  });

  it("locks pending card status and allows refund after bank success", () => {
    assert.deepEqual(adminPaymentStatusOptions("CARD", "PENDING"), []);
    assert.deepEqual(adminPaymentStatusOptions("CARD", "SUCCEEDED"), [
      "SUCCEEDED",
      "FAILED",
      "REFUNDED",
    ]);
    assert.deepEqual(adminPaymentStatusOptions("CASH", "PENDING"), [
      "PENDING",
      "SUCCEEDED",
      "FAILED",
      "REFUNDED",
    ]);
    assert.deepEqual(adminPaymentStatusOptions("CASH", "SUCCEEDED"), [
      "SUCCEEDED",
      "PENDING",
      "REFUNDED",
    ]);
    assert.deepEqual(adminPaymentStatusOptions("CASH", "FAILED"), []);
    assert.deepEqual(adminPaymentStatusOptions("INFLUENCER", "SUCCEEDED"), []);
  });
});
