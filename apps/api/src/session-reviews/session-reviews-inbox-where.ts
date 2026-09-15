import { Prisma, SessionReviewStatus } from '@prisma/client';
import {
  buildTokenAndWhere,
  containsInsensitive,
  personNameContainsToken,
} from '../common/token-text-search';
import type { ListSessionReviewsInboxQueryDto } from './dto/list-session-reviews-inbox-query.dto';

export function buildStaffInboxWhere(
  query: ListSessionReviewsInboxQueryDto,
): Prisma.SessionReviewWhereInput {
  const and: Prisma.SessionReviewWhereInput[] = [
    { status: SessionReviewStatus.SUBMITTED },
  ];
  pushIfPresent(and, ratingWhere(query.rating));
  pushIfPresent(and, visibilityWhere(query.visibility));
  pushIfPresent(and, coachWhere(query.coachId));
  pushIfPresent(and, packageWhere(query.packagePlanId));
  pushIfPresent(and, searchWhere(query.q));
  return { AND: and };
}

export function buildCoachInboxWhere(
  coachProfileId: string,
  query: ListSessionReviewsInboxQueryDto,
): Prisma.SessionReviewWhereInput {
  const and: Prisma.SessionReviewWhereInput[] = [
    { status: SessionReviewStatus.SUBMITTED },
    { isAnonymous: false },
    { coachProfileId },
  ];
  pushIfPresent(and, ratingWhere(query.rating));
  pushIfPresent(and, packageWhere(query.packagePlanId));
  pushIfPresent(and, searchWhere(query.q));
  return { AND: and };
}

function pushIfPresent(
  and: Prisma.SessionReviewWhereInput[],
  clause: Prisma.SessionReviewWhereInput | undefined,
): void {
  if (clause && Object.keys(clause).length > 0) {
    and.push(clause);
  }
}

function ratingWhere(
  ratings: ListSessionReviewsInboxQueryDto['rating'],
): Prisma.SessionReviewWhereInput | undefined {
  if (!ratings?.length) {
    return undefined;
  }
  const values = ratings.map((rating) => Number.parseInt(rating, 10));
  return {
    rating: values.length === 1 ? values[0] : { in: values },
  };
}

function visibilityWhere(
  visibility: ListSessionReviewsInboxQueryDto['visibility'],
): Prisma.SessionReviewWhereInput | undefined {
  if (!visibility?.length) {
    return undefined;
  }
  const clauses: Prisma.SessionReviewWhereInput[] = [];
  if (visibility.includes('named')) {
    clauses.push({ isAnonymous: false });
  }
  if (visibility.includes('anonymous')) {
    clauses.push({ isAnonymous: true });
  }
  if (clauses.length === 0) {
    return undefined;
  }
  if (clauses.length === 1) {
    return clauses[0];
  }
  return { OR: clauses };
}

function coachWhere(
  coachIds: string[] | undefined,
): Prisma.SessionReviewWhereInput | undefined {
  const ids = (coachIds ?? []).map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) {
    return undefined;
  }
  return {
    coachProfileId: ids.length === 1 ? ids[0] : { in: ids },
  };
}

function packageWhere(
  packagePlanIds: string[] | undefined,
): Prisma.SessionReviewWhereInput | undefined {
  const ids = (packagePlanIds ?? []).map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) {
    return undefined;
  }
  const planClauses = ids.flatMap((id) => [
    { planId: id },
    { sourcePlanIdSnapshot: id },
  ]);
  return {
    booking: {
      consumptions: {
        some: {
          userPackage: {
            OR: planClauses,
          },
        },
      },
    },
  };
}

function searchWhere(
  raw: string | undefined,
): Prisma.SessionReviewWhereInput | undefined {
  return buildTokenAndWhere(
    raw,
    (token): Prisma.SessionReviewWhereInput => ({
      OR: [
        { comment: containsInsensitive(token) },
        {
          session: {
            classType: { name: containsInsensitive(token) },
          },
        },
        { coachProfile: { user: personNameContainsToken(token) } },
        {
          AND: [
            { isAnonymous: false },
            {
              author: {
                OR: [
                  { name: containsInsensitive(token) },
                  { lastName: containsInsensitive(token) },
                  { email: containsInsensitive(token) },
                ],
              },
            },
          ],
        },
      ],
    }),
  );
}
