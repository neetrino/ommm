import { SESSION_REVIEW_HEADER_PREVIEW } from "@/lib/session-reviews-types";

export function sessionReviewsInboxQuery(take: number, offset = 0): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  return params.toString();
}

export function sessionReviewsHeaderInboxPath(audience: "staff" | "coach"): string {
  const query = sessionReviewsInboxQuery(SESSION_REVIEW_HEADER_PREVIEW, 0);
  if (audience === "staff") {
    return `/session-reviews/inbox?${query}`;
  }
  return `/session-reviews/coach?${query}`;
}
