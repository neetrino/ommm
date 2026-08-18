import { isSessionReviewAutoPromptPath } from "@/lib/is-session-review-auto-prompt-path";
import { pickLatestMemberPendingReview } from "@/lib/pick-latest-member-pending-review";
import { hasAutoPromptedForEndsAt } from "@/lib/session-review-auto-prompt-storage";
import { isSessionReviewLater } from "@/lib/session-review-later-storage";
import type { MemberPendingReview } from "@/lib/session-reviews-types";

type SessionReviewOpenDetail = {
  reviewId?: string;
  review?: MemberPendingReview;
};

export function reviewFromOpenEventDetail(
  detail: SessionReviewOpenDetail,
  items: readonly MemberPendingReview[],
): MemberPendingReview | null {
  if (detail.review && typeof detail.review.id === "string") {
    return detail.review;
  }
  if (typeof detail.reviewId === "string") {
    return items.find((row) => row.id === detail.reviewId) ?? null;
  }
  return null;
}

export function selectAutoPromptReview(params: {
  deferAutoPrompt: boolean;
  openedFromEvent: MemberPendingReview | null;
  pathname: string;
  items: readonly MemberPendingReview[];
  suppressedIds: ReadonlySet<string>;
}): MemberPendingReview | null {
  if (
    params.deferAutoPrompt ||
    params.openedFromEvent !== null ||
    !isSessionReviewAutoPromptPath(params.pathname)
  ) {
    return null;
  }
  const latest = pickLatestMemberPendingReview(params.items);
  if (latest === null) {
    return null;
  }
  if (
    params.suppressedIds.has(latest.id) ||
    isSessionReviewLater(latest.id) ||
    hasAutoPromptedForEndsAt(latest.endsAt)
  ) {
    return null;
  }
  return latest;
}
