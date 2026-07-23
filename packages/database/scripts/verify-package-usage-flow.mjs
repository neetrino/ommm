import { BookingStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEFAULT_CANCELLATION_PENALTY_HOURS = 24;

function resolveCancellationPenaltyHours(studioValue) {
  return studioValue ?? DEFAULT_CANCELLATION_PENALTY_HOURS;
}

function sessionWallClockStartMs(startsAt) {
  return Date.UTC(
    startsAt.getUTCFullYear(),
    startsAt.getUTCMonth(),
    startsAt.getUTCDate(),
    startsAt.getUTCHours(),
    startsAt.getUTCMinutes(),
  );
}

function viewerWallClockNowMs(now) {
  return Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  );
}

function isPenalizedCancellation(startsAt, penaltyHours, now = new Date()) {
  const startMs = sessionWallClockStartMs(startsAt);
  const nowMs = viewerWallClockNowMs(now);
  const freeCancelDeadlineMs = startMs - penaltyHours * 60 * 60 * 1000;
  return nowMs > freeCancelDeadlineMs;
}

function computeUsed(total, remaining) {
  if (total === null || remaining === null) {
    return null;
  }
  return Math.max(total - remaining, 0);
}

const checks = [];

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
}

const studio = await prisma.studioSettings.findFirst();
const penaltyHours = resolveCancellationPenaltyHours(studio?.cancellationHoursNotice);

const activeBookings = await prisma.booking.findMany({
  where: { status: BookingStatus.BOOKED },
  include: {
    consumptions: { where: { restoredAt: null } },
    session: { include: { classType: true } },
    user: { select: { email: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
});

for (const booking of activeBookings) {
  const hasConsumption = booking.consumptions.length > 0;
  const packages = await prisma.userPackage.findMany({
    where: {
      userId: booking.userId,
      status: 'ACTIVE',
      currentPeriodStart: { lte: booking.createdAt },
      currentPeriodEnd: { gt: booking.createdAt },
    },
    include: { balances: true },
  });
  const coversClass = packages.some((pkg) =>
    pkg.balances.some(
      (balance) =>
        balance.sourceCategoryNameSnapshot.trim().toLowerCase() ===
        booking.session.classType.name.trim().toLowerCase(),
    ),
  );

  if (coversClass && !hasConsumption) {
    fail(
      `booking ${booking.id} (${booking.user.email})`,
      `active package booking for ${booking.session.classType.name} has no consumption`,
    );
  } else if (coversClass) {
    pass(
      `booking ${booking.id} (${booking.user.email})`,
      `consumption linked (${booking.consumptions[0]?.consumedSessions ?? 0} sessions)`,
    );
  }
}

const userPackage = await prisma.userPackage.findFirst({
  where: { userId: 'cmracx2fs0001okfkzhi17arl', status: 'ACTIVE' },
  include: { balances: true },
  orderBy: { createdAt: 'desc' },
});

if (userPackage) {
  const used = computeUsed(userPackage.sessionsTotal, userPackage.sessionsRemaining);
  const activeBookingCount = await prisma.booking.count({
    where: {
      userId: userPackage.userId,
      status: BookingStatus.BOOKED,
      consumptions: { some: { restoredAt: null, userPackageId: userPackage.id } },
    },
  });
  if (used === activeBookingCount) {
    pass(
      'user package used count',
      `Used ${used} matches ${activeBookingCount} active consumed booking(s)`,
    );
  } else {
    fail(
      'user package used count',
      `Used ${used} but ${activeBookingCount} active consumed booking(s)`,
    );
  }
}

const tomorrowClass = new Date(Date.UTC(2026, 6, 8, 8, 0, 0, 0));
const todayAfternoon = new Date(2026, 6, 7, 13, 0, 0, 0);
const farClass = new Date(Date.UTC(2026, 6, 10, 12, 0, 0, 0));

if (isPenalizedCancellation(tomorrowClass, penaltyHours, todayAfternoon)) {
  pass(
    'penalty window example (Jul 7 13:00 -> Jul 8 12:00)',
    'penalized cancellation keeps Used spent',
  );
} else {
  fail(
    'penalty window example (Jul 7 13:00 -> Jul 8 12:00)',
    'expected penalized=true',
  );
}

if (!isPenalizedCancellation(farClass, penaltyHours, todayAfternoon)) {
  pass(
    'free cancel example (Jul 7 13:00 -> Jul 10 12:00)',
    'free cancellation restores Used',
  );
} else {
  fail(
    'free cancel example (Jul 7 13:00 -> Jul 10 12:00)',
    'expected penalized=false',
  );
}

const failed = checks.filter((check) => !check.ok);
console.log(JSON.stringify({ penaltyHours, checks, passed: failed.length === 0 }, null, 2));
await prisma.$disconnect();
process.exit(failed.length === 0 ? 0 : 1);
