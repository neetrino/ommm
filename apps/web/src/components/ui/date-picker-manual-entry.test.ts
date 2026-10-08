import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dateSegmentsFromIso,
  dateSegmentsFromPastedText,
  dateSegmentsToIso,
  replaceDateSegment,
} from "./date-picker-manual-entry";

describe("date picker manual segments", () => {
  it("keeps day and year when a month digit is deleted", () => {
    const segments = dateSegmentsFromIso("2026-10-18");
    const next = replaceDateSegment(segments, "month", "1");
    assert.deepEqual(next, { day: "18", month: "1", year: "2026" });
  });

  it("keeps month and year when a day digit is deleted", () => {
    const segments = dateSegmentsFromIso("2026-08-20");
    const next = replaceDateSegment(segments, "day", "2");
    assert.deepEqual(next, { day: "2", month: "08", year: "2026" });
  });

  it("commits a single remaining digit without shifting the other parts", () => {
    assert.equal(
      dateSegmentsToIso({ day: "18", month: "1", year: "2026" }),
      "2026-01-18",
    );
  });

  it("leaves an incomplete date uncommitted", () => {
    assert.equal(
      dateSegmentsToIso({ day: "18", month: "10", year: "202" }),
      null,
    );
  });

  it("clears the date only when every part is empty", () => {
    assert.equal(dateSegmentsToIso({ day: "", month: "", year: "" }), "");
  });

  it("parses a pasted display date into separate parts", () => {
    assert.deepEqual(dateSegmentsFromPastedText("20/08/2026"), {
      day: "20",
      month: "08",
      year: "2026",
    });
  });
});
