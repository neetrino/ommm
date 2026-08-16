export const SESSION_REVIEWS_REFRESH_EVENT = "ommm:session-reviews-refresh";
export const SESSION_REVIEW_OPEN_EVENT = "ommm:session-review-open";

export function dispatchSessionReviewsRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(SESSION_REVIEWS_REFRESH_EVENT));
}

export function dispatchSessionReviewOpen(reviewId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(SESSION_REVIEW_OPEN_EVENT, { detail: { reviewId } }),
  );
}
