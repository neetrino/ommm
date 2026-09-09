/**
 * Read-only audit of coach salary for one month. Compares, per coach:
 *   - accruedNow: what CoachSalaryAccrual actually holds
 *   - expectedNewRule: finished sessions with >=1 COMPLETED booking x rate
 *   - expectedOldRule: finished sessions with >=1 non-cancelled booking x rate
 *   - notFinishedYet: sessions in the month that have not finished (cannot accrue yet)
 *
 * Usage (from packages/database):
 *   pnpm exec dotenv -- -e ../../.env -- pnpm exec tsx scripts/verify-coach-salary-september.mjs 2026-09
 */
import { BookingStatus, ClassSessionStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const month = process.argv[2] ?? "2026-09";
const [year, monthNo] = month.split("-").map((part) => Number(part));
const from = new Date(Date.UTC(year, monthNo - 1, 1));
const to = new Date(Date.UTC(year, monthNo, 1));

async function main() {
  const coaches = await prisma.coachProfile.findMany({
    select: {
      id: true,
      user: { select: { name: true, lastName: true } },
      classTypeRates: { select: { classTypeId: true, amountAmd: true } },
    },
  });

  const report = [];
  for (const coach of coaches) {
    const rateByClassType = new Map(
      coach.classTypeRates.map((rate) => [rate.classTypeId, rate.amountAmd]),
    );

    const sessions = await prisma.classSession.findMany({
      where: { coachId: coach.id, startsAt: { gte: from, lt: to } },
      select: {
        id: true,
        startsAt: true,
        status: true,
        classTypeId: true,
        classType: { select: { name: true } },
        salaryAccrual: { select: { amountAmd: true } },
        bookings: {
          where: { status: { not: BookingStatus.CANCELLED } },
          select: { status: true },
        },
      },
      orderBy: { startsAt: "asc" },
    });

    let accruedNow = 0;
    let expectedNewRule = 0;
    let expectedOldRule = 0;
    let notFinishedYet = 0;
    let cancelledSessions = 0;
    let noRateSessions = 0;
    const missingAccruals = [];
    const noShowOnlySessions = [];

    for (const session of sessions) {
      const rateAmd = rateByClassType.get(session.classTypeId) ?? 0;
      const attended = session.bookings.filter(
        (booking) => booking.status === BookingStatus.COMPLETED,
      ).length;
      const registered = session.bookings.length;
      accruedNow += session.salaryAccrual?.amountAmd ?? 0;

      if (session.status === ClassSessionStatus.CANCELLED) {
        cancelledSessions += 1;
        continue;
      }
      if (session.status !== ClassSessionStatus.FINISHED) {
        notFinishedYet += 1;
        continue;
      }
      if (rateAmd <= 0) {
        noRateSessions += 1;
        continue;
      }
      if (registered > 0) {
        expectedOldRule += rateAmd;
      }
      if (attended > 0) {
        expectedNewRule += rateAmd;
        if (!session.salaryAccrual) {
          missingAccruals.push({
            sessionId: session.id,
            startsAt: session.startsAt.toISOString(),
            classType: session.classType.name,
            rateAmd,
            attended,
          });
        }
      } else if (registered > 0) {
        noShowOnlySessions.push({
          sessionId: session.id,
          startsAt: session.startsAt.toISOString(),
          classType: session.classType.name,
          rateAmd,
          registered,
        });
      }
    }

    report.push({
      coach: [coach.user.name, coach.user.lastName].filter(Boolean).join(" "),
      sessionsInMonth: sessions.length,
      notFinishedYet,
      cancelledSessions,
      noRateSessions,
      accruedNow,
      expectedNewRule,
      expectedOldRule,
      oldVsNewDifference: expectedOldRule - expectedNewRule,
      missingAccrualAmount: expectedNewRule - accruedNow,
      missingAccrualCount: missingAccruals.length,
      missingAccruals,
      noShowOnlySessions,
    });
  }

  console.log(JSON.stringify({ month, from: from.toISOString(), to: to.toISOString(), report }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
