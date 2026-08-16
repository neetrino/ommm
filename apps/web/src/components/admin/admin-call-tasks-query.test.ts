import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCallTasksListEndpoint,
  parseCallTaskListStatus,
} from "./admin-call-tasks-query";

describe("parseCallTaskListStatus", () => {
  it("defaults missing or empty to PENDING", () => {
    assert.equal(parseCallTaskListStatus(undefined), "PENDING");
    assert.equal(parseCallTaskListStatus(""), "PENDING");
  });

  it("maps all to an empty API status", () => {
    assert.equal(parseCallTaskListStatus("all"), "");
  });

  it("keeps OVERDUE, DONE and CANCELLED", () => {
    assert.equal(parseCallTaskListStatus("OVERDUE"), "OVERDUE");
    assert.equal(parseCallTaskListStatus("DONE"), "DONE");
    assert.equal(parseCallTaskListStatus("CANCELLED"), "CANCELLED");
    assert.equal(parseCallTaskListStatus(["DONE"]), "DONE");
  });
});

describe("buildCallTasksListEndpoint", () => {
  it("omits status when listing all", () => {
    const url = buildCallTasksListEndpoint({ take: 20, offset: 0, status: "" });
    assert.equal(url.includes("status="), false);
  });

  it("sends OVERDUE when filtering overdue tasks", () => {
    const url = buildCallTasksListEndpoint({ take: 20, offset: 0, status: "OVERDUE" });
    assert.equal(url.includes("status=OVERDUE"), true);
  });
});
