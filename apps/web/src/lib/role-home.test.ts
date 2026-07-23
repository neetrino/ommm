import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { homePathForRole, MANAGER_HOME_PATH } from "./role-home";

describe("role-home manager", () => {
  it("MANAGER_HOME_PATH is dashboard", () => {
    assert.equal(MANAGER_HOME_PATH, "/manager/dashboard");
    assert.equal(homePathForRole("MANAGER"), "/manager/dashboard");
  });
});
