import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickLatestMemberPendingReview } from "./pick-latest-member-pending-review";
import type { MemberPendingReview } from "./session-reviews-types";

function review(
  id: string,
  startsAt: string,
  endsAt: string,
): MemberPendingReview {
  return {
    id,
    classTypeName: "Mat",
    sessionTitle: "Mat",
    startsAt,
    endsAt,
    coachName: "Ada",
  };
}

describe("pickLatestMemberPendingReview", () => {
  it("returns null for an empty list", () => {
    assert.equal(pickLatestMemberPendingReview([]), null);
  });

  it("returns the only pending review", () => {
    const only = review("a", "2026-08-01T10:00:00.000Z", "2026-08-01T11:00:00.000Z");
    assert.equal(pickLatestMemberPendingReview([only]), only);
  });

  it("picks the latest session by endsAt, not list order", () => {
    const older = review("old", "2026-08-10T10:00:00.000Z", "2026-08-10T11:00:00.000Z");
    const newest = review("new", "2026-08-17T10:00:00.000Z", "2026-08-17T11:00:00.000Z");
    const mid = review("mid", "2026-08-14T10:00:00.000Z", "2026-08-14T11:00:00.000Z");
    assert.equal(pickLatestMemberPendingReview([older, newest, mid]), newest);
  });

  it("breaks ties with startsAt", () => {
    const earlierStart = review(
      "a",
      "2026-08-17T09:00:00.000Z",
      "2026-08-17T11:00:00.000Z",
    );
    const laterStart = review(
      "b",
      "2026-08-17T10:00:00.000Z",
      "2026-08-17T11:00:00.000Z",
    );
    assert.equal(
      pickLatestMemberPendingReview([earlierStart, laterStart]),
      laterStart,
    );
  });
});
