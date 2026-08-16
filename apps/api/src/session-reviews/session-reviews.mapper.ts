import type { Role, SessionReview, User } from '@prisma/client';

export type SessionReviewSessionSlice = {
  startsAt: Date;
  endsAt: Date;
  title: string;
  classType: { name: string };
  coach: {
    user: { name: string | null; lastName: string | null };
  };
};

export type SessionReviewWithSession = SessionReview & {
  session: SessionReviewSessionSlice;
  author: Pick<User, 'id' | 'name' | 'lastName' | 'email'>;
};

export type MemberPendingReviewDto = {
  id: string;
  classTypeName: string;
  sessionTitle: string;
  startsAt: string;
  endsAt: string;
  coachName: string;
};

export type StaffInboxReviewDto = {
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

export type CoachInboxReviewDto = {
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

export function formatPersonName(
  name: string | null,
  lastName: string | null,
): string {
  return [name, lastName].filter(Boolean).join(' ').trim();
}

export function toMemberPendingDto(
  row: SessionReviewWithSession,
): MemberPendingReviewDto {
  return {
    id: row.id,
    classTypeName: row.session.classType.name,
    sessionTitle: row.session.title,
    startsAt: row.session.startsAt.toISOString(),
    endsAt: row.session.endsAt.toISOString(),
    coachName: formatPersonName(
      row.session.coach.user.name,
      row.session.coach.user.lastName,
    ),
  };
}

export function toStaffInboxDto(row: SessionReviewWithSession): StaffInboxReviewDto {
  return {
    id: row.id,
    classTypeName: row.session.classType.name,
    sessionTitle: row.session.title,
    startsAt: row.session.startsAt.toISOString(),
    endsAt: row.session.endsAt.toISOString(),
    coachName: formatPersonName(
      row.session.coach.user.name,
      row.session.coach.user.lastName,
    ),
    rating: row.rating ?? 0,
    comment: row.comment,
    isAnonymous: row.isAnonymous,
    author: {
      id: row.author.id,
      displayName: formatPersonName(row.author.name, row.author.lastName) || row.author.email,
    },
    submittedAt: row.submittedAt?.toISOString() ?? row.updatedAt.toISOString(),
    staffReadAt: row.staffReadAt?.toISOString() ?? null,
  };
}

export function toCoachInboxDto(row: SessionReviewWithSession): CoachInboxReviewDto {
  return {
    id: row.id,
    classTypeName: row.session.classType.name,
    sessionTitle: row.session.title,
    startsAt: row.session.startsAt.toISOString(),
    endsAt: row.session.endsAt.toISOString(),
    rating: row.rating ?? 0,
    comment: row.comment,
    author: {
      displayName: formatPersonName(row.author.name, row.author.lastName),
    },
    submittedAt: row.submittedAt?.toISOString() ?? row.updatedAt.toISOString(),
  };
}

export function canRoleSeeAnonymousReviews(role: Role): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}
