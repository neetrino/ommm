import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_CLIENTS_LIST_PAGE_SIZE,
  ADMIN_CLIENTS_SPHERE_PAGE_SIZE,
  buildAdminClientsFilterQuery,
  mergeAdminClientsUrlQuery,
  parseAdminClientsListPageParams,
} from "./admin-clients-query";

describe("parseAdminClientsListPageParams", () => {
  it("uses the compact list page size by default", () => {
    const page = parseAdminClientsListPageParams({});
    assert.equal(page.pageSize, ADMIN_CLIENTS_LIST_PAGE_SIZE);
    assert.equal(page.take, ADMIN_CLIENTS_LIST_PAGE_SIZE);
  });

  it("loads a denser page for sphere view", () => {
    const page = parseAdminClientsListPageParams({ view: "sphere" });
    assert.equal(page.pageSize, ADMIN_CLIENTS_SPHERE_PAGE_SIZE);
    assert.equal(page.take, ADMIN_CLIENTS_SPHERE_PAGE_SIZE);
    assert.equal(page.offset, 0);
  });
});

describe("mergeAdminClientsUrlQuery", () => {
  it("keeps the drawer and view keys when filters change", () => {
    const merged = mergeAdminClientsUrlQuery(
      "tag=influencer",
      "tag=vip&page=2&view=sphere&viewClient=abc",
    );
    const params = new URLSearchParams(merged);
    assert.equal(params.get("tag"), "influencer");
    assert.equal(params.get("view"), "sphere");
    assert.equal(params.get("viewClient"), "abc");
  });

  it("drops page so a filter never keeps an empty later page", () => {
    const merged = mergeAdminClientsUrlQuery("tag=influencer", "page=2&pageSize=10");
    const params = new URLSearchParams(merged);
    assert.equal(params.get("page"), null);
    assert.equal(params.get("pageSize"), "10");
  });
});

describe("buildAdminClientsFilterQuery", () => {
  it("omits empty values and the default newest order", () => {
    assert.equal(
      buildAdminClientsFilterQuery({ tag: "influencer", order: "newest", search: "" }),
      "tag=influencer",
    );
  });
});
