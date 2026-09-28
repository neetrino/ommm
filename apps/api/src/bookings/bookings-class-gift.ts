import type { Prisma } from '@prisma/client';
import {
  peekGiftClassSessions,
  reserveGiftClassSessions,
} from '../gift-cards/gift-card-class-credit';
import type { UserPackageWithPlanAndBalances } from '../packages/package-usage.helpers';
import {
  resolveBookingSessionCredits,
  shouldValidatePackageForBooking,
} from './resolve-booking-session-credits';

type CreditSession = Parameters<typeof resolveBookingSessionCredits>[0]['session'];

export type BookingCreditSplit = {
  packageSessions: number;
  giftSessions: number;
  usePackageCredit: boolean;
};

type GiftPeekDb = Pick<Prisma.TransactionClient, 'giftCard'>;

/** Class-gift sessions are used first. A package covers only the remainder. */
export async function resolveBookingCreditSplit(
  db: GiftPeekDb,
  params: {
    userId: string;
    classTypeId: string;
    session: CreditSession;
    userPackageId?: string;
  },
): Promise<BookingCreditSplit> {
  const requiredSessions = resolveBookingSessionCredits({
    session: params.session,
    userPackageId: params.userPackageId,
  });
  const available = await peekGiftClassSessions(db, {
    userId: params.userId,
    classTypeId: params.classTypeId,
  });
  const giftSessions = Math.min(available, requiredSessions);
  const packageSessions = requiredSessions - giftSessions;
  return {
    packageSessions,
    giftSessions,
    usePackageCredit:
      packageSessions > 0 &&
      shouldValidatePackageForBooking({
        session: params.session,
        userPackageId: params.userPackageId,
      }),
  };
}

export async function applyBookingCredits(
  tx: Prisma.TransactionClient,
  params: {
    bookingId: string;
    userId: string;
    classTypeId: string;
    membership: UserPackageWithPlanAndBalances | null;
    packageSessions: number;
    giftSessions: number;
    consumePackage: (
      membership: UserPackageWithPlanAndBalances,
      sessions: number,
    ) => Promise<void>;
  },
): Promise<void> {
  if (params.giftSessions > 0) {
    await reserveGiftClassSessions(tx, {
      userId: params.userId,
      classTypeId: params.classTypeId,
      sessions: params.giftSessions,
      orderId: params.bookingId,
    });
  }
  if (params.membership !== null && params.packageSessions > 0) {
    await params.consumePackage(params.membership, params.packageSessions);
  }
}
