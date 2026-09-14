import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldShowStudioPackagePaymentDue } from "./admin-client-package-payment-due";

const UNPAID_CASH = {
  paymentStatus: "PENDING",
  paymentMethod: "CASH",
  usedSessions: 0,
} as const;

describe("shouldShowStudioPackagePaymentDue", () => {
  it("hides the warning until the unpaid studio package has been used", () => {
    assert.equal(shouldShowStudioPackagePaymentDue(UNPAID_CASH), false);
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        ...UNPAID_CASH,
        paymentMethod: "CARD_TERMINAL",
      }),
      false,
    );
  });

  it("shows the warning after a cash or terminal package has been used", () => {
    assert.equal(
      shouldShowStudioPackagePaymentDue({ ...UNPAID_CASH, usedSessions: 1 }),
      true,
    );
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "CASH",
        usedSessions: 0,
        guestSlotsTotal: 2,
        guestSlotsRemaining: 1,
      }),
      true,
    );
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "CARD_TERMINAL",
        usedSessions: 0,
        typeBalances: [{ usedSessions: 2 }],
      }),
      true,
    );
  });

  it("hides the warning after mark as paid or for non-studio methods", () => {
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "SUCCEEDED",
        paymentMethod: "CASH",
        usedSessions: 3,
      }),
      false,
    );
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "INFLUENCER",
        usedSessions: 1,
      }),
      false,
    );
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "CARD",
        usedSessions: 1,
      }),
      false,
    );
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "FAILED",
        paymentMethod: "CASH",
        usedSessions: 1,
      }),
      false,
    );
  });
});
