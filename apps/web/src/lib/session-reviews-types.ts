export type MemberPendingReview = {
  id: string;
  classTypeName: string;
  sessionTitle: string;
  startsAt: string;
  endsAt: string;
  coachName: string;
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
  author: { id: string; displayName: string };
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
