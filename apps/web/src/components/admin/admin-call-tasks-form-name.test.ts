import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { joinContactName, splitContactName } from "./admin-call-tasks-form-name";

describe("splitContactName", () => {
  it("splits first token as name and the rest as surname", () => {
    assert.deepEqual(splitContactName("Ani Hakobyan"), {
      firstName: "Ani",
      lastName: "Hakobyan",
    });
    assert.deepEqual(splitContactName("Nare Petrosyan Extra"), {
      firstName: "Nare",
      lastName: "Petrosyan Extra",
    });
  });

  it("keeps a single token as name", () => {
    assert.deepEqual(splitContactName("Ani"), { firstName: "Ani", lastName: "" });
  });
});

describe("joinContactName", () => {
  it("joins name and surname", () => {
    assert.equal(joinContactName("Ani", "Hakobyan"), "Ani Hakobyan");
  });
});
