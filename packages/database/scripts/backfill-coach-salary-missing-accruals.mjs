/**
 * Fixes missing payroll lines: coach salary is written only at the moment a
 * class flips to FINISHED, and until now nothing retried it. Classes that
 * ended before the coach's per-class rate existed (or before attendance was
 * marked) were left with no CoachSalaryAccrual row at all, so the coach's
 * total under-reported real work.
 *
 * This creates the missing accrual for every finished class that qualifies
 * under the current rule (at least one COMPLETED booking and a configured
 * rate), but ONLY for coach+month periods that have not been paid out yet —
 * a closed, already-paid month is never re-opened by this script.
 *
 * Usage (from packages/database):
 *   pnpm exec dotenv -- -e ../../.env -- pnpm exec tsx scripts/backfill-coach-salary-missing-accruals.mjs --dry-run
 *   pnpm exec dotenv -- -e ../../.env -- pnpm exec tsx scripts/backfill-coach-salary-missing-accruals.mjs
 */
import { BookingStatus, ClassSessionStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

/** Payroll months follow studio wall clock, matching salaryPeriodFromInstant. */
const STUDIO_TIMEZONE = "Asia/Yerevan";
const STUDIO_CALENDAR_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: STUDIO_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function salaryPeriodFromInstant(value) {
  const calendarDate = STUDIO_CALENDAR_DATE.format(value);
  return {
    year: Number.parseInt(calendarDate.slice(0, 4), 10),
    month: Number.parseInt(calendarDate.slice(5, 7), 10),
  };
}

function periodKey(coachProfileId, periodYear, periodMonth) {
  return `${coachProfileId}:${periodYear}-${String(periodMonth).padStart(2, "0")}`;
}

async function loadPaidPeriods() {
  const payouts = await prisma.coachSalaryPayout.findMany({
    select: { coachProfileId: true, periodYear: true, periodMonth: true },
  });
  return new Set(
    payouts.map((row) =>
      periodKey(row.coachProfileId, row.periodYear, row.periodMonth),
    ),
  );
}

async function loadRates() {
  const rates = await prisma.coachClassTypeRate.findMany({
    select: { coachProfileId: true, classTypeId: true, amountAmd: true },
  });
  return new Map(
    rates.map((rate) => [
      `${rate.coachProfileId}:${rate.classTypeId}`,
      rate.amountAmd,
    ]),
  );
}

async function main() {
  const [paidPeriods, rateByCoachClassType] = await Promise.all([
    loadPaidPeriods(),
    loadRates(),
  ]);

  const sessions = await prisma.classSession.findMany({
    where: {
      status: ClassSessionStatus.FINISHED,
      salaryAccrual: null,
    },
    select: {
      id: true,
      startsAt: true,
      coachId: true,
      classTypeId: true,
      classType: { select: { name: true } },
      coach: { select: { user: { select: { name: true, lastName: true } } } },
      _count: {
        select: { bookings: { where: { status: BookingStatus.COMPLETED } } },
      },
    },
    orderBy: { startsAt: "asc" },
  });

  const toCreate = [];
  const skippedPaid = [];
  const skippedNoRate = [];
  const skippedNoAttendance = [];

  for (const session of sessions) {
    const amountAmd =
      rateByCoachClassType.get(`${session.coachId}:${session.classTypeId}`) ?? 0;
    const period = salaryPeriodFromInstant(session.startsAt);
    const row = {
      sessionId: session.id,
      coach: [session.coach.user.name, session.coach.user.lastName]
        .filter(Boolean)
        .join(" "),
      coachProfileId: session.coachId,
      month: `${period.year}-${String(period.month).padStart(2, "0")}`,
      startsAt: session.startsAt.toISOString(),
      classType: session.classType.name,
      attendedBookings: session._count.bookings,
      amountAmd,
    };
    if (session._count.bookings === 0) {
      skippedNoAttendance.push(row);
      continue;
    }
    if (amountAmd <= 0) {
      skippedNoRate.push(row);
      continue;
    }
    if (paidPeriods.has(periodKey(session.coachId, period.year, period.month))) {
      skippedPaid.push(row);
      continue;
    }
    toCreate.push({ ...row, periodYear: period.year, periodMonth: period.month });
  }

  if (!dryRun && toCreate.length > 0) {
    await prisma.coachSalaryAccrual.createMany({
      data: toCreate.map((row) => ({
        coachProfileId: row.coachProfileId,
        classSessionId: row.sessionId,
        amountAmd: row.amountAmd,
        periodYear: row.periodYear,
        periodMonth: row.periodMonth,
      })),
      skipDuplicates: true,
    });
  }

  const totalsByCoach = {};
  for (const row of toCreate) {
    const key = `${row.coach} ${row.month}`;
    totalsByCoach[key] = (totalsByCoach[key] ?? 0) + row.amountAmd;
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        createdCount: toCreate.length,
        createdAmountAmdTotal: toCreate.reduce(
          (sum, row) => sum + row.amountAmd,
          0,
        ),
        totalsByCoachMonth: totalsByCoach,
        skippedAlreadyPaidCount: skippedPaid.length,
        skippedNoRateCount: skippedNoRate.length,
        skippedNoAttendanceCount: skippedNoAttendance.length,
        created: toCreate,
        skippedAlreadyPaid: skippedPaid,
        /** Attended classes left unpaid because the coach has no rate for that class type. */
        skippedNoRate,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
