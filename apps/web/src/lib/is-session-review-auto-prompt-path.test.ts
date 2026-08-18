import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSessionReviewAutoPromptPath } from "./is-session-review-auto-prompt-path";

describe("isSessionReviewAutoPromptPath", () => {
  it("allows member hub and reviews", () => {
    assert.equal(isSessionReviewAutoPromptPath("/user"), true);
    assert.equal(isSessionReviewAutoPromptPath("/en/user"), true);
    assert.equal(isSessionReviewAutoPromptPath("/user/reviews"), true);
    assert.equal(isSessionReviewAutoPromptPath("/hy/user/reviews"), true);
  });

  it("rejects marketing home and other account pages", () => {
    assert.equal(isSessionReviewAutoPromptPath("/"), false);
    assert.equal(isSessionReviewAutoPromptPath("/en"), false);
    assert.equal(isSessionReviewAutoPromptPath("/en/schedule"), false);
    assert.equal(isSessionReviewAutoPromptPath("/user/bookings"), false);
    assert.equal(isSessionReviewAutoPromptPath("/user/profile"), false);
  });
});
