import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEhdmReceiptFileName,
  isUserShareCancel,
} from "./save-ehdm-receipt";

describe("save-ehdm-receipt", () => {
  it("builds a stable PNG filename from the payment reference", () => {
    assert.equal(
      buildEhdmReceiptFileName("PACKAGE-2818A5C8575F"),
      "Ommm-receipt-PACKAGE-2818A5C8575F.png",
    );
  });

  it("strips unsafe characters and falls back without a reference", () => {
    assert.equal(
      buildEhdmReceiptFileName("  pkg/one  two  "),
      "Ommm-receipt-pkg-one-two.png",
    );
    assert.equal(buildEhdmReceiptFileName(null), "Ommm-receipt-fiscal.png");
    assert.equal(buildEhdmReceiptFileName("   "), "Ommm-receipt-fiscal.png");
  });

  it("treats a dismissed share sheet as a user cancel", () => {
    assert.equal(isUserShareCancel(new DOMException("Dismissed", "AbortError")), true);
    assert.equal(isUserShareCancel(new Error("capture failed")), false);
  });
});
