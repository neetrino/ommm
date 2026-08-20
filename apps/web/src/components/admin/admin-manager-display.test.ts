import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { managerAccessKind } from "./admin-manager-display";

describe("managerAccessKind", () => {
  it("returns blocked first", () => {
    assert.equal(
      managerAccessKind({ isBlocked: true, invitePending: true }),
      "blocked",
    );
  });

  it("returns invited when password is not set", () => {
    assert.equal(
      managerAccessKind({ isBlocked: false, invitePending: true }),
      "invited",
    );
  });

  it("returns active for signed-in managers", () => {
    assert.equal(
      managerAccessKind({ isBlocked: false, invitePending: false }),
      "active",
    );
  });
});
