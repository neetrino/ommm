import { SESSION_REVIEW_HEADER_PREVIEW } from "@/lib/session-reviews-types";
import {
  SESSION_REVIEW_RATING_QUERY_KEY,
  SESSION_REVIEW_SEARCH_QUERY_KEY,
  SESSION_REVIEW_VISIBILITY_QUERY_KEY,
  type SessionReviewRatingFilter,
  type SessionReviewVisibilityFilter,
} from "@/lib/session-reviews-inbox-filters";

export function sessionReviewsInboxQuery(
  take: number,
  offset = 0,
  filters?: {
    q?: string;
    rating?: SessionReviewRatingFilter | "";
    visibility?: SessionReviewVisibilityFilter | "";
  },
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  const q = filters?.q?.trim();
  if (q) {
    params.set(SESSION_REVIEW_SEARCH_QUERY_KEY, q);
  }
  if (filters?.rating) {
    params.set(SESSION_REVIEW_RATING_QUERY_KEY, filters.rating);
  }
  if (filters?.visibility) {
    params.set(SESSION_REVIEW_VISIBILITY_QUERY_KEY, filters.visibility);
  }
  return params.toString();
}

export function sessionReviewsHeaderInboxPath(audience: "staff" | "coach"): string {
  const query = sessionReviewsInboxQuery(SESSION_REVIEW_HEADER_PREVIEW, 0);
  if (audience === "staff") {
    return `/session-reviews/inbox?${query}`;
  }
  return `/session-reviews/coach?${query}`;
}
