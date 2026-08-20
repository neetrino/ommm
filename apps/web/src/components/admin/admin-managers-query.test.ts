import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAdminManagersListEndpoint,
  pickAdminManagersFilters,
} from "./admin-managers-query";

describe("admin-managers-query", () => {
  it("omits default status and order from the API endpoint", () => {
    const endpoint = buildAdminManagersListEndpoint(
      { q: "", status: "all", order: "newest" },
      25,
      0,
    );
    assert.equal(endpoint, "/managers?take=25&offset=0");
  });

  it("includes search, blocked status, and oldest order", () => {
    const endpoint = buildAdminManagersListEndpoint(
      { q: "Gor", status: "blocked", order: "oldest" },
      25,
      25,
    );
    assert.equal(
      endpoint,
      "/managers?take=25&offset=25&q=Gor&status=blocked&order=oldest",
    );
  });

  it("parses unknown status back to all", () => {
    const filters = pickAdminManagersFilters({
      q: "  Ani  ",
      status: "maybe",
      order: "oldest",
    });
    assert.deepEqual(filters, {
      q: "Ani",
      status: "all",
      order: "oldest",
    });
  });
});
