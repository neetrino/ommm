import { BookingStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function pickBalance(membership, classTypeName) {
  const normalized = classTypeName.trim().toLowerCase();
  const exact = membership.balances.find(
    (balance) =>
      balance.sourceCategoryNameSnapshot.trim().toLowerCase() === normalized,
  );
  if (exact !== undefined) {
    return exact;
  }
  if (membership.balances.length > 1) {
    return null;
  }
  return membership.balances[0] ?? null;
}

function membershipCoversSessionType(membership, classTypeName) {
  const normalized = classTypeName.trim().toLowerCase();
  if (membership.balances.length > 1) {
    return membership.balances.some(
      (balance) =>
        balance.sourceCategoryNameSnapshot.trim().toLowerCase() === normalized,
    );
  }
  return membership.planCategoryNameSnapshot.trim().toLowerCase() === normalized;
}

function resolveRequiredSessions(priceCents, sessionRequirement) {
  if (sessionRequirement !== null) {
    return sessionRequirement;
  }
  if (priceCents > 0) {
    return 1;
  }
  return 1;
}

async function resolveMembership(tx, userId, classTypeName, at) {
  const memberships = await tx.userPackage.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      currentPeriodStart: { lte: at },
      currentPeriodEnd: { gt: at },
    },
    select: {
      id: true,
      planCategoryNameSnapshot: true,
      balances: {
        select: {
          id: true,
          sourceCategoryNameSnapshot: true,
          sessionsRemaining: true,
          isUnlimited: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const covering = memberships.filter((membership) =>
    membershipCoversSessionType(membership, classTypeName),
  );
  const bookable = covering.filter((membership) => {
    const balance = pickBalance(membership, classTypeName);
    if (balance === null) {
      return false;
    }
    if (balance.isUnlimited || balance.sessionsRemaining === null) {
      return true;
    }
    return balance.sessionsRemaining > 0;
  });

  return bookable[0] ?? null;
}

const bookings = await prisma.booking.findMany({
  where: { status: BookingStatus.BOOKED },
  include: {
    consumptions: { where: { restoredAt: null } },
    session: { include: { classType: true } },
  },
  orderBy: { createdAt: 'asc' },
});

let applied = 0;
let skipped = 0;

for (const booking of bookings) {
  if (booking.consumptions.length > 0) {
    skipped += 1;
    continue;
  }

  const requiredSessions = resolveRequiredSessions(
    booking.session.priceCents,
    booking.session.sessionRequirement,
  );
  if (requiredSessions <= 0) {
    skipped += 1;
    continue;
  }

  const didApply = await prisma.$transaction(async (tx) => {
    const pending = await tx.bookingConsumption.findMany({
      where: { bookingId: booking.id, restoredAt: null },
    });
    if (pending.length > 0) {
      return false;
    }

    const membership = await resolveMembership(
      tx,
      booking.userId,
      booking.session.classType.name,
      booking.createdAt,
    );
    if (membership === null) {
      return false;
    }

    const balance = pickBalance(membership, booking.session.classType.name);
    if (balance === null) {
      return false;
    }

    if (!balance.isUnlimited && balance.sessionsRemaining !== null) {
      if (balance.sessionsRemaining < requiredSessions) {
        return false;
      }
      await tx.userPackageBalance.update({
        where: { id: balance.id },
        data: {
          sessionsUsed: { increment: requiredSessions },
          sessionsRemaining: { decrement: requiredSessions },
        },
      });
      await tx.userPackage.update({
        where: { id: membership.id },
        data: { sessionsRemaining: { decrement: requiredSessions } },
      });
    }

    await tx.bookingConsumption.create({
      data: {
        bookingId: booking.id,
        userPackageId: membership.id,
        userPackageBalanceId: balance.id,
        consumedSessions:
          balance.isUnlimited || balance.sessionsRemaining === null
            ? 0
            : requiredSessions,
        consumedAt: booking.createdAt,
      },
    });
    console.log(
      `backfilled booking=${booking.id} class=${booking.session.classType.name} package=${membership.id}`,
    );
    return true;
  });

  if (didApply) {
    applied += 1;
  } else {
    skipped += 1;
  }
}

console.log(JSON.stringify({ applied, skipped, total: bookings.length }, null, 2));
await prisma.$disconnect();
