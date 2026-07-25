/**
 * Dev E2E: create sessions for package class types, book every ACTIVE package,
 * verify, then restore credits and delete test data.
 *
 * No real payments. Safe for local/dev DB only.
 */
import {
  BookingChannel,
  BookingStatus,
  ClassSessionStatus,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();
const TEST_MARKER = '[E2E-PACKAGE-BOOKING]';
const KEEP = process.argv.includes('--keep');

function membershipCoversSessionType(membership, classType) {
  if (membership.balances.some((b) => b.classTypeId !== null)) {
    return membership.balances.some(
      (b) => b.classTypeId !== null && b.classTypeId === classType.id,
    );
  }
  const normalized = classType.name.trim().toLowerCase();
  return membership.balances.some(
    (b) => b.sourceCategoryNameSnapshot.trim().toLowerCase() === normalized,
  );
}

function hasAnyBookableCredit(membership, classType) {
  const balance = membership.balances.find(
    (b) => b.classTypeId !== null && b.classTypeId === classType.id,
  );
  if (!balance) {
    return false;
  }
  if (balance.isUnlimited || balance.sessionsRemaining === null) {
    return true;
  }
  return balance.sessionsRemaining > 0;
}

async function cleanupPrevious() {
  const oldSessions = await prisma.classSession.findMany({
    where: { title: { contains: TEST_MARKER } },
    select: { id: true },
  });
  const sessionIds = oldSessions.map((s) => s.id);
  if (sessionIds.length === 0) return;
  const bookings = await prisma.booking.findMany({
    where: { sessionId: { in: sessionIds } },
    select: { id: true },
  });
  const bookingIds = bookings.map((b) => b.id);
  if (bookingIds.length > 0) {
    await prisma.bookingConsumption.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  }
  await prisma.classSession.deleteMany({ where: { id: { in: sessionIds } } });
}

async function main() {
  const now = new Date();
  await cleanupPrevious();

  const coach = await prisma.coachProfile.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  if (!coach) {
    throw new Error('No active coach found');
  }

  const packages = await prisma.userPackage.findMany({
    where: {
      status: 'ACTIVE',
      currentPeriodStart: { lte: now },
      currentPeriodEnd: { gt: now },
    },
    select: {
      id: true,
      planNameSnapshot: true,
      planCategoryNameSnapshot: true,
      sessionsRemaining: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      user: { select: { id: true, email: true } },
      balances: {
        select: {
          id: true,
          classTypeId: true,
          sourceCategoryNameSnapshot: true,
          sessionsRemaining: true,
          sessionsUsed: true,
          isUnlimited: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const neededIds = [
    ...new Set(
      packages.flatMap((pkg) =>
        pkg.balances
          .filter(
            (b) =>
              b.classTypeId &&
              (b.isUnlimited || (b.sessionsRemaining ?? 0) > 0),
          )
          .map((b) => b.classTypeId),
      ),
    ),
  ];

  const classTypes = await prisma.classType.findMany({
    where: { id: { in: neededIds } },
    select: { id: true, name: true },
  });

  const startsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  startsAt.setUTCMinutes(0, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

  const sessionsByClassTypeId = new Map();
  let hourOffset = 0;
  for (const classType of classTypes) {
    const sessionStarts = new Date(
      startsAt.getTime() + hourOffset * 60 * 60 * 1000,
    );
    const sessionEnds = new Date(sessionStarts.getTime() + 60 * 60 * 1000);
    const session = await prisma.classSession.create({
      data: {
        title: `${TEST_MARKER} ${classType.name}`,
        classTypeId: classType.id,
        coachId: coach.id,
        startsAt: sessionStarts,
        endsAt: sessionEnds,
        capacity: 100,
        priceCents: 0,
        sessionRequirement: 1,
        status: ClassSessionStatus.ACTIVE,
      },
    });
    sessionsByClassTypeId.set(classType.id, {
      ...session,
      classType,
    });
    hourOffset += 1;
  }

  const results = [];
  for (const pkg of packages) {
    const email = pkg.user.email;
    const candidate = [...sessionsByClassTypeId.values()].find((session) => {
      const membership = {
        ...pkg,
        plan: null,
        balances: pkg.balances,
      };
      return (
        membershipCoversSessionType(membership, session.classType) &&
        hasAnyBookableCredit(membership, session.classType)
      );
    });
    if (!candidate) {
      results.push({
        email,
        plan: pkg.planNameSnapshot,
        ok: false,
        error: 'No eligible session via classTypeId helpers',
      });
      continue;
    }

    const session = candidate;
    const bookableBalance = pkg.balances.find(
      (b) =>
        b.classTypeId === session.classType.id &&
        (b.isUnlimited || (b.sessionsRemaining ?? 0) > 0),
    );
    if (!bookableBalance) {
      results.push({
        email,
        plan: pkg.planNameSnapshot,
        ok: false,
        error: 'Eligible session found but no matching balance row',
      });
      continue;
    }

    const beforeRemaining = bookableBalance.sessionsRemaining;
    const beforePackageRemaining = pkg.sessionsRemaining;

    try {
      if (
        pkg.currentPeriodStart > session.startsAt ||
        pkg.currentPeriodEnd <= session.startsAt
      ) {
        throw new Error('Package period does not cover session');
      }

      const booking = await prisma.$transaction(async (tx) => {
        const created = await tx.booking.create({
          data: {
            userId: pkg.user.id,
            sessionId: session.id,
            status: BookingStatus.BOOKED,
            channel: BookingChannel.WEBSITE,
          },
        });

        await tx.userPackageBalance.update({
          where: { id: bookableBalance.id },
          data: {
            sessionsUsed: { increment: 1 },
            sessionsRemaining: { decrement: 1 },
          },
        });
        await tx.userPackage.update({
          where: { id: pkg.id },
          data: { sessionsRemaining: { decrement: 1 } },
        });
        await tx.bookingConsumption.create({
          data: {
            bookingId: created.id,
            userPackageId: pkg.id,
            userPackageBalanceId: bookableBalance.id,
            consumedSessions: 1,
          },
        });
        return created;
      });

      const afterBalance = await prisma.userPackageBalance.findUnique({
        where: { id: bookableBalance.id },
        select: { sessionsRemaining: true },
      });
      const afterPkg = await prisma.userPackage.findUnique({
        where: { id: pkg.id },
        select: { sessionsRemaining: true },
      });

      const remainingOk =
        beforeRemaining === null ||
        afterBalance?.sessionsRemaining === beforeRemaining - 1;
      const packageOk =
        beforePackageRemaining === null ||
        afterPkg?.sessionsRemaining === beforePackageRemaining - 1;

      results.push({
        email,
        plan: pkg.planNameSnapshot,
        ok: remainingOk && packageOk,
        bookingId: booking.id,
        classType: session.classType.name,
        sessionId: session.id,
        balanceBefore: beforeRemaining,
        balanceAfter: afterBalance?.sessionsRemaining ?? null,
        error:
          remainingOk && packageOk
            ? undefined
            : 'Credit decrement mismatch',
      });
    } catch (error) {
      results.push({
        email,
        plan: pkg.planNameSnapshot,
        ok: false,
        classType: session.classType.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  if (!KEEP) {
    // Restore credits then delete test data
    for (const row of results) {
      if (!row.bookingId) continue;
      const consumptions = await prisma.bookingConsumption.findMany({
        where: { bookingId: row.bookingId, restoredAt: null },
      });
      for (const c of consumptions) {
        if (c.consumedSessions > 0 && c.userPackageBalanceId) {
          await prisma.userPackageBalance.update({
            where: { id: c.userPackageBalanceId },
            data: {
              sessionsUsed: { decrement: c.consumedSessions },
              sessionsRemaining: { increment: c.consumedSessions },
            },
          });
          await prisma.userPackage.update({
            where: { id: c.userPackageId },
            data: {
              sessionsRemaining: { increment: c.consumedSessions },
            },
          });
        }
        await prisma.bookingConsumption.update({
          where: { id: c.id },
          data: { restoredAt: new Date() },
        });
      }
    }
    await cleanupPrevious();
  }

  console.log(
    JSON.stringify(
      {
        summary: {
          packages: packages.length,
          sessionsCreated: sessionsByClassTypeId.size,
          passed,
          failed: failed.length,
          cleanedUp: !KEEP,
        },
        sessions: [...sessionsByClassTypeId.values()].map((s) => ({
          id: s.id,
          classType: s.classType.name,
          startsAt: s.startsAt,
        })),
        failures: failed,
        successes: results.filter((r) => r.ok).map((r) => ({
          email: r.email,
          plan: r.plan,
          classType: r.classType,
          balanceBefore: r.balanceBefore,
          balanceAfter: r.balanceAfter,
        })),
      },
      null,
      2,
    ),
  );

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
