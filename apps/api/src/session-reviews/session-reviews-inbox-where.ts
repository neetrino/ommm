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
  return {
    status: SessionReviewStatus.SUBMITTED,
    ...ratingWhere(query.rating),
    ...visibilityWhere(query.visibility),
    ...coachWhere(query.coachId),
    ...packageWhere(query.packagePlanId),
    ...searchWhere(query.q),
  };
}

export function buildCoachInboxWhere(
  coachProfileId: string,
  query: ListSessionReviewsInboxQueryDto,
): Prisma.SessionReviewWhereInput {
  return {
    status: SessionReviewStatus.SUBMITTED,
    isAnonymous: false,
    coachProfileId,
    ...ratingWhere(query.rating),
    ...packageWhere(query.packagePlanId),
    ...searchWhere(query.q),
  };
}

function ratingWhere(
  rating: ListSessionReviewsInboxQueryDto['rating'],
): Prisma.SessionReviewWhereInput {
  if (!rating) {
    return {};
  }
  return { rating: Number.parseInt(rating, 10) };
}

function visibilityWhere(
  visibility: ListSessionReviewsInboxQueryDto['visibility'],
): Prisma.SessionReviewWhereInput {
  if (visibility === 'named') {
    return { isAnonymous: false };
  }
  if (visibility === 'anonymous') {
    return { isAnonymous: true };
  }
  return {};
}

function coachWhere(
  coachId: string | undefined,
): Prisma.SessionReviewWhereInput {
  const id = coachId?.trim();
  if (!id) {
    return {};
  }
  return { coachProfileId: id };
}

function packageWhere(
  packagePlanId: string | undefined,
): Prisma.SessionReviewWhereInput {
  const id = packagePlanId?.trim();
  if (!id) {
    return {};
  }
  return {
    booking: {
      consumptions: {
        some: {
          userPackage: {
            OR: [{ planId: id }, { sourcePlanIdSnapshot: id }],
          },
        },
      },
    },
  };
}

function searchWhere(raw: string | undefined): Prisma.SessionReviewWhereInput {
  return (
    buildTokenAndWhere(
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
    ) ?? {}
  );
}
