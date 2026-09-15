import { parseFilterMultiValue } from "@/lib/filter-multi-value";

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

const RATING_VALUES = new Set<string>(SESSION_REVIEW_RATING_FILTERS);
const VISIBILITY_VALUES = new Set<string>(SESSION_REVIEW_VISIBILITY_FILTERS);

/** Empty or comma-separated rating values. */
export function parseSessionReviewRatingFilter(
  value: string | null | undefined,
): string {
  return parseFilterMultiValue(value)
    .filter((part) => RATING_VALUES.has(part))
    .join(",");
}

/** Empty or comma-separated visibility values. */
export function parseSessionReviewVisibilityFilter(
  value: string | null | undefined,
): string {
  return parseFilterMultiValue(value)
    .filter((part) => VISIBILITY_VALUES.has(part))
    .join(",");
}

/** Empty or comma-separated ids. */
export function parseSessionReviewIdFilter(
  value: string | null | undefined,
): string {
  return parseFilterMultiValue(value).join(",");
}
