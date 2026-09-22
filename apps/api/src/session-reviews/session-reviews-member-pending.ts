import { BookingStatus, SessionReviewStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { SESSION_REVIEW_MEMBER_LIST_TAKE } from './session-reviews.constants';

type MemberPendingDb = Pick<PrismaService, 'booking' | 'sessionReview'>;

type ReviewableCompletedBooking = {
  id: string;
  sessionReview: { id: string } | null;
  session: {
    id: string;
    coachId: string;
    substituteCoachId: string | null;
  };
};

/** Opens a pending review for every completed class that does not have one yet. */
export async function syncMemberPendingReviews(
  db: MemberPendingDb,
  userId: string,
  now: Date,
): Promise<string | null> {
  const bookings = await findReviewableCompletedBookings(db, userId, now);
  await reopenClosedReviews(db, bookings);
  await createMissingReviews(db, userId, bookings);
  return latestCompletedEndsAt(db, userId, now);
}

async function latestCompletedEndsAt(
  db: MemberPendingDb,
  userId: string,
  now: Date,
): Promise<string | null> {
  const latest = await db.booking.findFirst({
    where: {
      userId,
      status: BookingStatus.COMPLETED,
      session: { endsAt: { lte: now } },
    },
    orderBy: { session: { endsAt: 'desc' } },
    select: { session: { select: { endsAt: true } } },
  });
  return latest?.session.endsAt.toISOString() ?? null;
}

function findReviewableCompletedBookings(
  db: MemberPendingDb,
  userId: string,
  now: Date,
) {
  return db.booking.findMany({
    where: {
      userId,
      status: BookingStatus.COMPLETED,
      session: { endsAt: { lte: now } },
      OR: [
        { sessionReview: { is: null } },
        {
          sessionReview: {
            is: {
              status: {
                in: [SessionReviewStatus.EXPIRED, SessionReviewStatus.DISMISSED],
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
}

async function reopenClosedReviews(
  db: MemberPendingDb,
  bookings: readonly ReviewableCompletedBooking[],
): Promise<void> {
  const ids = bookings.flatMap((booking) =>
    booking.sessionReview ? [booking.sessionReview.id] : [],
  );
  if (ids.length === 0) {
    return;
  }
  await db.sessionReview.updateMany({
    where: { id: { in: ids } },
    data: { status: SessionReviewStatus.PENDING },
  });
}

async function createMissingReviews(
  db: MemberPendingDb,
  userId: string,
  bookings: readonly ReviewableCompletedBooking[],
): Promise<void> {
  const missing = bookings.filter((booking) => booking.sessionReview === null);
  if (missing.length === 0) {
    return;
  }
  await db.sessionReview.createMany({
    data: missing.map((booking) => ({
      bookingId: booking.id,
      authorUserId: userId,
      sessionId: booking.session.id,
      coachProfileId:
        booking.session.substituteCoachId ?? booking.session.coachId,
    })),
    skipDuplicates: true,
  });
}
