import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldShowStudioPackagePaymentDue } from "./admin-client-package-payment-due";

describe("shouldShowStudioPackagePaymentDue", () => {
  it("hides the warning until a consumed class ended at least one hour ago", () => {
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "CASH",
        paymentDue: false,
      }),
      false,
    );
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "CARD_TERMINAL",
      }),
      false,
    );
  });

  it("shows the warning for unpaid cash or terminal after the class-end delay", () => {
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "CASH",
        paymentDue: true,
      }),
      true,
    );
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "CARD_TERMINAL",
        paymentDue: true,
      }),
      true,
    );
  });

  it("hides the warning after mark as paid or for non-studio methods", () => {
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "SUCCEEDED",
        paymentMethod: "CASH",
        paymentDue: true,
      }),
      false,
    );
    assert.equal(
      shouldShowStudioPackagePaymentDue({
        paymentStatus: "PENDING",
        paymentMethod: "INFLUENCER",
        paymentDue: true,
      }),
      false,
    );
  });
});
