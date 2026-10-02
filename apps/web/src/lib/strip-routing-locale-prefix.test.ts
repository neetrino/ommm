import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stripRoutingLocalePrefix } from "./strip-routing-locale-prefix";

describe("stripRoutingLocalePrefix", () => {
  it("keeps a pathname that already has no locale", () => {
    assert.equal(stripRoutingLocalePrefix("/user"), "/user");
    assert.equal(stripRoutingLocalePrefix("/user/profile"), "/user/profile");
    assert.equal(stripRoutingLocalePrefix("/"), "/");
  });

  it("drops a stale locale prefix that no longer matches the active locale", () => {
    assert.equal(stripRoutingLocalePrefix("/en/user"), "/user");
    assert.equal(stripRoutingLocalePrefix("/ru/user/profile"), "/user/profile");
    assert.equal(stripRoutingLocalePrefix("/hy/user/gift-cards"), "/user/gift-cards");
  });

  it("drops a doubled locale prefix from a bad client navigation", () => {
    assert.equal(stripRoutingLocalePrefix("/en/en/user/gift-cards"), "/user/gift-cards");
    assert.equal(stripRoutingLocalePrefix("/ru/en/user"), "/user");
  });
});
