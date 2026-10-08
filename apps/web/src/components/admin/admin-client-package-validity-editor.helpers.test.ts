import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  toValidityDateInputValue,
  validityDateToPeriodEndIso,
  validityDateToPeriodStartIso,
} from "./admin-client-package-validity-editor.helpers";

describe("package validity studio dates", () => {
  it("keeps the selected expiration day in Yerevan", () => {
    const stored = validityDateToPeriodEndIso("2026-10-18");
    assert.equal(stored, "2026-10-18T19:59:59.999Z");
    assert.equal(toValidityDateInputValue(stored), "2026-10-18");
  });

  it("starts the activation day at Yerevan midnight", () => {
    const stored = validityDateToPeriodStartIso("2026-08-20");
    assert.equal(stored, "2026-08-19T20:00:00.000Z");
    assert.equal(toValidityDateInputValue(stored), "2026-08-20");
  });

  it("shows a UTC end-of-day instant on the next studio day", () => {
    assert.equal(
      toValidityDateInputValue("2026-10-18T23:59:59.999Z"),
      "2026-10-19",
    );
  });
});
