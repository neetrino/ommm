export type MemberPendingReview = {
  id: string;
  classTypeName: string;
  sessionTitle: string;
  startsAt: string;
  endsAt: string;
  coachName: string;
};

export type MemberSubmittedReview = {
  id: string;
  classTypeName: string;
  sessionTitle: string;
  startsAt: string;
  endsAt: string;
  coachName: string;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  submittedAt: string;
};

export type StaffInboxReview = {
  id: string;
  classTypeName: string;
  sessionTitle: string;
  startsAt: string;
  endsAt: string;
  coachName: string;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  /** Null when the member chose Anonymous. */
  author: { id: string; displayName: string } | null;
  submittedAt: string;
  staffReadAt: string | null;
};

export type CoachInboxReview = {
  id: string;
  classTypeName: string;
  sessionTitle: string;
  startsAt: string;
  endsAt: string;
  rating: number;
  comment: string | null;
  author: { displayName: string };
  submittedAt: string;
};

export type SessionReviewsAudience = "member" | "staff" | "coach";

export const SESSION_REVIEW_HEADER_PREVIEW = 5;

/** Staff/coach reviews inbox page size (admin + manager). */
export const SESSION_REVIEW_INBOX_PAGE_TAKE = 15;

export type SessionReviewsListPayload<T> = {
  items: T[];
  total: number;
  take: number;
  offset: number;
};
