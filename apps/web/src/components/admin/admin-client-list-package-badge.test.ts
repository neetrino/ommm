import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveClientListPackageDisplay } from "./admin-client-list-package-badge";

describe("resolveClientListPackageDisplay", () => {
  it("returns none when client has no package", () => {
    assert.deepEqual(
      resolveClientListPackageDisplay({
        activePackageId: null,
        activePackageStatus: null,
        activePlanName: null,
      }),
      { tone: "none", planName: null },
    );
  });

  it("maps active and expired statuses", () => {
    assert.equal(
      resolveClientListPackageDisplay({
        activePackageId: "p1",
        activePackageStatus: "ACTIVE",
        activePlanName: "Reformer 8",
      }).tone,
      "active",
    );
    assert.equal(
      resolveClientListPackageDisplay({
        activePackageId: "p2",
        activePackageStatus: "EXPIRED",
        activePlanName: "Reformer 8",
      }).tone,
      "expired",
    );
  });
});
