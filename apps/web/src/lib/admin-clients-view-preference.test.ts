import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_ADMIN_CLIENTS_VIEW_MODE,
  parseAdminClientsViewMode,
} from "./admin-clients-view-preference";

describe("parseAdminClientsViewMode", () => {
  it("defaults to list when the query is missing", () => {
    assert.equal(parseAdminClientsViewMode(null), DEFAULT_ADMIN_CLIENTS_VIEW_MODE);
    assert.equal(parseAdminClientsViewMode(undefined), "list");
  });

  it("accepts list and sphere", () => {
    assert.equal(parseAdminClientsViewMode("list"), "list");
    assert.equal(parseAdminClientsViewMode("sphere"), "sphere");
  });

  it("falls back for unknown or array values", () => {
    assert.equal(parseAdminClientsViewMode("board"), "list");
    assert.equal(parseAdminClientsViewMode(["sphere"]), "sphere");
    assert.equal(parseAdminClientsViewMode(["nope", "sphere"]), "list");
  });
});
