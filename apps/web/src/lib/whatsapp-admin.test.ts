import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWhatsappConnected } from "./whatsapp-admin";

describe("whatsapp-admin", () => {
  it("treats only CONNECTED as a paired session", () => {
    assert.equal(isWhatsappConnected("CONNECTED"), true);
    assert.equal(isWhatsappConnected("QR"), false);
    assert.equal(isWhatsappConnected(null), false);
  });
});
