import type { CoachInboxReview, StaffInboxReview } from "@/lib/session-reviews-types";

export function sessionReviewAuthorLabel(
  row: StaffInboxReview | CoachInboxReview,
  anonymousLabel: string,
): string {
  if ("isAnonymous" in row && row.isAnonymous) {
    return anonymousLabel;
  }
  if ("author" in row && row.author !== null) {
    return row.author.displayName;
  }
  return anonymousLabel;
}
