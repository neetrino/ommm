import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role, UserPackageStatus } from '@prisma/client';
import { OWNER_BOOKING_GUEST_PASS_SLOT } from '../bookings/bookings-guest-pass.constants';
import type { UserPackageWithPlanAndBalances } from '../packages/package-usage.helpers';
import type { PrismaService } from '../prisma/prisma.service';
import { RETROACTIVE_ATTACH_ERROR } from './clients-bookings-retroactive.constants';
import {
  isRetroactiveSessionInLookback,
  isRetroactiveSessionStarted,
  isRetroactiveSessionStatusAllowed,
} from './clients-bookings-retroactive.helpers';

const USER_PACKAGE_BALANCE_SELECT = {
  id: true,
  classTypeId: true,
  sourceCategoryNameSnapshot: true,
  sessionsTotal: true,
  sessionsUsed: true,
  sessionsRemaining: true,
  isUnlimited: true,
} as const;

const USER_PACKAGE_PLAN_SELECT = {
  id: true,
  name: true,
  categoryName: true,
  isUnlimited: true,
} as const;

export const RETROACTIVE_SESSION_CLASS_TYPE_SELECT = {
  id: true,
  name: true,
} as const;

export type RetroactiveLoadedSession = {
  id: string;
  startsAt: Date;
  status: string;
  priceCents: number;
  sessionRequirement: number | null;
  classType: { id: string; name: string };
};

export async function assertRetroactiveClientExists(
  prisma: PrismaService,
  clientId: string,
): Promise<void> {
  const client = await prisma.user.findFirst({
    where: { id: clientId, role: Role.USER },
    select: { id: true },
  });
  if (client === null) {
    throw new NotFoundException(RETROACTIVE_ATTACH_ERROR.CLIENT_NOT_FOUND);
  }
}

export async function loadActivePackageForRetroactive(
  prisma: PrismaService,
  clientId: string,
  packageId: string,
): Promise<UserPackageWithPlanAndBalances> {
  const membership = await prisma.userPackage.findFirst({
    where: { id: packageId, userId: clientId },
    include: {
      plan: { select: USER_PACKAGE_PLAN_SELECT },
      balances: { select: USER_PACKAGE_BALANCE_SELECT },
    },
  });
  if (membership === null) {
    throw new NotFoundException(RETROACTIVE_ATTACH_ERROR.PACKAGE_NOT_FOUND);
  }
  if (membership.status !== UserPackageStatus.ACTIVE) {
    throw new BadRequestException(RETROACTIVE_ATTACH_ERROR.PACKAGE_NOT_ACTIVE);
  }
  return membership;
}

export async function loadSessionForRetroactiveAttach(
  prisma: PrismaService,
  sessionId: string,
  now: Date,
): Promise<RetroactiveLoadedSession> {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: { classType: { select: RETROACTIVE_SESSION_CLASS_TYPE_SELECT } },
  });
  if (session === null) {
    throw new NotFoundException(RETROACTIVE_ATTACH_ERROR.SESSION_NOT_FOUND);
  }
  if (!isRetroactiveSessionStatusAllowed(session.status)) {
    throw new BadRequestException(
      RETROACTIVE_ATTACH_ERROR.SESSION_NOT_ATTACHABLE,
    );
  }
  if (!isRetroactiveSessionStarted(session.startsAt, now)) {
    throw new BadRequestException(RETROACTIVE_ATTACH_ERROR.SESSION_NOT_STARTED);
  }
  if (!isRetroactiveSessionInLookback(session.startsAt, now)) {
    throw new BadRequestException(
      RETROACTIVE_ATTACH_ERROR.SESSION_OUTSIDE_WINDOW,
    );
  }
  return session;
}

export async function loadOwnerBookingsBySession(
  prisma: PrismaService,
  clientId: string,
  sessionIds: string[],
): Promise<Map<string, { consumptions: Array<{ restoredAt: Date | null }> }>> {
  if (sessionIds.length === 0) {
    return new Map();
  }
  const rows = await prisma.booking.findMany({
    where: {
      userId: clientId,
      sessionId: { in: sessionIds },
      guestPassSlot: OWNER_BOOKING_GUEST_PASS_SLOT,
    },
    select: {
      sessionId: true,
      consumptions: { select: { restoredAt: true } },
    },
  });
  return new Map(rows.map((row) => [row.sessionId, row]));
}
