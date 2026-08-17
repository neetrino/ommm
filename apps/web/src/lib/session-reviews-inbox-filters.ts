export const SESSION_REVIEW_SEARCH_QUERY_KEY = "q";
export const SESSION_REVIEW_RATING_QUERY_KEY = "rating";
export const SESSION_REVIEW_VISIBILITY_QUERY_KEY = "visibility";
export const SESSION_REVIEW_COACH_QUERY_KEY = "coachId";
export const SESSION_REVIEW_PACKAGE_QUERY_KEY = "packagePlanId";

export const SESSION_REVIEW_RATING_FILTER_KEY = "rating";
export const SESSION_REVIEW_VISIBILITY_FILTER_KEY = "visibility";
export const SESSION_REVIEW_COACH_FILTER_KEY = "coachId";
export const SESSION_REVIEW_PACKAGE_FILTER_KEY = "packagePlanId";

export const SESSION_REVIEW_RATING_FILTERS = ["1", "2", "3", "4", "5"] as const;
export type SessionReviewRatingFilter =
  (typeof SESSION_REVIEW_RATING_FILTERS)[number];

export const SESSION_REVIEW_VISIBILITY_FILTERS = ["named", "anonymous"] as const;
export type SessionReviewVisibilityFilter =
  (typeof SESSION_REVIEW_VISIBILITY_FILTERS)[number];

export type SessionReviewFilterOption = {
  id: string;
  name: string;
};

export type SessionReviewFilterOptionsPayload = {
  coaches: SessionReviewFilterOption[];
  packages: SessionReviewFilterOption[];
};

export function parseSessionReviewRatingFilter(
  value: string | null | undefined,
): SessionReviewRatingFilter | "" {
  if (
    value &&
    (SESSION_REVIEW_RATING_FILTERS as readonly string[]).includes(value)
  ) {
    return value as SessionReviewRatingFilter;
  }
  return "";
}

export function parseSessionReviewVisibilityFilter(
  value: string | null | undefined,
): SessionReviewVisibilityFilter | "" {
  if (
    value &&
    (SESSION_REVIEW_VISIBILITY_FILTERS as readonly string[]).includes(value)
  ) {
    return value as SessionReviewVisibilityFilter;
  }
  return "";
}

export function parseSessionReviewIdFilter(
  value: string | null | undefined,
): string {
  return value?.trim() ?? "";
}
