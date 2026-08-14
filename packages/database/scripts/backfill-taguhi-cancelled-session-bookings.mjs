/**
 * One-off: Taguhi Sukiasyan cancelled classes on 2026-08-21, 28, 29.
 * Cancels leftover BOOKED rows and restores unrestored package consumptions.
 *
 * Usage (from packages/database):
 *   pnpm exec dotenv -- -e ../../.env -- pnpm exec tsx scripts/backfill-taguhi-cancelled-session-bookings.mjs --dry-run
 *   pnpm exec dotenv -- -e ../../.env -- pnpm exec tsx scripts/backfill-taguhi-cancelled-session-bookings.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

const RANGE_START = new Date("2026-08-21T00:00:00.000Z");
const RANGE_END = new Date("2026-08-30T00:00:00.000Z");
const TARGET_DAYS = new Set([21, 28, 29]);

async function restoreConsumptions(bookingId) {
  const consumptions = await prisma.bookingConsumption.findMany({
    where: { bookingId, restoredAt: null },
    orderBy: { createdAt: "asc" },
  });
  for (const consumption of consumptions) {
    if (consumption.consumedSessions > 0 && consumption.userPackageBalanceId) {
      await prisma.userPackageBalance.update({
        where: { id: consumption.userPackageBalanceId },
        data: {
          sessionsUsed: { decrement: consumption.consumedSessions },
          sessionsRemaining: { increment: consumption.consumedSessions },
        },
      });
      await prisma.userPackage.update({
        where: { id: consumption.userPackageId },
        data: {
          sessionsRemaining: { increment: consumption.consumedSessions },
        },
      });
    }
    await prisma.bookingConsumption.update({
      where: { id: consumption.id },
      data: { restoredAt: new Date() },
    });
  }
  return consumptions.length;
}

async function main() {
  const sessions = await prisma.classSession.findMany({
    where: {
      status: "CANCELLED",
      startsAt: { gte: RANGE_START, lt: RANGE_END },
      coach: { user: { name: { contains: "Taguhi", mode: "insensitive" } } },
    },
    include: {
      classType: { select: { name: true } },
      bookings: {
        include: {
          user: { select: { name: true, lastName: true, email: true } },
          consumptions: {
            where: { restoredAt: null },
            select: { id: true, consumedSessions: true },
          },
        },
      },
      waitlistEntries: {
        where: { status: { in: ["ACTIVE", "OFFERED"] } },
        select: { id: true },
      },
    },
    orderBy: { startsAt: "asc" },
  });

  const targetSessions = sessions.filter((session) =>
    TARGET_DAYS.has(session.startsAt.getUTCDate()),
  );

  const summary = [];
  for (const session of targetSessions) {
    const row = {
      startsAt: session.startsAt.toISOString(),
      classType: session.classType.name,
      cancelledBookings: 0,
      restoredConsumptions: 0,
      expiredWaitlist: session.waitlistEntries.length,
      people: [],
    };
    for (const booking of session.bookings) {
      const person =
        [booking.user.name, booking.user.lastName].filter(Boolean).join(" ") ||
        booking.user.email;
      if (booking.status === "BOOKED") {
        row.people.push({ person, action: "cancel+restore" });
        if (!dryRun) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: "CANCELLED", cancelledAt: new Date() },
          });
          row.restoredConsumptions += await restoreConsumptions(booking.id);
        }
        row.cancelledBookings += 1;
        continue;
      }
      if (booking.status === "CANCELLED" && booking.consumptions.length > 0) {
        row.people.push({ person, action: "restore" });
        if (!dryRun) {
          row.restoredConsumptions += await restoreConsumptions(booking.id);
        } else {
          row.restoredConsumptions += booking.consumptions.length;
        }
      }
    }
    if (!dryRun && session.waitlistEntries.length > 0) {
      await prisma.waitlistEntry.updateMany({
        where: {
          sessionId: session.id,
          status: { in: ["ACTIVE", "OFFERED"] },
        },
        data: { status: "EXPIRED" },
      });
    }
    summary.push(row);
  }

  console.log(JSON.stringify({ dryRun, sessionCount: targetSessions.length, summary }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
