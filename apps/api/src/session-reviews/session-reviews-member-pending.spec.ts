import { BookingStatus, SessionReviewStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { SESSION_REVIEW_MEMBER_LIST_TAKE } from './session-reviews.constants';
import { syncMemberPendingReviews } from './session-reviews-member-pending';

const USER_ID = 'user-1';
const NOW = new Date('2026-09-22T12:00:00.000Z');

type ReviewableRow = {
  id: string;
  sessionReview: { id: string } | null;
  session: {
    id: string;
    coachId: string;
    substituteCoachId: string | null;
  };
};

type PendingDb = Pick<PrismaService, 'booking' | 'sessionReview'>;

function booking(
  id: string,
  reviewId: string | null,
  coachId = 'coach-1',
  substituteCoachId: string | null = null,
): ReviewableRow {
  return {
    id,
    sessionReview: reviewId === null ? null : { id: reviewId },
    session: { id: `session-${id}`, coachId, substituteCoachId },
  };
}

function createDb(reviewable: ReviewableRow[], latestEndsAt: Date | null) {
  const findMany = jest.fn().mockResolvedValue(reviewable);
  const findFirst = jest
    .fn()
    .mockResolvedValue(
      latestEndsAt === null ? null : { session: { endsAt: latestEndsAt } },
    );
  const updateMany = jest.fn().mockResolvedValue({ count: 1 });
  const createMany = jest.fn().mockResolvedValue({ count: 1 });
  const db = {
    booking: { findMany, findFirst },
    sessionReview: { updateMany, createMany },
  } as unknown as PendingDb;
  return { db, findMany, findFirst, updateMany, createMany };
}

describe('syncMemberPendingReviews', () => {
  it('asks only for ended completed classes that are missing, expired, or dismissed', async () => {
    const { db, findMany, findFirst } = createDb([], null);

    await syncMemberPendingReviews(db, USER_ID, NOW);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        status: BookingStatus.COMPLETED,
        session: { endsAt: { lte: NOW } },
        OR: [
          { sessionReview: { is: null } },
          {
            sessionReview: {
              is: {
                status: {
                  in: [
                    SessionReviewStatus.EXPIRED,
                    SessionReviewStatus.DISMISSED,
                  ],
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        sessionReview: { select: { id: true } },
        session: {
          select: { id: true, coachId: true, substituteCoachId: true },
        },
      },
      orderBy: { session: { endsAt: 'desc' } },
      take: SESSION_REVIEW_MEMBER_LIST_TAKE,
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        status: BookingStatus.COMPLETED,
        session: { endsAt: { lte: NOW } },
      },
      orderBy: { session: { endsAt: 'desc' } },
      select: { session: { select: { endsAt: true } } },
    });
  });

  it('creates a pending review for a completed class that has none', async () => {
    const row = booking('booking-1', null);
    const { db, updateMany, createMany } = createDb([row], NOW);

    await syncMemberPendingReviews(db, USER_ID, NOW);

    expect(updateMany).not.toHaveBeenCalled();
    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          bookingId: 'booking-1',
          authorUserId: USER_ID,
          sessionId: 'session-booking-1',
          coachProfileId: 'coach-1',
        },
      ],
      skipDuplicates: true,
    });
  });

  it('attributes the review to the substitute coach when one is assigned', async () => {
    const row = booking('booking-2', null, 'coach-primary', 'coach-sub');
    const { db, createMany } = createDb([row], NOW);

    await syncMemberPendingReviews(db, USER_ID, NOW);

    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          bookingId: 'booking-2',
          authorUserId: USER_ID,
          sessionId: 'session-booking-2',
          coachProfileId: 'coach-sub',
        },
      ],
      skipDuplicates: true,
    });
  });

  it('reopens expired and dismissed reviews and does not create a second row', async () => {
    const expired = booking('booking-expired', 'review-expired');
    const dismissed = booking('booking-dismissed', 'review-dismissed');
    const { db, updateMany, createMany } = createDb([expired, dismissed], NOW);

    await syncMemberPendingReviews(db, USER_ID, NOW);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['review-expired', 'review-dismissed'] } },
      data: { status: SessionReviewStatus.PENDING },
    });
    expect(createMany).not.toHaveBeenCalled();
  });

  it('creates missing rows and reopens closed rows in the same pass', async () => {
    const missing = booking('booking-new', null);
    const expired = booking('booking-old', 'review-old');
    const { db, updateMany, createMany } = createDb([missing, expired], NOW);

    await syncMemberPendingReviews(db, USER_ID, NOW);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['review-old'] } },
      data: { status: SessionReviewStatus.PENDING },
    });
    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          bookingId: 'booking-new',
          authorUserId: USER_ID,
          sessionId: 'session-booking-new',
          coachProfileId: 'coach-1',
        },
      ],
      skipDuplicates: true,
    });
  });

  it('does not write when every completed class already has an open or submitted review', async () => {
    const { db, updateMany, createMany } = createDb([], NOW);

    const latest = await syncMemberPendingReviews(db, USER_ID, NOW);

    expect(updateMany).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
    expect(latest).toBe(NOW.toISOString());
  });

  it('returns null when the member has no completed class', async () => {
    const { db } = createDb([], null);

    await expect(
      syncMemberPendingReviews(db, USER_ID, NOW),
    ).resolves.toBeNull();
  });
});
