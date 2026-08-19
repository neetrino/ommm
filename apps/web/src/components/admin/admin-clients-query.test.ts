import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_CLIENTS_LIST_PAGE_SIZE,
  ADMIN_CLIENTS_SPHERE_PAGE_SIZE,
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
