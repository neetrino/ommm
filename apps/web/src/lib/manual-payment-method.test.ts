import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PACKAGE_SUBSCRIBE_PAYMENT_METHODS } from "./manual-payment-method";

describe("manual-payment-method", () => {
  it("keeps member subscribe on online card only", () => {
    assert.deepEqual(PACKAGE_SUBSCRIBE_PAYMENT_METHODS, ["CARD"]);
  });
});
