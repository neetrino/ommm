import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { markAutoPromptedEndsAt } from "@/lib/session-review-auto-prompt-storage";
import { markSessionReviewLater } from "@/lib/session-review-later-storage";
import type { MemberPendingReview } from "@/lib/session-reviews-types";
import {
  reviewFromOpenEventDetail,
  selectAutoPromptReview,
} from "./session-review-prompt-gate.helpers";

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
const memory = new Map<string, string>();

function promptParams(
  overrides: Partial<Parameters<typeof selectAutoPromptReview>[0]> = {},
) {
  return {
    deferAutoPrompt: false,
    openedFromEvent: null,
    pathname: "/user",
    items: [older, newest],
    suppressedIds: new Set<string>(),
    latestCompletedEndsAt: newest.endsAt,
    ...overrides,
  };
}

beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    },
  });
});

describe("selectAutoPromptReview", () => {
  it("does not auto-prompt on marketing home", () => {
    assert.equal(
      selectAutoPromptReview({
        deferAutoPrompt: false,
        openedFromEvent: null,
        pathname: "/",
        items: [older, newest],
        suppressedIds: new Set(),
        latestCompletedEndsAt: newest.endsAt,
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
        latestCompletedEndsAt: newest.endsAt,
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
        latestCompletedEndsAt: newest.endsAt,
      }),
      null,
    );
  });

  it("does not prompt an older class when the latest completed class is already reviewed", () => {
    assert.equal(
      selectAutoPromptReview(promptParams({
        items: [older],
        latestCompletedEndsAt: newest.endsAt,
      })),
      null,
    );
  });

  it("waits while the phone gate is open", () => {
    assert.equal(selectAutoPromptReview(promptParams({ deferAutoPrompt: true })), null);
  });

  it("does not auto-prompt while the member already opened a class from the star", () => {
    assert.equal(
      selectAutoPromptReview(promptParams({ openedFromEvent: older })),
      null,
    );
  });

  it("prompts on the reviews page and a locale-prefixed hub", () => {
    assert.equal(
      selectAutoPromptReview(promptParams({ pathname: "/user/reviews" })),
      newest,
    );
    assert.equal(
      selectAutoPromptReview(promptParams({ pathname: "/hy/user" })),
      newest,
    );
  });

  it("does not prompt on bookings, profile, or when nothing is waiting", () => {
    assert.equal(selectAutoPromptReview(promptParams({ pathname: "/user/bookings" })), null);
    assert.equal(selectAutoPromptReview(promptParams({ pathname: "/user/profile" })), null);
    assert.equal(selectAutoPromptReview(promptParams({ items: [] })), null);
    assert.equal(selectAutoPromptReview(promptParams({ latestCompletedEndsAt: null })), null);
  });

  it("stays closed for the rest of the browser session after later or dismiss", () => {
    markSessionReviewLater(newest.id);
    assert.equal(selectAutoPromptReview(promptParams()), null);
    memory.clear();
    markAutoPromptedEndsAt(newest.endsAt);
    assert.equal(selectAutoPromptReview(promptParams()), null);
  });

  it("prompts again when a newer class ends after the member already closed an older one", () => {
    markAutoPromptedEndsAt(older.endsAt);
    assert.equal(selectAutoPromptReview(promptParams()), newest);
  });
});

describe("reviewFromOpenEventDetail", () => {
  it("prefers the embedded review payload", () => {
    assert.equal(
      reviewFromOpenEventDetail({ review: older, reviewId: newest.id }, [newest]),
      older,
    );
  });

  it("opens the class the member picked from the star list", () => {
    assert.equal(
      reviewFromOpenEventDetail({ reviewId: older.id }, [newest, older]),
      older,
    );
  });

  it("ignores a star click for a class that is no longer reviewable", () => {
    assert.equal(reviewFromOpenEventDetail({ reviewId: "missing" }, [newest]), null);
    assert.equal(reviewFromOpenEventDetail({}, [newest]), null);
  });
});
