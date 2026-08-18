import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  reviewFromOpenEventDetail,
  selectAutoPromptReview,
} from "./session-review-prompt-gate.helpers";
import type { MemberPendingReview } from "@/lib/session-reviews-types";

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

const older = review("old", "2026-08-10T10:00:00.000Z", "2026-08-10T11:00:00.000Z");
const newest = review("new", "2026-08-17T10:00:00.000Z", "2026-08-17T11:00:00.000Z");

describe("selectAutoPromptReview", () => {
  it("does not auto-prompt on marketing home", () => {
    assert.equal(
      selectAutoPromptReview({
        deferAutoPrompt: false,
        openedFromEvent: null,
        pathname: "/",
        items: [older, newest],
        suppressedIds: new Set(),
      }),
      null,
    );
  });

  it("auto-prompts only the latest booking on the member hub", () => {
    assert.equal(
      selectAutoPromptReview({
        deferAutoPrompt: false,
        openedFromEvent: null,
        pathname: "/user",
        items: [older, newest],
        suppressedIds: new Set(),
      }),
      newest,
    );
  });

  it("does not fall through to older bookings when the latest is suppressed", () => {
    assert.equal(
      selectAutoPromptReview({
        deferAutoPrompt: false,
        openedFromEvent: null,
        pathname: "/user",
        items: [older, newest],
        suppressedIds: new Set(["new"]),
      }),
      null,
    );
  });
});

describe("reviewFromOpenEventDetail", () => {
  it("prefers the embedded review payload", () => {
    assert.equal(
      reviewFromOpenEventDetail({ review: older, reviewId: newest.id }, [newest]),
      older,
    );
  });
});
