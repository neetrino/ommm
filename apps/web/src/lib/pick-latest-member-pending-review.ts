import type { MemberPendingReview } from "@/lib/session-reviews-types";

/**
 * Newest completed session among pending review prompts (`endsAt`, then `startsAt`).
 */
export function pickLatestMemberPendingReview(
  items: readonly MemberPendingReview[],
): MemberPendingReview | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((latest, row) => {
    if (row.endsAt > latest.endsAt) {
      return row;
    }
    if (row.endsAt === latest.endsAt && row.startsAt > latest.startsAt) {
      return row;
    }
    return latest;
  });
}
