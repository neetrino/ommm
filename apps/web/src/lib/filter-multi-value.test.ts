import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatFilterMultiChipLabel,
  matchesFilterMultiValue,
  parseFilterMultiValue,
  serializeFilterMultiValue,
} from "./filter-multi-value";

describe("parseFilterMultiValue", () => {
  it("treats empty and all as no selection", () => {
    assert.deepEqual(parseFilterMultiValue(""), []);
    assert.deepEqual(parseFilterMultiValue("all"), []);
    assert.deepEqual(parseFilterMultiValue(undefined), []);
  });

  it("splits a csv list", () => {
    assert.deepEqual(parseFilterMultiValue("active,inactive"), ["active", "inactive"]);
  });
});

describe("serializeFilterMultiValue", () => {
  it("joins values and drops all", () => {
    assert.equal(serializeFilterMultiValue(["active", "all", "inactive"]), "active,inactive");
  });
});

describe("matchesFilterMultiValue", () => {
  it("allows any row when nothing is selected", () => {
    assert.equal(matchesFilterMultiValue("", "active"), true);
  });

  it("requires membership when values are selected", () => {
    assert.equal(matchesFilterMultiValue("active,frozen", "active"), true);
    assert.equal(matchesFilterMultiValue("active,frozen", "blocked"), false);
  });
});

describe("formatFilterMultiChipLabel", () => {
  it("returns null for empty selection", () => {
    assert.equal(formatFilterMultiChipLabel("Status", ""), null);
  });

  it("labels one or many selections", () => {
    assert.equal(
      formatFilterMultiChipLabel("Status", "active", [{ value: "active", label: "Active" }]),
      "Status: Active",
    );
    assert.equal(formatFilterMultiChipLabel("Status", "active,inactive"), "Status: 2 selected");
  });
});
